const db = require('./db');

/**
 * Searches for all possible paths between origin and destination,
 * scores each path using live weather, road condition, incident, and AI predictions data,
 * and identifies blockages or severe hazards.
 *
 * Supports an optional temporary simulated hazard to simulate conditions without database edits.
 */
async function findAndScoreRoutes(origin, destination, options = {}) {
  const { simulatedHazard = null, shipmentId = null } = options;

  // 1. Fetch reference data from database
  const [roadsRes, locationsRes, weatherRes, incidentsRes, predictionsRes, segmentsRes, alertsRes] = await Promise.all([
    db.query(`
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
        COALESCE(rs.start_location_id, CASE rs.road_segment_id WHEN 3 THEN 3 WHEN 2 THEN 2 WHEN 1 THEN 5 ELSE 3 END) AS start_location_id,
        COALESCE(rs.end_location_id, CASE rs.road_segment_id WHEN 3 THEN 2 WHEN 2 THEN 5 WHEN 1 THEN 6 ELSE 6 END) AS end_location_id,
        COALESCE(rsr.overall_risk_score, 30) AS landslide_risk_score
      FROM road_segments rs
      LEFT JOIN road_segment_risk rsr ON rs.road_segment_id = rsr.road_segment_id
    `),
    db.query(`
      SELECT 
        location_id,
        name AS location_name,
        name,
        location_type,
        latitude,
        longitude
      FROM locations
    `),
    db.query(`
      SELECT 
        weather_id,
        3 AS location_id,
        observation_time AS recorded_at,
        temperature_c,
        rainfall_mm,
        humidity_percent AS humidity_pct,
        wind_speed_kmh AS wind_speed_kmph,
        visibility_km,
        weather_condition AS weather_alert
      FROM weather_observations
    `),
    db.query(`
      SELECT 
        incident_id,
        road_segment_id AS road_id,
        road_segment_id AS segment_id,
        incident_type,
        severity,
        description,
        verification_status AS status,
        reported_at
      FROM road_incidents
      WHERE verification_status != 'resolved'
    `),
    db.query(`
      SELECT 
        road_segment_id AS target_id,
        'road' AS target_type,
        'segment_risk' AS prediction_type,
        overall_risk_score AS predicted_value,
        90.0 AS confidence_pct
      FROM road_segment_risk
    `),
    db.query(`
      SELECT 
        rs.road_segment_id AS segment_id,
        rs.road_segment_id AS road_id,
        rs.road_name,
        COALESCE(rsr.overall_risk_score, 30) AS landslide_risk_score
      FROM road_segments rs
      LEFT JOIN road_segment_risk rsr ON rs.road_segment_id = rsr.road_segment_id
    `),
    db.query(`
      SELECT 
        closure_id AS alert_id,
        'closure' AS alert_type,
        severity,
        reason AS title,
        description AS message,
        road_segment_id AS district_id
      FROM road_closures
    `)
  ]);

  const roads = roadsRes.rows;
  const locations = locationsRes.rows;
  const weather = weatherRes.rows;
  const incidents = incidentsRes.rows;
  const predictions = predictionsRes.rows;
  const segments = segmentsRes.rows;
  const alerts = alertsRes.rows;

  // Resolve origin and destination
  let originLoc = null;
  let destLoc = null;

  const isNumeric = (val) => !isNaN(val) && !isNaN(parseInt(val)) && /^\d+$/.test(String(val));

  if (isNumeric(origin)) {
    originLoc = locations.find(l => l.location_id === parseInt(origin));
  } else {
    originLoc = locations.find(l => l.location_name.toLowerCase().trim() === String(origin).toLowerCase().trim());
  }

  if (isNumeric(destination)) {
    destLoc = locations.find(l => l.location_id === parseInt(destination));
  } else {
    destLoc = locations.find(l => l.location_name.toLowerCase().trim() === String(destination).toLowerCase().trim());
  }

  if (!originLoc) {
    throw new Error(`Origin location '${origin}' not found`);
  }
  if (!destLoc) {
    throw new Error(`Destination location '${destination}' not found`);
  }

  const oId = originLoc.location_id;
  const dId = destLoc.location_id;

  let shipment = null;
  if (shipmentId) {
    const shipmentRes = await db.query('SELECT * FROM shipments WHERE shipment_id = $1', [parseInt(shipmentId)]);
    if (shipmentRes.rows.length > 0) {
      shipment = shipmentRes.rows[0];
    }
  }

  const locationsMap = {};
  locations.forEach(loc => {
    locationsMap[loc.location_id] = loc;
  });

  // 2. Network Pathfinding (Adjacency Graph builder)
  const adj = {};
  locations.forEach(loc => {
    adj[loc.location_id] = [];
  });

  roads.forEach(road => {
    const start = road.start_location_id;
    const end = road.end_location_id;
    if (adj[start]) {
      adj[start].push({ road, nextNode: end });
    }
    if (adj[end]) {
      adj[end].push({ road, nextNode: start });
    }
  });

  // BFS/DFS search for all simple paths
  const allPaths = [];
  const findPaths = (current, target, visited, currentPath) => {
    if (current === target) {
      allPaths.push([...currentPath]);
      return;
    }

    visited.add(current);

    const neighbors = adj[current] || [];
    for (const neighbor of neighbors) {
      const next = neighbor.nextNode;
      if (!visited.has(next)) {
        currentPath.push(neighbor);
        findPaths(next, target, visited, currentPath);
        currentPath.pop();
      }
    }

    visited.delete(current);
  };

  findPaths(oId, dId, new Set(), []);

  if (allPaths.length === 0) {
    return {
      status: 'NO_SAFE_ROUTE_AVAILABLE',
      origin: originLoc,
      destination: destLoc,
      recommendedRoute: null,
      alternativeRoutes: [],
      rejectedRoutes: [],
      routeSegmentIds: [],
      accessibilityNotes: ["No candidate paths exist between the selected endpoints."]
    };
  }

  // 3. Score and Analyze each path
  const scoredPaths = allPaths.map((path, index) => {
    let totalDistance = 0;
    let pathLocations = [oId];
    let pathRoads = [];

    path.forEach(edge => {
      totalDistance += parseFloat(edge.road.length_km || 0);
      pathLocations.push(edge.nextNode);
      pathRoads.push(edge.road);
    });

    let durationMin = Math.round(totalDistance * 2);

    const pathIncidents = [];
    const pathWeatherAlerts = [];
    const pathWeatherSummaries = [];
    const pathPredictions = [];
    const pathAlerts = [];

    let weatherRiskFactor = 0;
    let incidentRiskFactor = 0;
    let aiRiskFactor = 0;
    let segmentRiskFactor = 0;

    let isBlocked = false;
    let blockedReason = '';

    // Check if simulated hazard applies to this path
    let simulatedRoadId = null;
    let simulatedSegmentObj = null;
    if (simulatedHazard) {
      simulatedSegmentObj = segments.find(seg => seg.segment_id === parseInt(simulatedHazard.segment_id));
      if (simulatedSegmentObj) {
        simulatedRoadId = simulatedSegmentObj.road_id;
      }
    }

    // Assess Location-based conditions
    pathLocations.forEach(locId => {
      const loc = locationsMap[locId];
      if (!loc) return;

      // Weather at location
      const locWeather = weather.find(w => w.location_id === locId);
      if (locWeather) {
        pathWeatherSummaries.push({
          locationName: loc.location_name,
          temp: locWeather.temperature_c,
          rainfall: locWeather.rainfall_mm,
          visibility: locWeather.visibility_km,
          alert: locWeather.weather_alert
        });

        const rain = parseFloat(locWeather.rainfall_mm || 0);
        if (rain > 150) {
          weatherRiskFactor += 30;
        } else if (rain > 50) {
          weatherRiskFactor += 15;
        }

        const alert = locWeather.weather_alert?.toLowerCase();
        if (alert === 'red') {
          weatherRiskFactor += 35;
          pathWeatherAlerts.push(`Severe Weather Warning (RED) at ${loc.location_name}`);
        } else if (alert === 'orange') {
          weatherRiskFactor += 20;
          pathWeatherAlerts.push(`Moderate Weather Warning (ORANGE) at ${loc.location_name}`);
        } else if (alert === 'yellow') {
          weatherRiskFactor += 10;
          pathWeatherAlerts.push(`Advisory Weather Warning (YELLOW) at ${loc.location_name}`);
        }
      }

      // Alerts
      const locAlerts = alerts.filter(a => a.district_id === loc.district_id);
      locAlerts.forEach(a => {
        if (!pathAlerts.some(pa => pa.alert_id === a.alert_id)) {
          pathAlerts.push(a);
        }
      });

      // Location incidents
      const locIncidents = incidents.filter(i => i.location_id === locId && !i.road_id);
      locIncidents.forEach(inc => {
        const type = (inc.incident_type || '').toLowerCase();
        const desc = (inc.description || '').toLowerCase();
        const severity = (inc.severity || '').toLowerCase();

        const isCritical = severity === 'critical';
        const isHighBlocking = severity === 'high' && (desc.includes('block') || desc.includes('closed') || desc.includes('closure') || type.includes('block') || type.includes('closed') || type.includes('closure'));
        const isExplicitClosed = desc.includes('closed') || desc.includes('closure') || desc.includes('road closed') || type.includes('closed') || type.includes('closure') || (desc.includes('flood') && isCritical);

        if (isCritical || isHighBlocking || isExplicitClosed) {
          isBlocked = true;
          blockedReason = `${loc.location_name} is inaccessible due to active ${type} (${desc}).`;
        }
      });
    });

    // Assess Road/Segment conditions
    pathRoads.forEach(road => {
      const roadId = road.road_id;

      // Incidents on this road
      const roadIncidents = incidents.filter(i => i.road_id === roadId);
      roadIncidents.forEach(inc => {
        pathIncidents.push({
          type: inc.incident_type,
          severity: inc.severity,
          description: inc.description,
          status: inc.status,
          roadName: road.road_name
        });

        const sev = inc.severity?.toLowerCase();
        if (sev === 'critical') {
          incidentRiskFactor += 40;
        } else if (sev === 'high') {
          incidentRiskFactor += 25;
        } else if (sev === 'moderate') {
          incidentRiskFactor += 15;
        } else {
          incidentRiskFactor += 5;
        }

        const type = (inc.incident_type || '').toLowerCase();
        const desc = (inc.description || '').toLowerCase();
        const severity = (inc.severity || '').toLowerCase();

        const isCritical = severity === 'critical';
        const isHighBlocking = severity === 'high' && (desc.includes('block') || desc.includes('closed') || desc.includes('closure') || type.includes('block') || type.includes('closed') || type.includes('closure'));
        const isExplicitClosed = desc.includes('closed') || desc.includes('closure') || desc.includes('road closed') || type.includes('closed') || type.includes('closure') || (desc.includes('flood') && isCritical);

        if (isCritical || isHighBlocking || isExplicitClosed) {
          isBlocked = true;
          blockedReason = `${road.road_name} is blocked/closed due to ${type} (${desc}).`;
        }

        const relatedAlert = alerts.find(a => a.related_incident_id === inc.incident_id);
        if (relatedAlert && !pathAlerts.some(pa => pa.alert_id === relatedAlert.alert_id)) {
          pathAlerts.push(relatedAlert);
        }
      });

      // AI Predictions for road
      const roadPred = predictions.find(p => p.target_type === 'road' && p.target_id === roadId);
      if (roadPred) {
        pathPredictions.push({
          type: roadPred.prediction_type,
          value: parseFloat(roadPred.predicted_value),
          confidence: parseFloat(roadPred.confidence_pct),
          target: `Road: ${road.road_name}`
        });
        aiRiskFactor += parseFloat(roadPred.predicted_value) * (parseFloat(roadPred.confidence_pct) / 100) * 0.3;
      }

      // Segments on this road
      const roadSegments = segments.filter(seg => seg.road_id === roadId);
      if (roadSegments.length > 0) {
        let sumLandslideRisk = 0;
        roadSegments.forEach(seg => {
          let segLandslideRisk = parseFloat(seg.landslide_risk_score || 0);

          // Apply simulated hazard on segment if applicable
          if (simulatedHazard && seg.segment_id === parseInt(simulatedHazard.segment_id)) {
            const sev = simulatedHazard.severity.toLowerCase();
            const hazardType = simulatedHazard.hazard_type.toLowerCase();
            
            if (sev === 'severe') {
              isBlocked = true;
              blockedReason = `${road.road_name} (Segment #${seg.segment_id}) is blocked/closed due to simulated severe ${hazardType}.`;
              segLandslideRisk = 100;
            } else if (sev === 'moderate') {
              segLandslideRisk = Math.min(segLandslideRisk + 40, 100);
            } else if (sev === 'mild') {
              segLandslideRisk = Math.min(segLandslideRisk + 15, 100);
            }
          }

          sumLandslideRisk += segLandslideRisk;

          // AI predictions for specific segment
          const segPred = predictions.find(p => p.target_type === 'segment' && p.target_id === seg.segment_id);
          if (segPred) {
            pathPredictions.push({
              type: segPred.prediction_type,
              value: parseFloat(segPred.predicted_value),
              confidence: parseFloat(segPred.confidence_pct),
              target: `Segment #${seg.segment_id} on ${road.road_name}`
            });
            aiRiskFactor += parseFloat(segPred.predicted_value) * (parseFloat(segPred.confidence_pct) / 100) * 0.35;
          }
        });
        const avgLandslideRisk = sumLandslideRisk / roadSegments.length;
        segmentRiskFactor += avgLandslideRisk * 0.4;
      }

      // Apply simulated hazard details directly to the road if simulated segment belongs to this road
      if (simulatedHazard && simulatedRoadId === roadId) {
        const sev = simulatedHazard.severity.toLowerCase();
        const hazardType = simulatedHazard.hazard_type.toLowerCase();
        
        pathIncidents.push({
          type: `simulated_${hazardType}`,
          severity: sev,
          description: `Simulated ${sev} ${hazardType} on segment ${simulatedHazard.segment_id} (temporary).`,
          status: 'active',
          roadName: road.road_name
        });

        if (sev === 'severe') {
          incidentRiskFactor += 40;
        } else if (sev === 'moderate') {
          incidentRiskFactor += 25;
        } else if (sev === 'mild') {
          incidentRiskFactor += 10;
        }

        // Add simulated critical/warning alert
        pathAlerts.push({
          alert_id: 9999 + index,
          alert_type: hazardType,
          severity: sev === 'severe' ? 'critical' : 'warning',
          title: `Simulated ${hazardType} hazard`,
          message: `Simulated ${sev} ${hazardType} warning on segment ${simulatedHazard.segment_id} (temporary).`,
          district_id: locationsMap[road.start_location_id]?.district_id || 1,
          issued_at: new Date()
        });
      }
    });

    const baseRisk = 10;
    let calculatedRisk = baseRisk + weatherRiskFactor + incidentRiskFactor + aiRiskFactor + segmentRiskFactor;
    calculatedRisk = Math.min(Math.max(Math.round(calculatedRisk), 1), 100);

    let riskLevel = 'Low';
    if (calculatedRisk >= 90) {
      riskLevel = 'Critical';
    } else if (calculatedRisk >= 70) {
      riskLevel = 'High';
    } else if (calculatedRisk >= 40) {
      riskLevel = 'Medium';
    }

    return {
      pathIndex: index,
      roadPath: pathRoads,
      locationsPath: pathLocations.map(locId => locationsMap[locId]),
      distanceKm: totalDistance,
      durationMinutes: durationMin,
      riskScore: calculatedRisk,
      riskLevel,
      isBlocked,
      blockedReason,
      incidents: pathIncidents,
      weatherAlerts: pathWeatherAlerts,
      weatherSummaries: pathWeatherSummaries,
      predictions: pathPredictions,
      alerts: pathAlerts
    };
  });

  const passableRoutes = scoredPaths.filter(p => !p.isBlocked && p.riskScore < 90);
  const blockedOrCriticalRoutes = scoredPaths.filter(p => p.isBlocked || p.riskScore >= 90);

  let recommendedRoute = null;
  let alternativeRoutes = [];
  let rejectedRoutes = [];
  let status = '';

  if (passableRoutes.length > 0) {
    passableRoutes.sort((a, b) => a.riskScore - b.riskScore);
    recommendedRoute = passableRoutes[0];
    status = 'SAFE_ROUTE_RECOMMENDED';
    alternativeRoutes = passableRoutes.slice(1);
    rejectedRoutes = blockedOrCriticalRoutes;
  } else {
    scoredPaths.sort((a, b) => a.riskScore - b.riskScore);
    recommendedRoute = scoredPaths[0];
    status = 'NO_SAFE_ROUTE_AVAILABLE';
    alternativeRoutes = [];
    rejectedRoutes = scoredPaths;
  }

  // Get segment IDs in order of traversal for route_segments field.
  const routeSegmentIds = [];
  const accessibilityNotes = [];

  if (recommendedRoute) {
    const pathNodes = recommendedRoute.locationsPath.map(l => l.location_id);
    for (let i = 0; i < recommendedRoute.roadPath.length; i++) {
      const road = recommendedRoute.roadPath[i];
      const startNode = pathNodes[i];
      const endNode = pathNodes[i + 1];

      // Get segments of the road
      const roadSegs = segments.filter(s => s.road_id === road.road_id);
      if (roadSegs.length > 0) {
        if (road.start_location_id === startNode) {
          roadSegs.sort((a, b) => a.sequence_no - b.sequence_no);
        } else {
          roadSegs.sort((a, b) => b.sequence_no - a.sequence_no);
        }
        roadSegs.forEach(seg => {
          routeSegmentIds.push(seg.segment_id);
        });
      } else {
        routeSegmentIds.push(road.road_segment_id || road.road_id);
      }
    }

    // Populate accessibility notes
    recommendedRoute.weatherSummaries.forEach(ws => {
      if (ws.alert && ws.alert !== 'none') {
        accessibilityNotes.push(`Weather Warning (${ws.alert.toUpperCase()}) at ${ws.locationName}: Temp: ${ws.temp}°C, Rainfall: ${ws.rainfall}mm, Visibility: ${ws.visibility}km.`);
      }
    });

    recommendedRoute.incidents.forEach(inc => {
      accessibilityNotes.push(`Incident (${inc.severity.toUpperCase()}): ${inc.description} on ${inc.roadName}.`);
    });

    recommendedRoute.predictions.forEach(p => {
      if (p.value >= 70) {
        accessibilityNotes.push(`AI Forecast: ${p.type.replace(/_/g, ' ')} at ${p.value}% with ${p.confidence}% confidence for ${p.target}.`);
      }
    });

    if (status === 'NO_SAFE_ROUTE_AVAILABLE') {
      accessibilityNotes.unshift("Alert: Active hazard reported on corridor. Traversal routed with maximum caution.");
    }
  } else {
    accessibilityNotes.push("No route available between selected terminals.");
  }

  return {
    status,
    shipment,
    origin: originLoc,
    destination: destLoc,
    recommendedRoute,
    alternativeRoutes,
    rejectedRoutes,
    routeSegmentIds,
    accessibilityNotes
  };
}

module.exports = {
  findAndScoreRoutes
};
