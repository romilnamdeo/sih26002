import axios from 'axios';

// API base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Corridor reference nodes & fallback baseline segments for the monitored North Eastern transit corridor
export const DEFAULT_CORRIDOR_NODES = [
  { name: "Guwahati", key: "guwahati", lat: 26.1445, lng: 91.7362 },
  { name: "Umiam", key: "umiam", lat: 25.6888, lng: 91.8841 },
  { name: "Mawphlang", key: "mawphlang", lat: 25.4562, lng: 91.7583 },
  { name: "Mawkyrwat", key: "mawkyrwat", lat: 25.3214, lng: 91.6215 },
  { name: "Nongstoin", key: "nongstoin", lat: 25.5218, lng: 91.2694 },
  { name: "Shillong", key: "shillong", lat: 25.5788, lng: 91.8933 }
];

export const FALLBACK_SEGMENTS = [
  {
    id: "seg-1",
    name: "seg-1: Guwahati → Umiam",
    from: "Guwahati",
    to: "Umiam",
    start_lat: 26.1445,
    start_lng: 91.7362,
    end_lat: 25.6888,
    end_lng: 91.8841,
    length_km: 15,
    order_index: 1,
    current_risk_index: 25,
    current_risk_level: "Low",
    erosion_vulnerability_index: 28,
    gradeability_score: 85,
    grade_excluded_heavy: false,
    grade_excluded_light: false,
    last_updated: new Date().toISOString()
  },
  {
    id: "seg-2",
    name: "seg-2: Umiam → Mawphlang",
    from: "Umiam",
    to: "Mawphlang",
    start_lat: 25.6888,
    start_lng: 91.8841,
    end_lat: 25.4562,
    end_lng: 91.7583,
    length_km: 25,
    order_index: 2,
    current_risk_index: 45,
    current_risk_level: "Medium",
    erosion_vulnerability_index: 55,
    gradeability_score: 72,
    grade_excluded_heavy: false,
    grade_excluded_light: false,
    last_updated: new Date().toISOString()
  },
  {
    id: "seg-3",
    name: "seg-3: Mawphlang → Mawkyrwat",
    from: "Mawphlang",
    to: "Mawkyrwat",
    start_lat: 25.4562,
    start_lng: 91.7583,
    end_lat: 25.3214,
    end_lng: 91.6215,
    length_km: 22,
    order_index: 3,
    current_risk_index: 18,
    current_risk_level: "Low",
    erosion_vulnerability_index: 22,
    gradeability_score: 90,
    grade_excluded_heavy: false,
    grade_excluded_light: false,
    last_updated: new Date().toISOString()
  },
  {
    id: "seg-4",
    name: "seg-4: Mawkyrwat → Nongstoin",
    from: "Mawkyrwat",
    to: "Nongstoin",
    start_lat: 25.3214,
    start_lng: 91.6215,
    end_lat: 25.5218,
    end_lng: 91.2694,
    length_km: 28,
    order_index: 4,
    current_risk_index: 82,
    current_risk_level: "High",
    erosion_vulnerability_index: 78,
    gradeability_score: 42,
    grade_excluded_heavy: true, // Not safe for heavy trucks due to steep incline
    grade_excluded_light: false,
    last_updated: new Date().toISOString()
  },
  {
    id: "seg-5",
    name: "seg-5: Nongstoin → Shillong",
    from: "Nongstoin",
    to: "Shillong",
    start_lat: 25.5218,
    start_lng: 91.2694,
    end_lat: 25.5788,
    end_lng: 91.8933,
    length_km: 20,
    order_index: 5,
    current_risk_index: 38,
    current_risk_level: "Medium",
    erosion_vulnerability_index: 48,
    gradeability_score: 68,
    grade_excluded_heavy: false,
    grade_excluded_light: false,
    last_updated: new Date().toISOString()
  }
];

export const FALLBACK_ALERTS = [
  {
    id: "alert-1",
    segment_id: "seg-4",
    triggered_at: new Date(Date.now() - 3600000).toISOString(),
    templateKey: "alertTemplates.terrainWarning",
    params: { segment: "seg-4" },
    message: "High erosion vulnerability and steep slope gradient reported on Segment 4. Transit restricted for Heavy Trucks.",
    alert_type: "Terrain Risk Warning",
    channel: "SMS / VHF Radio",
    resolved: false
  },
  {
    id: "alert-2",
    segment_id: "seg-2",
    triggered_at: new Date(Date.now() - 7200000).toISOString(),
    templateKey: "alertTemplates.runoffWarning",
    params: { location: "Umiam" },
    message: "Hydrological water runoff pooling observed near Umiam sector. Speed advisory in effect.",
    alert_type: "Flood Alert",
    channel: "Logistics Dashboard",
    resolved: false
  }
];

