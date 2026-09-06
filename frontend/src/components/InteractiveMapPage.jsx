import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useRouteGuard } from '../context/RouteGuardContext';
import { getRiskColor } from '../utils/risk';
import {
  formatLocation,
  formatSegmentName,
  formatAlertMessage,
  formatRiskLevel
} from '../utils/translations';

// Custom Map Markers
const nodeIcon = L.divIcon({
  className: 'custom-node-icon',
  html: `<div style="width: 14px; height: 14px; background: white; border: 2.5px solid #1B4332; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.5);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const activeNodeIcon = L.divIcon({
  className: 'custom-active-node-icon',
  html: `<div style="width: 18px; height: 18px; background: #E76F51; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 0 12px #E76F51;"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

const vehicleIcon = (emoji) => L.divIcon({
  className: 'custom-vehicle-icon',
  html: `<div style="font-size: 22px; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.7));">${emoji}</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

// Map Controller to center and resize map
function MapController({ focusedSegmentId, segments }) {
  const map = useMap();
  const centeredRef = useRef(false);

  useEffect(() => {
    // Invalidate size to ensure container is properly sized
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (focusedSegmentId && segments.length > 0 && !centeredRef.current) {
      const seg = segments.find(s => s.id === focusedSegmentId);
      if (seg) {
        const midLat = (seg.start_lat + seg.end_lat) / 2;
        const midLng = (seg.start_lng + seg.end_lng) / 2;
        map.setView([midLat, midLng], 10.5, { animate: true });
        centeredRef.current = true;
      }
    }
  }, [focusedSegmentId, segments, map]);

  return null;
}

const InteractiveMapPage = () => {
  const {
    segments,
    plannedRoute,
    vehicleClass,
    monsoonMode,
    setMonsoonMode,
    simulateLandslide,
    config,
    language,
    t
  } = useRouteGuard();

  const location = useLocation();
  const focusedSegmentId = location.state?.selectedSegmentId;

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [alternateRoute, setAlternateRoute] = useState(null);
  const [gpsProgress, setGpsProgress] = useState(0);

  const triggerToast = (msg, alternate = null) => {
    setToastMessage(msg);
    if (alternate) setAlternateRoute(alternate);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 6000);
  };

  // Landslide simulation on Segment 4
  const handleLandslideSim = async () => {
    try {
      const res = await simulateLandslide('seg-4');
      triggerToast(res.alert_message, res.suggested_alternate_route);
    } catch {
      triggerToast('CRITICAL ALERT: Simulated landslide on seg-4. Heavy debris on road shoulder.', ["seg-1", "seg-2", "seg-5"]);
    }
  };

  // GPS Simulation Loop
  useEffect(() => {
    if (!config.ENABLE_GPS_SIMULATION) return;

    let animId;
    const updateGps = () => {
      setGpsProgress(prev => {
        const next = prev + 0.0012;
        return next > 1 ? 0 : next;
      });
      animId = requestAnimationFrame(updateGps);
    };

    animId = requestAnimationFrame(updateGps);
    return () => cancelAnimationFrame(animId);
  }, [config.ENABLE_GPS_SIMULATION]);

  // Terminal node positions derived from corridor
  const corridorNodes = useMemo(() => [
    { name: "Guwahati", lat: 26.1445, lng: 91.7362 },
    { name: "Umiam", lat: 25.6888, lng: 91.8841 },
    { name: "Mawphlang", lat: 25.4562, lng: 91.7583 },
    { name: "Mawkyrwat", lat: 25.3214, lng: 91.6215 },
    { name: "Nongstoin", lat: 25.5218, lng: 91.2694 },
    { name: "Shillong", lat: 25.5788, lng: 91.8933 }
  ], []);

  // Center coordinate of corridor
  const mapCenter = useMemo(() => {
    if (segments.length > 0) {
      const avgLat = segments.reduce((sum, s) => sum + s.start_lat, 0) / segments.length;
      const avgLng = segments.reduce((sum, s) => sum + s.start_lng, 0) / segments.length;
      return [avgLat, avgLng];
    }
    return [25.65, 91.65];
  }, [segments]);

  // Helper to interpolate GPS progress along coordinates
  const interpolateCoords = (pts, progress) => {
    if (!pts || pts.length === 0) return null;
    if (pts.length === 1) return pts[0];

    const count = pts.length - 1;
    const pos = progress * count;
    const idx = Math.min(count - 1, Math.floor(pos));
    const tRatio = pos - idx;

    const p1 = pts[idx];
    const p2 = pts[idx + 1];
    return [
      p1[0] + (p2[0] - p1[0]) * tRatio,
      p1[1] + (p2[1] - p1[1]) * tRatio
    ];
  };

  const getVehiclePos = (offset = 0) => {
    let segList = [];
    if (plannedRoute && plannedRoute.route_segments && plannedRoute.route_segments.length > 0) {
      segList = plannedRoute.route_segments
        .map(id => segments.find(s => s.id === id || String(s.id).includes(id)))
        .filter(Boolean);
    }
    if (segList.length === 0) segList = segments;

    const points = [];
    segList.forEach((s, i) => {
      if (i === 0) points.push([s.start_lat, s.start_lng]);
      points.push([s.end_lat, s.end_lng]);
    });

    const prog = (gpsProgress + offset) % 1;
    return interpolateCoords(points, prog);
  };

  // Check if a segment is excluded for the currently configured vehicle class
  const isSegmentExcluded = (segment) => {
    if (vehicleClass === 'heavy') return Boolean(segment.grade_excluded_heavy);
    if (vehicleClass === 'light') return Boolean(segment.grade_excluded_light);
    return false;
  };

  const hasAnyExclusions = segments.some(isSegmentExcluded);

  return (
    <div className="flex flex-col lg:flex-row gap-5 sm:gap-6 h-[calc(100vh-6.5rem)] min-h-[580px] animate-fade-in relative pb-4">
      {/* MAP LEGEND & CONTROL SIDEBAR (Left side, 300px) */}
      <div className="w-full lg:w-72 bg-[#0c2e22]/60 border border-[#1e4635] rounded-3xl p-5 flex flex-col justify-between glass-panel shrink-0 gap-5 overflow-y-auto z-10 shadow-2xl">
        <div className="flex flex-col gap-5">
          {/* Title */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🗺️</span>
              <h3 className="font-heading font-black text-sm text-white">{t('map.title')}</h3>
            </div>
            <p className="text-[10px] text-gray-300 mt-1 leading-snug">
              {t('map.subtitle')}
            </p>
          </div>

          {/* Color Legend */}
          <div className="flex flex-col gap-2.5 bg-[#081C15]/70 border border-[#1e4635] p-3.5 rounded-2xl">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {t('map.riskLegend')}
            </span>
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#40916C] shadow-sm shadow-[#40916C]"></span>
              <span className="text-xs text-gray-200">{t('map.greenRisk')}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#E9A93B] shadow-sm shadow-[#E9A93B]"></span>
              <span className="text-xs text-gray-200">{t('map.yellowRisk')}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#E63946] shadow-sm shadow-[#E63946]"></span>
              <span className="text-xs text-gray-200">{t('map.redRisk')}</span>
            </div>
          </div>

          {/* Grade Exclusion Legend Indicator */}
          <div className="bg-[#081C15]/70 border border-[#1e4635] p-3.5 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 border-t-2 border-dashed border-red-400"></div>
              <span className="text-xs font-semibold text-gray-200">{t('map.gradeExclusion')}</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 leading-snug">
              {hasAnyExclusions
                ? `${t('map.gradeExcludedFor')} ${vehicleClass === 'heavy' ? t('vehicles.heavyTruck') : t('vehicles.lightCommercial')}`
                : t('map.gradeExclusionDesc')}
            </p>
          </div>

          {/* Monsoon Mode Toggle */}
          <div className="bg-[#081C15]/70 border border-[#1e4635] p-3.5 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>🌧️</span>
                  <span>{t('map.monsoonMode')}</span>
                </h4>
                <p className="text-[10px] text-gray-400 mt-0.5">{t('map.monsoonSubtitle')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={monsoonMode}
                  onChange={() => setMonsoonMode(!monsoonMode)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:width-4 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
            {monsoonMode && (
              <div className="text-[10px] text-accent font-semibold bg-accent/15 border border-accent/30 p-2 rounded-xl animate-fade-in">
                ⛈️ {t('map.monsoonActiveNote')}
              </div>
            )}
          </div>
        </div>

        {/* Landslide Simulation Trigger Button */}
        <div className="pt-3 border-t border-[#1e4635] flex flex-col gap-2">
          <button
            onClick={handleLandslideSim}
            className="w-full py-2.5 px-3 bg-accent hover:bg-accent-light text-white font-heading font-bold text-xs rounded-xl shadow-lg transition-all shadow-accent/20 flex items-center justify-center gap-2 active:scale-95"
          >
            <span>🔬</span>
            <span>{t('map.simulateLandslideBtn')}</span>
          </button>
          <span className="text-[9px] text-gray-400 text-center">
            {t('map.simulateLandslideSub')}
          </span>
        </div>
      </div>

      {/* LEAFLET MAP CONTAINER (Flex 1, Explicit Height) */}
      <div className="flex-1 bg-[#081C15] border border-[#1e4635] rounded-3xl overflow-hidden relative shadow-2xl min-h-[400px]">
        <MapContainer
          center={mapCenter}
          zoom={9.5}
          className="w-full h-full min-h-[400px] z-0"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController focusedSegmentId={focusedSegmentId} segments={segments} />

          {/* Corridor Segments Polylines */}
          {segments.map((seg) => {
            const isRouteActive = plannedRoute?.route_segments?.some(
              id => id === seg.id || String(id).includes(seg.id)
            );
            const isExcluded = isSegmentExcluded(seg);
            const color = getRiskColor(seg.current_risk_index, monsoonMode);

            return (
              <Polyline
                key={`poly-${seg.id}`}
                positions={
                  seg.geojson?.coordinates && Array.isArray(seg.geojson.coordinates)
                    ? seg.geojson.coordinates.map(coord => [coord[1], coord[0]])
                    : [
                        [seg.start_lat, seg.start_lng],
                        [seg.end_lat, seg.end_lng]
                      ]
                }
                pathOptions={{
                  color: color,
                  weight: isRouteActive ? 8 : (plannedRoute ? 3.5 : 5),
                  opacity: isRouteActive ? 1.0 : (plannedRoute ? 0.45 : 0.8),
                  dashArray: isExcluded ? '10, 10' : undefined
                }}
              >
                <Popup minWidth={210} className="custom-leaflet-popup">
                  <div className="text-gray-100 flex flex-col gap-2 font-body text-xs p-1">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-accent mb-0.5">
                        {formatSegmentName(seg, language)}
                      </h4>
                      <p className="text-[10px] text-gray-400">
                        {t('map.lengthLabel')}: {seg.length_km} {t('common.km')} | {t('map.updatedLabel')}: {new Date(seg.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#1e4635] pt-2">
                      <span className="text-[10px] text-gray-400">{t('map.currentRisk')}:</span>
                      <span className="font-bold text-xs" style={{ color: color }}>
                        {seg.current_risk_index}/100 ({formatRiskLevel(seg.current_risk_level, language)})
                      </span>
                    </div>

                    {isExcluded && (
                      <div className="bg-[#E63946]/20 border border-[#E63946]/40 text-[#E63946] text-[10px] font-bold uppercase rounded-lg px-2 py-1 text-center mt-1">
                        🚫 {t('map.notSafeWarning')} {vehicleClass === 'heavy' ? t('vehicles.heavyTruck') : t('vehicles.lightCommercial')}
                      </div>
                    )}

                    {/* Recharts Explainable Sub-Scores Breakdown */}
                    <div className="border-t border-[#1e4635] pt-2.5 mt-1">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                        {t('map.riskBreakdown')}
                      </span>
                      <BarChart
                        width={180}
                        height={90}
                        data={[
                          { name: t('map.erosionScore'), score: seg.erosion_vulnerability_index },
                          { name: t('map.gradeabilityScore'), score: seg.gradeability_score }
                        ]}
                        margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                      >
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#9ca3af' }} />
                        <YAxis tick={{ fontSize: 8, fill: '#9ca3af' }} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0c2e22', borderColor: '#1e4635', fontSize: '10px' }}
                        />
                        <Bar dataKey="score" fill="#E76F51" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            );
          })}

          {/* Terminal Node Markers */}
          {corridorNodes.map((node) => (
            <Marker
              key={node.name}
              position={[node.lat, node.lng]}
              icon={focusedSegmentId && segments.find(s => s.id === focusedSegmentId)?.name.includes(node.name) ? activeNodeIcon : nodeIcon}
            >
              <Popup>
                <div className="font-body text-xs text-gray-200">
                  <h4 className="font-heading font-bold text-white">{formatLocation(node.name, language)} {t('map.terminal')}</h4>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {t('map.latitude')}: {node.lat.toFixed(4)}&deg;<br />
                    {t('map.longitude')}: {node.lng.toFixed(4)}&deg;
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Lightweight Animated Vehicle Markers (GPS Simulation) */}
          {config.ENABLE_GPS_SIMULATION && (
            <>
              {getVehiclePos(0) && (
                <Marker position={getVehiclePos(0)} icon={vehicleIcon('🚚')}>
                  <Popup>
                    <div className="text-xs text-gray-100 font-body">
                      <span className="font-bold text-white">{t('vehicles.heavyTruck')} #1</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">42 {t('common.km')}/h | {t('nav.systemStatus')}</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              {getVehiclePos(0.35) && (
                <Marker position={getVehiclePos(0.35)} icon={vehicleIcon('🚗')}>
                  <Popup>
                    <div className="text-xs text-gray-100 font-body">
                      <span className="font-bold text-white">{t('vehicles.lightCommercial')} #2</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">55 {t('common.km')}/h | {t('nav.systemStatus')}</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              {getVehiclePos(0.7) && (
                <Marker position={getVehiclePos(0.7)} icon={vehicleIcon('🚐')}>
                  <Popup>
                    <div className="text-xs text-gray-100 font-body">
                      <span className="font-bold text-white">{t('vehicles.lightCommercial')} #3</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">48 {t('common.km')}/h | {t('nav.systemStatus')}</p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </>
          )}
        </MapContainer>
      </div>

      {/* TOAST SYSTEM (Landslide Simulation Alerts) */}
      {showToast && (
        <div className="absolute bottom-6 right-6 max-w-sm bg-[#0c2e22] border-2 border-accent text-white p-4 rounded-2xl shadow-2xl z-50 glass-panel animate-fade-in flex flex-col gap-2">
          <div className="flex items-start gap-3">
            <span className="text-xl">📢</span>
            <div>
              <h4 className="text-xs font-bold text-accent uppercase tracking-wider">
                {t('map.simAlertTitle') || "Regional Hazard Simulation Alert"}
              </h4>
              <p className="text-xs text-gray-200 mt-1 leading-snug">
                {formatAlertMessage(toastMessage, language)}
              </p>
            </div>
          </div>
          {alternateRoute && (
            <div className="pt-2 border-t border-[#1e4635] text-[10px] text-gray-300">
              <strong>{t('map.suggestedAlternate') || "Suggested Alternate"}:</strong>{' '}
              {Array.isArray(alternateRoute)
                ? alternateRoute.map(r => formatSegmentName(r, language)).join(' → ')
                : formatSegmentName(alternateRoute, language)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InteractiveMapPage;
