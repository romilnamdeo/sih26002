const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/locations - Get all locations with PostGIS GeoJSON
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        location_id,
        name AS location_name,
        name,
        location_type,
        latitude,
        longitude,
        ST_AsGeoJSON(geometry)::json AS geojson
      FROM locations
      ORDER BY name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching locations:', err.message);
    res.status(500).json({ error: 'Failed to retrieve locations from database', details: err.message });
  }
});

// GET /api/locations/geojson - Get all locations as GeoJSON FeatureCollection
router.get('/geojson', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        location_id,
        name AS location_name,
        name,
        location_type,
        latitude,
        longitude,
        ST_AsGeoJSON(geometry)::json AS geometry
      FROM locations
      ORDER BY name ASC
    `);

    const featureCollection = {
      type: "FeatureCollection",
      features: result.rows.map(loc => ({
        type: "Feature",
        geometry: loc.geometry,
        properties: {
          location_id: loc.location_id,
          location_name: loc.location_name,
          location_type: loc.location_type,
          latitude: loc.latitude,
          longitude: loc.longitude
        }
      }))
    };

    res.json(featureCollection);
  } catch (err) {
    console.error('Error fetching locations GeoJSON FeatureCollection:', err.message);
    res.status(500).json({ error: 'Failed to retrieve locations GeoJSON FeatureCollection', details: err.message });
  }
});

module.exports = router;