/**
 * Normalizes segment objects whether from raw DB rows or API contract
 */
const normalizeSegment = (s, index) => {
  const fallback = FALLBACK_SEGMENTS[index % FALLBACK_SEGMENTS.length];
  const rawId = s.id || s.segment_id || s.road_segment_id || (index + 1);
  const segId = String(rawId).startsWith('seg-') ? String(rawId) : `seg-${rawId}`;
  const rawRisk = s.current_risk_index !== undefined ? s.current_risk_index : (s.landslide_risk_score !== undefined ? Number(s.landslide_risk_score) : fallback.current_risk_index);
  const riskIndex = Math.round(Number(rawRisk) || 0);

  let riskLevel = s.current_risk_level;
  if (!riskLevel) {
    riskLevel = riskIndex <= 30 ? "Low" : riskIndex <= 70 ? "Medium" : "High";
  }

  return {
    id: String(segId),
    name: s.name || s.road_name || fallback.name,
    from: s.from || fallback.from,
    to: s.to || fallback.to,
    start_lat: Number(s.start_lat || s.latitude || fallback.start_lat),
    start_lng: Number(s.start_lng || s.longitude || fallback.start_lng),
    end_lat: Number(s.end_lat || fallback.end_lat),
    end_lng: Number(s.end_lng || fallback.end_lng),
    length_km: Number(s.length_km || fallback.length_km),
    order_index: Number(s.order_index || s.sequence_no || index + 1),
    current_risk_index: riskIndex,
    current_risk_level: riskLevel,
    erosion_vulnerability_index: Number(s.erosion_vulnerability_index !== undefined ? s.erosion_vulnerability_index : fallback.erosion_vulnerability_index),
    gradeability_score: Number(s.gradeability_score !== undefined ? s.gradeability_score : fallback.gradeability_score),
    grade_excluded_heavy: Boolean(s.grade_excluded_heavy !== undefined ? s.grade_excluded_heavy : fallback.grade_excluded_heavy),
    grade_excluded_light: Boolean(s.grade_excluded_light !== undefined ? s.grade_excluded_light : fallback.grade_excluded_light),
    last_updated: s.last_updated || s.last_inspected || new Date().toISOString(),
    geojson: s.geojson || null
  };
};

/**
 * Normalizes alert objects
 */
const normalizeAlert = (a, index) => {
  return {
    id: a.id || a.alert_id || `alert-${index + 1}`,
    segment_id: a.segment_id ? (String(a.segment_id).startsWith('seg-') ? String(a.segment_id) : `seg-${a.segment_id}`) : "seg-4",
    triggered_at: a.triggered_at || a.issued_at || new Date().toISOString(),
    templateKey: a.templateKey || null,
    params: a.params || null,
    message: a.message || a.title || "Hazard update along corridor.",
    alert_type: a.alert_type || "Terrain Risk Warning",
    channel: a.channel || "Dashboard Alert",
    resolved: Boolean(a.resolved)
  };
};

// ==========================================
// API CLIENT IMPLEMENTATIONS
// ==========================================

/**
 * GET /api/config
 * Initial configuration fetch. If fails, defaults all demo flags to false.
 */
export const getConfig = async () => {
  try {
    const res = await apiClient.get('/api/config');
    const data = res.data || {};
    return {
      ENABLE_LIVE_POLLING: Boolean(data.ENABLE_LIVE_POLLING),
      ENABLE_GPS_SIMULATION: Boolean(data.ENABLE_GPS_SIMULATION),
      ENABLE_MULTILINGUAL_ALERTS: Boolean(data.ENABLE_MULTILINGUAL_ALERTS),
      ENABLE_OFFLINE_SYNC_DEMO: Boolean(data.ENABLE_OFFLINE_SYNC_DEMO),
      ...data
    };
  } catch (err) {
    console.warn("[API] GET /api/config failed. Defaulting demo flags to false.", err.message);
    return {
      ENABLE_LIVE_POLLING: false,
      ENABLE_GPS_SIMULATION: false,
      ENABLE_MULTILINGUAL_ALERTS: false,
      ENABLE_OFFLINE_SYNC_DEMO: false
    };
  }
};

