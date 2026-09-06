const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/roads - Get all monitored roads with PostGIS GeoJSON
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        rs.road_segment_id AS road_id,
        rs.road_segment_id,
        rs.road_name,
        rs.highway_number,
        rs.road_category AS road_type,
        rs.length_km,
        rs.surface_type,
        rs.road_condition,
        rs.speed_limit_kmh,
        rs.is_operational,
        COALESCE(rsr.overall_risk_score, 30) AS risk_score,
        COALESCE(rsr.risk_level, 'low') AS risk_level,
        ST_AsGeoJSON(rs.geometry)::json AS geojson,
        ST_Y(ST_StartPoint(rs.geometry)) AS start_latitude,
        ST_X(ST_StartPoint(rs.geometry)) AS start_longitude,
        ST_Y(ST_EndPoint(rs.geometry)) AS end_latitude,
        ST_X(ST_EndPoint(rs.geometry)) AS end_longitude
      FROM road_segments rs
      LEFT JOIN road_segment_risk rsr ON rs.road_segment_id = rsr.road_segment_id
      ORDER BY rs.road_segment_id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching roads:', err.message);
    res.status(500).json({ error: 'Failed to retrieve roads from database', details: err.message });
  }
});

// GET /api/roads/geojson - Get all roads as a GeoJSON FeatureCollection
router.get('/geojson', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        rs.road_segment_id AS road_id,
        rs.road_name,
        rs.highway_number,
        rs.road_category,
        rs.length_km,
        rs.road_condition,
        COALESCE(rsr.overall_risk_score, 30) AS risk_score,
        COALESCE(rsr.risk_level, 'low') AS risk_level,
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
          road_id: row.road_id,
          road_name: row.road_name,
          highway_number: row.highway_number,
          road_category: row.road_category,
          length_km: row.length_km,
          road_condition: row.road_condition,
          risk_score: row.risk_score,
          risk_level: row.risk_level
        }
      }))
    };

    res.json(featureCollection);
  } catch (err) {
    console.error('Error fetching roads GeoJSON FeatureCollection:', err.message);
    res.status(500).json({ error: 'Failed to retrieve roads GeoJSON FeatureCollection', details: err.message });
  }
});

module.exports = router;
