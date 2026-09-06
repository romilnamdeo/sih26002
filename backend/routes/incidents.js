const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/incidents - Get all incidents with PostGIS GeoJSON
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        i.incident_id,
        i.road_segment_id,
        i.road_segment_id AS segment_id,
        rs.road_name,
        i.incident_type,
        i.incident_type AS hazard_type,
        i.severity,
        i.description,
        i.verification_status AS status,
        i.reported_at,
        ST_AsGeoJSON(i.geometry)::json AS geojson
      FROM road_incidents i
      LEFT JOIN road_segments rs ON i.road_segment_id = rs.road_segment_id
      ORDER BY i.reported_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching incidents:', err.message);
    res.status(500).json({ error: 'Failed to retrieve incidents from database', details: err.message });
  }
});

// GET /api/incidents/geojson - Get all incidents as GeoJSON FeatureCollection
router.get('/geojson', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        i.incident_id,
        i.road_segment_id,
        rs.road_name,
        i.incident_type,
        i.severity,
        i.description,
        i.verification_status AS status,
        i.reported_at,
        ST_AsGeoJSON(i.geometry)::json AS geometry
      FROM road_incidents i
      LEFT JOIN road_segments rs ON i.road_segment_id = rs.road_segment_id
      ORDER BY i.reported_at DESC
    `);

    const featureCollection = {
      type: "FeatureCollection",
      features: result.rows.map(row => ({
        type: "Feature",
        geometry: row.geometry,
        properties: {
          incident_id: row.incident_id,
          road_segment_id: row.road_segment_id,
          road_name: row.road_name,
          incident_type: row.incident_type,
          severity: row.severity,
          description: row.description,
          status: row.status,
          reported_at: row.reported_at
        }
      }))
    };

    res.json(featureCollection);
  } catch (err) {
    console.error('Error fetching incidents GeoJSON FeatureCollection:', err.message);
    res.status(500).json({ error: 'Failed to retrieve incidents GeoJSON FeatureCollection', details: err.message });
  }
});

module.exports = router;