/**
 * GET /api/segments
 */
export const getSegments = async () => {
  try {
    const res = await apiClient.get('/api/segments');
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(normalizeSegment);
    }
    return FALLBACK_SEGMENTS;
  } catch (err) {
    console.warn("[API] GET /api/segments failed, using fallback corridor segments.", err.message);
    return FALLBACK_SEGMENTS;
  }
};

/**
 * GET /api/segments/{id}/history
 */
export const getSegmentHistory = async (segmentId) => {
  const numericId = String(segmentId).replace('seg-', '');
  try {
    const res = await apiClient.get(`/api/segments/${numericId}/history`);
    return res.data;
  } catch (err) {
    console.warn(`[API] GET /api/segments/${segmentId}/history failed.`, err.message);
    return {
      segment_id: segmentId,
      history: [
        { timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), risk_index: 30 },
        { timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), risk_index: 55 },
        { timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), risk_index: 45 }
      ]
    };
  }
};

/**
 * GET /api/route-plan
 * Query parameters: origin, destination, vehicle_class, safety_weight
 */
export const getRoutePlan = async ({ origin, destination, vehicle_class, safety_weight }) => {
  const params = {
    origin,
    destination,
    vehicle_class,
    safety_weight: parseFloat(safety_weight)
  };

  try {
    const res = await apiClient.get('/api/route-plan', { params });
    const data = res.data;

    // Ensure route_segments contains string IDs like "seg-1"
    const routeSegs = (data.route_segments || []).map(s => {
      if (typeof s === 'object' && s.id) return s.id;
      return String(s).startsWith('seg-') ? String(s) : `seg-${s}`;
    });

    // Check for excluded segments
    let excluded = data.excluded_segments || [];
    if (!excluded || excluded.length === 0) {
      if (vehicle_class === 'heavy') {
        excluded = ['seg-4'];
      }
    }

    return {
      route_segments: routeSegs,
      total_length_km: Number(data.total_length_km || 0),
      total_risk_index: Math.round(Number(data.total_risk_index || 0)),
      overall_risk_level: data.overall_risk_level || (data.total_risk_index > 70 ? 'High' : data.total_risk_index > 30 ? 'Medium' : 'Low'),
      eta_minutes: Number(data.eta_minutes || 0),
      estimated_cost_inr: Number(data.estimated_cost_inr || 0),
      accessibility_notes: Array.isArray(data.accessibility_notes) ? data.accessibility_notes : [],
      excluded_segments: excluded
    };
  } catch (err) {
    console.warn("[API] GET /api/route-plan failed, generating safe fallback route.", err.message);
    throw err;
  }
};

/**
 * POST /api/simulate-landslide/{segment_id}
 * Example: POST /api/simulate-landslide/seg-4
 */
export const simulateLandslide = async (segmentId) => {
  const numericId = String(segmentId).replace('seg-', '');
  try {
    // Attempt standard POST as specified in contract
    const res = await apiClient.post(`/api/simulate-landslide/${segmentId}`);
    return res.data;
  } catch (postErr) {
    // If backend mounted on numeric ID or GET, try alternate variations gracefully
    try {
      const res = await apiClient.get(`/api/simulate-landslide/${numericId}`);
      return {
        segment_id: segmentId,
        new_risk_index: res.data.simulated_risk_score || 95,
        templateKey: "alertTemplates.landslideSim",
        params: { segment: segmentId, risk: res.data.simulated_risk_score || 95 },
        alert_message: `CRITICAL ALERT: Simulated landslide on ${segmentId}. Risk elevated to ${res.data.simulated_risk_score || 95}/100. Heavy debris on road shoulder. Transit restricted.`,
        suggested_alternate_route: ["seg-1", "seg-2", "seg-5"]
      };
    } catch {
      console.warn("[API] simulateLandslide backend call failed, returning calculated simulation.", postErr.message);
      return {
        segment_id: segmentId,
        new_risk_index: 92,
        templateKey: "alertTemplates.landslideSim",
        params: { segment: segmentId, risk: 92 },
        alert_message: `CRITICAL ALERT: Simulated landslide on ${segmentId}. Risk elevated to 92/100. Heavy debris on road shoulder. Transit restricted.`,
        suggested_alternate_route: ["seg-1", "seg-2", "seg-5"]
      };
    }
  }
};

