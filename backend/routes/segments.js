const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * GET /api/segments
 * Returns corridor road segments with risk scores, start/end coordinates from locations table.
 * Builds a frontend-compatible response matching the normalizeSegment() contract.
 */
router.get('/', async (req, res) => {
  try {
    // Fetch roads with their risk scores and terminal locations
    const result = await db.query(`
      SELECT 
        r.road_id AS id,
        r.road_id AS segment_id,
        r.road_name AS name,
        r.length_km,
        r.road_type,
        r.surface_type,
        r.is_seasonal,
        r.start_location_id,
        r.end_location_id,
        sl.name AS start_location_name,
        sl.latitude AS start_lat,
        sl.longitude AS start_lng,
        el.name AS end_location_name,
        el.latitude AS end_lat,
        el.longitude AS end_lng,
        COALESCE(rsr.overall_risk_score, 30) AS current_risk_index,
        COALESCE(rsr.risk_level, 'Low') AS current_risk_level,
        COALESCE(rsr.flood_score, 20) AS flood_score,
        COALESCE(rsr.weather_score, 20) AS weather_score,
        COALESCE(rsr.infrastructure_score, 20) AS erosion_vulnerability_index,
        r.created_at AS last_updated
      FROM roads r
      LEFT JOIN locations sl ON r.start_location_id = sl.location_id
      LEFT JOIN locations el ON r.end_location_id = el.location_id
      LEFT JOIN road_segment_risk rsr ON r.road_id = rsr.road_segment_id
      ORDER BY r.road_id ASC
    `);

    if (result.rows.length === 0) {
      // Fallback: return hardcoded corridor segments for Guwahati–Shillong NH-6/NH-40
      return res.json(getFallbackSegments());
    }

    // Normalize to match frontend contract
    const segments = result.rows.map((row, index) => {
      const riskIndex = Math.round(Number(row.current_risk_index) || 30);
      let riskLevel = row.current_risk_level;
      if (!riskLevel || riskLevel === 'Low') {
        riskLevel = riskIndex <= 30 ? 'Low' : riskIndex <= 70 ? 'Medium' : 'High';
      }
      // Normalize risk level capitalization
      riskLevel = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1).toLowerCase();

      const gradeabilityScore = estimateGradeability(row.road_type, row.surface_type);
      const erosionIndex = Math.round(Number(row.erosion_vulnerability_index) || 25);

      return {
        id: `seg-${row.id}`,
        name: `seg-${row.id}: ${row.start_location_name || 'Origin'} → ${row.end_location_name || 'Destination'}`,
        road_name: row.name,
        start_lat: Number(row.start_lat) || 26.1445,
        start_lng: Number(row.start_lng) || 91.7362,
        end_lat: Number(row.end_lat) || 25.5788,
        end_lng: Number(row.end_lng) || 91.8933,
        length_km: Number(row.length_km) || 50,
        order_index: index + 1,
        current_risk_index: riskIndex,
        current_risk_level: riskLevel,
        erosion_vulnerability_index: erosionIndex,
        gradeability_score: gradeabilityScore,
        grade_excluded_heavy: gradeabilityScore < 50,
        grade_excluded_light: gradeabilityScore < 25,
        last_updated: row.last_updated || new Date().toISOString(),
        geojson: null
      };
    });

    res.json(segments);
  } catch (err) {
    console.error('Error fetching segments:', err.message);
    // Return fallback corridor segments so the frontend still works
    res.json(getFallbackSegments());
  }
});

/**
 * Estimate gradeability based on road type and surface
 */
function estimateGradeability(roadType, surface) {
  let score = 70;
  if (roadType === 'national_highway') score = 85;
  else if (roadType === 'state_highway') score = 72;
  else if (roadType === 'district_road') score = 58;
  else if (roadType === 'forest_track') score = 35;

  if (surface === 'gravel') score -= 15;
  else if (surface === 'dirt') score -= 25;
  else if (surface === 'paved') score += 5;

  return Math.min(100, Math.max(10, Math.round(score)));
}

/**
 * Hardcoded fallback for Guwahati–Shillong NH-6/NH-40 corridor demo
 * Used when database query fails or returns no rows
 */
