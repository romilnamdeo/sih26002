const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/weather - Get all weather observations with PostGIS GeoJSON
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        weather_id,
        observation_time AS recorded_at,
        observation_time,
        temperature_c,
        rainfall_mm,
        humidity_percent AS humidity_pct,
        wind_speed_kmh AS wind_speed_kmph,
        visibility_km,
        weather_condition AS weather_alert,
        weather_condition,
        source,
        confidence_score,
        ST_AsGeoJSON(geometry)::json AS geojson
      FROM weather_observations
      ORDER BY observation_time DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching weather data:', err.message);
    res.status(500).json({ error: 'Failed to retrieve weather data from database', details: err.message });
  }
});

// GET /api/weather/geojson - Get weather observations as GeoJSON FeatureCollection
router.get('/geojson', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        weather_id,
        observation_time,
        temperature_c,
        rainfall_mm,
        humidity_percent,
        wind_speed_kmh,
        visibility_km,
        weather_condition,
        ST_AsGeoJSON(geometry)::json AS geometry
      FROM weather_observations
      ORDER BY observation_time DESC
    `);

    const featureCollection = {
      type: "FeatureCollection",
      features: result.rows.map(w => ({
        type: "Feature",
        geometry: w.geometry,
        properties: {
          weather_id: w.weather_id,
          observation_time: w.observation_time,
          temperature_c: w.temperature_c,
          rainfall_mm: w.rainfall_mm,
          humidity_percent: w.humidity_percent,
          wind_speed_kmh: w.wind_speed_kmh,
          visibility_km: w.visibility_km,
          weather_condition: w.weather_condition
        }
      }))
    };

    res.json(featureCollection);
  } catch (err) {
    console.error('Error fetching weather GeoJSON FeatureCollection:', err.message);
    res.status(500).json({ error: 'Failed to retrieve weather GeoJSON FeatureCollection', details: err.message });
  }
});

module.exports = router;
