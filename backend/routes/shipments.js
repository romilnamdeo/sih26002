const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all shipments
router.get('/', async (req, res) => {
  try {
    const tableCheck = await db.query("SELECT to_regclass('ner_routeguard.shipments')");
    if (tableCheck.rows[0].to_regclass) {
      const result = await db.query('SELECT * FROM shipments ORDER BY shipment_id ASC');
      return res.json(result.rows);
    }
    res.json([]);
  } catch (err) {
    console.error('Error fetching shipments:', err.message);
    res.status(500).json({ error: 'Failed to retrieve shipments from database', details: err.message });
  }
});

module.exports = router;
