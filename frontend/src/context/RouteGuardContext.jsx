import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import {
  getConfig as apiGetConfig,
  getSegments as apiGetSegments,
  getAlerts as apiGetAlerts,
  getDashboardSummary as apiGetDashboardSummary,
  getRoutePlan as apiGetRoutePlan,
  simulateLandslide as apiSimulateLandslide,
  simulateScenario as apiSimulateScenario,
  FALLBACK_SEGMENTS,
  FALLBACK_ALERTS
} from '../services/api';
import {
  t as i18nT,
  LOCALES,
  SUPPORTED_LANG_CODES,
  formatLocation,
  formatStateName,
  formatSegmentName,
  formatHazardType,
  formatSeverity,
  formatRiskLevel,
  formatVehicleClass,
  formatAlertMessage,
  translateAlert
} from '../i18n';

const RouteGuardContext = createContext();

const STORAGE_LANG_KEY = 'ner-routeguard-language';

const getInitialLanguage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_LANG_KEY);
    if (saved && SUPPORTED_LANG_CODES.includes(saved)) {
      return saved;
    }
  } catch (err) {
    console.warn("[i18n] Could not read language from localStorage", err);
  }
  return 'en';
};

export const RouteGuardProvider = ({ children }) => {
  // Demo Mode Configuration flags
  const [config, setConfig] = useState({
    ENABLE_LIVE_POLLING: false,
    ENABLE_GPS_SIMULATION: false,
    ENABLE_MULTILINGUAL_ALERTS: true,
    ENABLE_OFFLINE_SYNC_DEMO: false
  });

  const [segments, setSegments] = useState(FALLBACK_SEGMENTS);
  const [alerts, setAlerts] = useState(FALLBACK_ALERTS);
  const [dashboardSummary, setDashboardSummary] = useState({
    total_segments: 5,
    red_count: 1,
    yellow_count: 2,
    green_count: 2,
    active_alerts: 2,
    last_refresh: new Date().toISOString()
  });

  const [plannedRoute, setPlannedRoute] = useState(null);
  const [vehicleClass, setVehicleClass] = useState("light");
  const [safetyWeight, setSafetyWeight] = useState(0.5);
  const [monsoonMode, setMonsoonMode] = useState(false);
  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = useCallback((newLang) => {
    if (SUPPORTED_LANG_CODES.includes(newLang)) {
      setLanguageState(newLang);
      try {
        localStorage.setItem(STORAGE_LANG_KEY, newLang);
      } catch (err) {
        console.warn("[i18n] Could not save language to localStorage", err);
      }
    }
  }, []);

  const t = useCallback((key, params) => i18nT(key, language, params), [language]);
  const locLocation = useCallback((name) => formatLocation(name, language), [language]);
  const locSegment = useCallback((seg) => formatSegmentName(seg, language), [language]);
  const locState = useCallback((st) => formatStateName(st, language), [language]);
  const locHazard = useCallback((h) => formatHazardType(h, language), [language]);
  const locSeverity = useCallback((s) => formatSeverity(s, language), [language]);
  const locRisk = useCallback((r) => formatRiskLevel(r, language), [language]);
  const locVehicle = useCallback((v) => formatVehicleClass(v, language), [language]);
  const locAlertMsg = useCallback((a) => formatAlertMessage(a, language), [language]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial config once on application load
  useEffect(() => {
    let isMounted = true;
    const loadConfig = async () => {
      try {
        const remoteConfig = await apiGetConfig();
        if (isMounted) {
          setConfig(prev => ({
            ...prev,
            ...remoteConfig
          }));
        }
      } catch (err) {
        console.warn("[Config] Error loading remote config. Defaults retained.", err.message);
      }
    };
    loadConfig();
    return () => { isMounted = false; };
  }, []);

  // Fetch all primary resource collections
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [segs, alrts] = await Promise.all([
        apiGetSegments(),
        apiGetAlerts()
      ]);
      const summary = await apiGetDashboardSummary(segs, alrts);

      setSegments(segs);
      setAlerts(alrts);
      setDashboardSummary(summary);
    } catch (err) {
      console.warn("[Data] Backend unreachable. Retaining active state.", err.message);
      setError("Unable to reach backend server. Displaying cached regional network data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial resource load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Live Polling Controller
  // Only runs when ENABLE_LIVE_POLLING is true. Cleans up when false or on unmount.
  useEffect(() => {
    if (!config.ENABLE_LIVE_POLLING) return;

    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, [config.ENABLE_LIVE_POLLING, fetchData]);

  // Helper to recompute local summary when segments/alerts change in client simulation
  const updateSummaryMetrics = (updatedSegs = segments, updatedAlerts = alerts) => {
    let green = 0, yellow = 0, red = 0;
    updatedSegs.forEach(s => {
      const risk = s.current_risk_index;
      if (risk <= 30) green++;
      else if (risk <= 70) yellow++;
      else red++;
    });

    setDashboardSummary({
      total_segments: updatedSegs.length,
      red_count: red,
      yellow_count: yellow,
      green_count: green,
      active_alerts: updatedAlerts.filter(a => !a.resolved).length,
      last_refresh: new Date().toISOString()
    });
  };

  /**
   * Route Plan calculator calling GET /api/route-plan
   */
  const calculateRoutePlan = async (origin, destination, vClass = vehicleClass, sWeight = safetyWeight) => {
    setLoading(true);
    setError(null);

    const safetyWeightNum = parseFloat(sWeight);

    try {
      const routeData = await apiGetRoutePlan({
        origin,
        destination,
        vehicle_class: vClass,
        safety_weight: safetyWeightNum
      });

      setPlannedRoute(routeData);
      setVehicleClass(vClass);
      setSafetyWeight(safetyWeightNum);
      setLoading(false);
      return routeData;
    } catch (err) {
      console.warn("[Router] Routing API call failed, generating safe fallback traversal.", err.message);

      // Algorithmic regional traversal fallback
      const nodes = ["Guwahati", "Umiam", "Mawphlang", "Mawkyrwat", "Nongstoin", "Shillong"];
      const startIndex = nodes.indexOf(origin);
      const endIndex = nodes.indexOf(destination);

      if (startIndex === -1 || endIndex === -1 || startIndex === endIndex) {
        setLoading(false);
        throw new Error("Invalid origin or destination terminal selected.");
      }

      const traversedIds = [];
      const low = Math.min(startIndex, endIndex);
      const high = Math.max(startIndex, endIndex);
      for (let i = low; i < high; i++) {
        traversedIds.push(`seg-${i + 1}`);
      }
      if (startIndex > endIndex) traversedIds.reverse();

      const segObjects = traversedIds.map(id => segments.find(s => s.id === id)).filter(Boolean);
      const totalDist = segObjects.reduce((sum, s) => sum + (s.length_km || 20), 0);
      const avgRisk = segObjects.reduce((sum, s) => sum + (s.current_risk_index || 30), 0) / (segObjects.length || 1);
      
      const totalRisk = Math.round(avgRisk * (1 - safetyWeightNum * 0.15));
      const overallLevel = totalRisk <= 30 ? "Low" : totalRisk <= 70 ? "Medium" : "High";
      const eta = Math.round(totalDist * 1.5 + totalRisk * 0.3);
      const costMultiplier = vClass === "heavy" ? 45 : 18;
      const cost = Math.round(totalDist * costMultiplier * (1 + safetyWeightNum * 0.1));

      const excludedInCorridor = segments
        .filter(s => (vClass === "heavy" && s.grade_excluded_heavy) || (vClass === "light" && s.grade_excluded_light))
        .map(s => s.id);

      const notes = [
        t('routeNotes.vehicleSpec', { vehicle: vClass === "heavy" ? t('vehicles.heavyTruck') : t('vehicles.lightCommercial') }),
        safetyWeightNum >= 0.5 
          ? t('routeNotes.safetyPriority')
          : t('routeNotes.speedPriority'),
        t('routeNotes.sectorsCrossed', { count: segObjects.length })
      ];

      if (segObjects.some(s => excludedInCorridor.includes(s.id))) {
        notes.push(t('routeNotes.gradeWarning'));
      }

      const fallbackRoute = {
        route_segments: traversedIds,
        total_length_km: totalDist,
        total_risk_index: totalRisk,
        overall_risk_level: overallLevel,
        eta_minutes: eta,
        estimated_cost_inr: cost,
        accessibility_notes: notes,
        excluded_segments: excludedInCorridor
      };

      setPlannedRoute(fallbackRoute);
      setVehicleClass(vClass);
      setSafetyWeight(safetyWeightNum);
      setLoading(false);
      return fallbackRoute;
    }
  };

  /**
   * Landslide simulation calling POST /api/simulate-landslide/{segment_id}
   */
  const simulateLandslide = async (segmentId = "seg-4") => {
    try {
      const data = await apiSimulateLandslide(segmentId);

      const newRisk = data.new_risk_index || 95;
      const updatedSegments = segments.map(s => {
        if (s.id === segmentId) {
          return {
            ...s,
            current_risk_index: newRisk,
            current_risk_level: newRisk > 70 ? "High" : newRisk > 30 ? "Medium" : "Low",
            last_updated: new Date().toISOString()
          };
        }
        return s;
      });
      setSegments(updatedSegments);

      const newAlert = {
        id: `alert-landslide-${Date.now()}`,
        segment_id: segmentId,
        triggered_at: new Date().toISOString(),
        templateKey: data.templateKey || "alertTemplates.landslideSim",
        params: data.params || { segment: segmentId, risk: newRisk },
        message: data.alert_message || `CRITICAL: Simulated landslide on ${segmentId}. Blockage reported.`,
        alert_type: "Landslide Incident",
        channel: "VHF Radio / System Push",
        resolved: false
      };

      const updatedAlerts = [newAlert, ...alerts];
      setAlerts(updatedAlerts);
      updateSummaryMetrics(updatedSegments, updatedAlerts);

      return data;
    } catch (err) {
      console.error("[Simulate Landslide]", err);
      throw err;
    }
  };

  /**
   * What-If Scenario simulation calling POST /api/simulate-scenario
   */
  const simulateScenario = async (segmentId, hazardType, severity) => {
    try {
      const data = await apiSimulateScenario({
        segment_id: segmentId,
        hazard_type: hazardType,
        severity
      });
      return data;
    } catch (err) {
      console.error("[Simulate Scenario]", err);
      throw err;
    }
  };

  return (
    <RouteGuardContext.Provider value={{
      config,
      setConfig,
      segments,
      setSegments,
      alerts,
      setAlerts,
      dashboardSummary,
      plannedRoute,
      setPlannedRoute,
      vehicleClass,
      setVehicleClass,
      safetyWeight,
      setSafetyWeight,
      monsoonMode,
      setMonsoonMode,
      language,
      setLanguage,
      t,
      formatLocation: locLocation,
      formatSegmentName: locSegment,
      formatStateName: locState,
      formatHazardType: locHazard,
      formatSeverity: locSeverity,
      formatRiskLevel: locRisk,
      formatVehicleClass: locVehicle,
      formatAlertMessage: locAlertMsg,
      locales: LOCALES,
      loading,
      error,
      calculateRoutePlan,
      simulateLandslide,
      simulateScenario,
      refreshData: fetchData
    }}>
      {children}
    </RouteGuardContext.Provider>
  );
};

export const useRouteGuard = () => useContext(RouteGuardContext);

