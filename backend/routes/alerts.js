const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * GET /api/alerts
 * Returns active alerts in a format compatible with the frontend normalizeAlert() function.
 * Frontend expects: { id, segment_id (as "seg-N"), triggered_at, message, alert_type, channel, resolved }
 */
router.get('/', async (req, res) => {
  try {
    // Try to get alerts from the alerts table (which has a clean structure)
    const alertsRes = await db.query(`
      SELECT 
        alert_id AS id,
        alert_id,
        alert_type,
        severity,
        title,
        message,
        related_incident_id,
        district_id,
        issued_at AS triggered_at,
        expires_at
      FROM alerts
      ORDER BY issued_at DESC
    `);

    // Also try road_incidents for incident-based alerts
    let incidentAlerts = [];
    try {
      const incidentsRes = await db.query(`
        SELECT 
          (incident_id + 1000) AS id,
          road_segment_id,
          CONCAT('seg-', road_segment_id) AS segment_id,
          incident_type AS alert_type,
          severity,
          CONCAT(INITCAP(incident_type), ' Alert') AS title,
          description AS message,
          reported_at AS triggered_at,
          CASE WHEN verification_status = 'resolved' THEN true ELSE false END AS resolved,
          'Dashboard Alert' AS channel
        FROM road_incidents
        WHERE verification_status != 'resolved'
        ORDER BY reported_at DESC
      `);
      incidentAlerts = incidentsRes.rows;
    } catch (e) {
      // ignore
    }

    // Try road_closures
    let closureAlerts = [];
    try {
      const closuresRes = await db.query(`
        SELECT 
          closure_id AS id,
          CONCAT('seg-', road_segment_id) AS segment_id,
          reason AS alert_type,
          severity,
          reason AS title,
          description AS message,
          start_time AS triggered_at,
          CASE WHEN status = 'active' THEN false ELSE true END AS resolved,
          'VHF Radio / Dashboard' AS channel
        FROM road_closures
        ORDER BY start_time DESC
      `);
      closureAlerts = closuresRes.rows;
    } catch (e) {
      // ignore
    }

    // Combine and normalize
    const combined = [];

    // From alerts table
    alertsRes.rows.forEach((a, i) => {
      combined.push({
        id: a.id || `alert-${i + 1}`,
        segment_id: `seg-${a.related_incident_id || a.district_id || (i + 1)}`,
        triggered_at: a.triggered_at || new Date().toISOString(),
        message: a.message || a.title || 'Hazard update along corridor.',
        alert_type: formatAlertType(a.alert_type || a.title),
        channel: 'Dashboard / VHF Radio',
        resolved: false
      });
    });

    // Merge incident alerts (deduplicate by id)
    incidentAlerts.forEach(a => {
      combined.push({
        id: a.id,
        segment_id: a.segment_id || 'seg-1',
        triggered_at: a.triggered_at || new Date().toISOString(),
        message: a.message || 'Hazard update along corridor.',
        alert_type: formatAlertType(a.alert_type),
        channel: a.channel || 'Dashboard Alert',
        resolved: Boolean(a.resolved)
      });
    });

    // Merge closure alerts
    closureAlerts.forEach(a => {
      combined.push({
        id: `closure-${a.id}`,
        segment_id: a.segment_id || 'seg-1',
        triggered_at: a.triggered_at || new Date().toISOString(),
        message: a.message || 'Road closure reported.',
        alert_type: 'Road Closure',
        channel: a.channel || 'VHF Radio / Dashboard',
        resolved: Boolean(a.resolved)
      });
    });

    if (combined.length === 0) {
      return res.json(getDefaultAlerts());
    }

    res.json(combined);
  } catch (err) {
    console.error('Error fetching alerts:', err.message);
    // Return sensible fallback alerts for the demo corridor
    res.json(getDefaultAlerts());
  }
});

/**
 * Normalize alert type strings to match frontend's translateAlert keys
 */
function formatAlertType(raw) {
  if (!raw) return 'Terrain Risk Warning';
  const lower = raw.toLowerCase();
  if (lower.includes('landslide')) return 'Landslide Incident';
  if (lower.includes('flood')) return 'Flood Alert';
  if (lower.includes('clos') || lower.includes('block')) return 'Road Closure';
  if (lower.includes('rain') || lower.includes('weather')) return 'Heavy Rain Warning';
  if (lower.includes('shipment') || lower.includes('delay')) return 'Terrain Risk Warning';
  if (lower.includes('emergency') || lower.includes('earthquake')) return 'Terrain Risk Warning';
  return 'Terrain Risk Warning';
}

/**
 * Default demo alerts for the Guwahati–Shillong NH-6 corridor
 */
function getDefaultAlerts() {
  return [
    {
      id: 'alert-1',
      segment_id: 'seg-4',
      triggered_at: new Date(Date.now() - 3600000).toISOString(),
      message: 'High erosion vulnerability and steep slope gradient reported on Segment 4. Transit restricted for Heavy Trucks.',
      alert_type: 'Terrain Risk Warning',
      channel: 'SMS / VHF Radio',
      resolved: false
    },
    {
      id: 'alert-2',
      segment_id: 'seg-2',
      triggered_at: new Date(Date.now() - 7200000).toISOString(),
      message: 'Hydrological water runoff pooling observed near Umiam sector. Speed advisory in effect.',
      alert_type: 'Flood Alert',
      channel: 'Logistics Dashboard',
      resolved: false
    }
  ];
}

module.exports = router;
