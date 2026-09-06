const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/routes - Get all routes with PostGIS GeoJSON
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        route_id,
        origin_name,
        destination_name,
        distance_km AS total_distance_km,
        estimated_time_minutes AS estimated_duration_min,
        risk_score,
        route_status,
        created_at,
        ST_AsGeoJSON(origin_geometry)::json AS origin_geojson,
        ST_AsGeoJSON(destination_geometry)::json AS destination_geojson
      FROM routes 
      ORDER BY route_id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching routes:', err.message);
    res.status(500).json({ error: 'Failed to retrieve routes from database', details: err.message });
  }
});

// GET /api/routes/:id/waypoints - Get segments / waypoints for a specific route
router.get('/:id/waypoints', async (req, res) => {
  try {
    const routeId = parseInt(req.params.id);
    const result = await db.query(`
      SELECT 
        rs.route_id,
        rs.road_segment_id,
        rs.sequence_number AS sequence_no,
        rs.segment_distance_km,
        rs.segment_time_minutes,
        rs.segment_risk_score,
        seg.road_name,
        ST_AsGeoJSON(seg.geometry)::json AS geojson
      FROM route_segments rs
      LEFT JOIN road_segments seg ON rs.road_segment_id = seg.road_segment_id
      WHERE rs.route_id = $1
      ORDER BY rs.sequence_number ASC
    `, [routeId]);
    res.json(result.rows);
  } catch (err) {
    console.error(`Error fetching waypoints for route ${req.params.id}:`, err.message);
    res.status(500).json({ error: 'Failed to retrieve route waypoints', details: err.message });
  }
});

module.exports = router;