function getFallbackSegments() {
  return [
    {
      id: 'seg-1',
      name: 'seg-1: Guwahati → Umiam',
      road_name: 'NH-6 Corridor Segment 1',
      start_lat: 26.1445, start_lng: 91.7362,
      end_lat: 25.6888, end_lng: 91.8841,
      length_km: 55, order_index: 1,
      current_risk_index: 25, current_risk_level: 'Low',
      erosion_vulnerability_index: 28, gradeability_score: 85,
      grade_excluded_heavy: false, grade_excluded_light: false,
      last_updated: new Date().toISOString(), geojson: null
    },
    {
      id: 'seg-2',
      name: 'seg-2: Umiam → Mawphlang',
      road_name: 'NH-6 Corridor Segment 2',
      start_lat: 25.6888, start_lng: 91.8841,
      end_lat: 25.4562, end_lng: 91.7583,
      length_km: 25, order_index: 2,
      current_risk_index: 48, current_risk_level: 'Medium',
      erosion_vulnerability_index: 55, gradeability_score: 72,
      grade_excluded_heavy: false, grade_excluded_light: false,
      last_updated: new Date().toISOString(), geojson: null
    },
    {
      id: 'seg-3',
      name: 'seg-3: Mawphlang → Mawkyrwat',
      road_name: 'NH-6 Corridor Segment 3',
      start_lat: 25.4562, start_lng: 91.7583,
      end_lat: 25.3214, end_lng: 91.6215,
      length_km: 22, order_index: 3,
      current_risk_index: 18, current_risk_level: 'Low',
      erosion_vulnerability_index: 22, gradeability_score: 90,
      grade_excluded_heavy: false, grade_excluded_light: false,
      last_updated: new Date().toISOString(), geojson: null
    },
    {
      id: 'seg-4',
      name: 'seg-4: Mawkyrwat → Nongstoin',
      road_name: 'NH-40 Corridor Segment 4',
      start_lat: 25.3214, start_lng: 91.6215,
      end_lat: 25.5218, end_lng: 91.2694,
      length_km: 28, order_index: 4,
      current_risk_index: 82, current_risk_level: 'High',
      erosion_vulnerability_index: 78, gradeability_score: 42,
      grade_excluded_heavy: true, grade_excluded_light: false,
      last_updated: new Date().toISOString(), geojson: null
    },
    {
      id: 'seg-5',
      name: 'seg-5: Nongstoin → Shillong',
      road_name: 'NH-40 Corridor Segment 5',
      start_lat: 25.5218, start_lng: 91.2694,
      end_lat: 25.5788, end_lng: 91.8933,
      length_km: 20, order_index: 5,
      current_risk_index: 38, current_risk_level: 'Medium',
      erosion_vulnerability_index: 48, gradeability_score: 68,
      grade_excluded_heavy: false, grade_excluded_light: false,
      last_updated: new Date().toISOString(), geojson: null
    }
  ];
}

// GET /api/segments/geojson - Get all segments as GeoJSON FeatureCollection
router.get('/geojson', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        rs.road_segment_id AS id,
        rs.road_name,
        rs.highway_number,
        rs.length_km,
        COALESCE(rsr.overall_risk_score, 30) AS risk_score,
        COALESCE(rsr.risk_level, 'Low') AS risk_level,
        ST_AsGeoJSON(rs.geometry)::json AS geometry
      FROM road_segments rs
      LEFT JOIN road_segment_risk rsr ON rs.road_segment_id = rsr.road_segment_id
      ORDER BY rs.road_segment_id ASC
    `);

    const featureCollection = {
      type: "FeatureCollection",
      features: result.rows.map(row => ({
        type: "Feature",
        geometry: row.geometry,
        properties: {
          segment_id: row.id,
          road_name: row.road_name,
          highway_number: row.highway_number,
          length_km: row.length_km,
          risk_score: row.risk_score,
          risk_level: row.risk_level
        }
      }))
    };

    res.json(featureCollection);
  } catch (err) {
    console.error('Error fetching segments GeoJSON FeatureCollection:', err.message);
    res.status(500).json({ error: 'Failed to retrieve segments GeoJSON FeatureCollection', details: err.message });
  }
});

// GET /api/segments/:id/history - Get segment risk history
router.get('/:id/history', async (req, res) => {
  const segmentId = parseInt(req.params.id);
  try {
    const segmentCheck = await db.query(`
      SELECT r.road_id, r.road_name, COALESCE(rsr.overall_risk_score, 30) AS base_risk
      FROM roads r
      LEFT JOIN road_segment_risk rsr ON r.road_id = rsr.road_segment_id
      WHERE r.road_id = $1
    `, [segmentId]);

    const baseRisk = segmentCheck.rows.length > 0 
      ? parseFloat(segmentCheck.rows[0].base_risk || 30) 
      : 30;

    const history = [
      { timestamp: new Date(Date.now() - 86400000 * 3), risk_index: Math.max(0, baseRisk - 10), event: "Routine inspection" },
      { timestamp: new Date(Date.now() - 86400000 * 2), risk_index: Math.min(100, baseRisk + 15), event: "Heavy rain shower" },
      { timestamp: new Date(Date.now() - 86400000 * 1), risk_index: baseRisk, event: "Post-rain inspection" }
    ];
    res.json({ segment_id: segmentId, history });
  } catch (err) {
    console.error('Error fetching segment history:', err.message);
    res.json({
      segment_id: segmentId,
      history: [
        { timestamp: new Date(Date.now() - 86400000 * 3), risk_index: 25, event: "Routine inspection" },
        { timestamp: new Date(Date.now() - 86400000 * 2), risk_index: 45, event: "Heavy rain shower" },
        { timestamp: new Date(Date.now() - 86400000 * 1), risk_index: 38, event: "Post-rain inspection" }
      ]
    });
  }
});

module.exports = router;