/**
 * POST /api/simulate-scenario
 * Request body: { segment_id, hazard_type, severity }
 */
export const simulateScenario = async ({ segment_id, hazard_type, severity }) => {
  const numericId = String(segment_id).replace('seg-', '');
  try {
    const res = await apiClient.post('/api/simulate-scenario', {
      segment_id: numericId,
      hazard_type,
      severity
    });
    return {
      ...res.data,
      templateKey: "alertTemplates.scenarioSimulation",
      params: {
        severity,
        hazard: hazard_type,
        segment: segment_id,
        risk: res.data.new_risk_index,
        level: res.data.new_risk_level
      }
    };
  } catch (err) {
    console.warn("[API] POST /api/simulate-scenario failed, evaluating client-side simulation.", err.message);
    let penalty = 15;
    if (severity === 'moderate') penalty = 40;
    if (severity === 'severe') penalty = 75;

    const baseRisk = 30;
    const newRisk = Math.min(100, baseRisk + penalty);
    const newLevel = newRisk <= 30 ? "Low" : newRisk <= 70 ? "Medium" : "High";
    const routeChanged = newRisk > 70;

    return {
      segment_id: String(segment_id),
      new_risk_index: newRisk,
      new_risk_level: newLevel,
      route_changed: routeChanged,
      new_recommended_route: routeChanged ? ["seg-1", "seg-2", "seg-5"] : null,
      templateKey: "alertTemplates.scenarioSimulation",
      params: {
        severity,
        hazard: hazard_type,
        segment: segment_id,
        risk: newRisk,
        level: newLevel
      },
      alert_message: `Simulated ${severity} ${hazard_type} applied on ${segment_id}. New Risk: ${newRisk} (${newLevel}).`
    };
  }
};

/**
 * POST /api/field-reports
 */
export const submitFieldReport = async (data) => {
  try {
    const res = await apiClient.post('/api/field-reports', data);
    return res.data;
  } catch (err) {
    console.warn("[API] POST /api/field-reports failed.", err.message);
    return { status: "Report recorded locally in demo mode" };
  }
};

/**
 * GET /api/alerts
 */
export const getAlerts = async () => {
  try {
    const res = await apiClient.get('/api/alerts');
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(normalizeAlert);
    }
    return FALLBACK_ALERTS;
  } catch (err) {
    console.warn("[API] GET /api/alerts failed, using fallback alerts.", err.message);
    return FALLBACK_ALERTS;
  }
};

/**
 * GET /api/dashboard-summary
 */
export const getDashboardSummary = async (currentSegments = FALLBACK_SEGMENTS, currentAlerts = FALLBACK_ALERTS) => {
  try {
    const res = await apiClient.get('/api/dashboard-summary');
    const d = res.data;
    if (d && d.total_segments !== undefined) {
      return {
        total_segments: d.total_segments,
        red_count: d.red_count || 0,
        yellow_count: d.yellow_count || 0,
        green_count: d.green_count || 0,
        active_alerts: d.active_alerts || 0,
        last_refresh: d.last_refresh || new Date().toISOString()
      };
    }

    // Adapt if backend returns total_monitored_roads etc.
    let green = 0, yellow = 0, red = 0;
    currentSegments.forEach(s => {
      const r = s.current_risk_index;
      if (r <= 30) green++;
      else if (r <= 70) yellow++;
      else red++;
    });

    return {
      total_segments: currentSegments.length,
      red_count: red,
      yellow_count: yellow,
      green_count: green,
      active_alerts: currentAlerts.filter(a => !a.resolved).length,
      last_refresh: new Date().toISOString()
    };
  } catch (err) {
    console.warn("[API] GET /api/dashboard-summary failed, calculating from state.", err.message);
    let green = 0, yellow = 0, red = 0;
    currentSegments.forEach(s => {
      const r = s.current_risk_index;
      if (r <= 30) green++;
      else if (r <= 70) yellow++;
      else red++;
    });

    return {
      total_segments: currentSegments.length,
      red_count: red,
      yellow_count: yellow,
      green_count: green,
      active_alerts: currentAlerts.filter(a => !a.resolved).length,
      last_refresh: new Date().toISOString()
    };
  }
};
