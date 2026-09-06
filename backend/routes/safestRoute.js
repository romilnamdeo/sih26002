const express = require('express');
const router = express.Router();
const { findAndScoreRoutes } = require('../riskEngine');

// Main endpoint to calculate the safest route
router.post('/', async (req, res) => {
  const { originId, destinationId, shipmentId } = req.body;

  if (!originId || !destinationId) {
    return res.status(400).json({ error: 'Origin and Destination are required' });
  }

  try {
    const result = await findAndScoreRoutes(originId, destinationId, { shipmentId });
    
    // If no path exists at all in the topology graph, return 404 (matches original BFS/DFS fallback)
    if (result.status === 'NO_SAFE_ROUTE_AVAILABLE' && !result.recommendedRoute) {
      return res.status(404).json({
        error: 'No route found between selected Origin and Destination',
        origin: result.origin?.location_name || originId,
        destination: result.destination?.location_name || destinationId
      });
    }

    res.json({
      status: result.status,
      shipment: result.shipment,
      origin: result.origin,
      destination: result.destination,
      recommendedRoute: result.recommendedRoute,
      alternativeRoutes: result.alternativeRoutes,
      rejectedRoutes: result.rejectedRoutes
    });
  } catch (err) {
    console.error('Error calculating safest route:', err.message);
    res.status(500).json({ error: 'Failed to compute safest route', details: err.message });
  }
});

module.exports = router;
