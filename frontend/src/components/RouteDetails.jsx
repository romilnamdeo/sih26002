import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useRouteGuard } from '../context/RouteGuardContext';
import { getRiskBadgeClasses } from '../utils/risk';
import {
  formatSegmentName,
  formatRiskLevel
} from '../utils/translations';

const RouteDetails = () => {
  const { plannedRoute, segments, refreshData, loading, config, language, t } = useRouteGuard();
  const navigate = useNavigate();

  // If no route has been planned yet
  if (!plannedRoute || !plannedRoute.route_segments || plannedRoute.route_segments.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 sm:p-12 text-center animate-fade-in">
        <div className="bg-[#0c2e22]/50 border border-[#1e4635] p-10 sm:p-14 rounded-3xl glass-panel flex flex-col items-center gap-6">
          <span className="text-5xl">📋</span>
          <div>
            <h3 className="font-heading font-black text-xl text-white mb-2">{t('details.noRouteTitle')}</h3>
            <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
              {t('details.noRouteDesc')}
            </p>
          </div>
          <Link
            to="/plan"
            className="px-6 py-3 bg-accent hover:bg-accent-light text-white font-heading font-bold text-xs rounded-xl shadow-lg transition-all shadow-accent/20 active:scale-95 flex items-center gap-2"
          >
            <span>🧭</span>
            <span>{t('details.planRouteBtn')}</span>
          </Link>
        </div>
      </div>
    );
  }

  // Map route segments data in traversal sequence
  const routeSegmentsData = plannedRoute.route_segments.map(segId => {
    const segObj = segments.find(s => s.id === segId || String(s.id).includes(segId));
    return {
      id: segId,
      name: segObj ? formatSegmentName(segObj, language) : `Segment ${segId}`,
      rawObj: segObj,
      length_km: segObj ? segObj.length_km : 20,
      risk_level: segObj ? segObj.current_risk_level : 'Low',
      risk_index: segObj ? segObj.current_risk_index : 25,
      erosion: segObj ? segObj.erosion_vulnerability_index : 30,
      gradeability: segObj ? segObj.gradeability_score : 80
    };
  });

  const formatEta = (minutes) => {
    if (!minutes) return `0 ${t('common.min')}`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}${t('common.hrs')} ${mins}${t('common.min')}` : `${mins} ${t('common.min')}`;
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-6xl mx-auto animate-fade-in pb-10">
      {/* Route Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0c2e22]/50 border border-[#1e4635] p-5 sm:p-6 rounded-3xl backdrop-blur-md glass-panel">
        <div>
          <span className="text-[10px] text-accent font-bold uppercase tracking-wider">
            {t('details.auditHeader')}
          </span>
          <h2 className="text-lg sm:text-xl font-heading font-black text-white mt-0.5">
            {t('details.bannerTitle')}
          </h2>
          <p className="text-xs text-gray-300 mt-1">
            {t('details.bannerSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            disabled={loading}
            className="px-4 py-2 bg-[#081C15] hover:bg-[#1B4332] text-gray-200 hover:text-white border border-[#1e4635] hover:border-[#2d6a4f] text-xs font-heading font-semibold rounded-xl transition-all flex items-center gap-2"
            title={config.ENABLE_LIVE_POLLING ? "Live Polling Active (5s)" : "Click to refresh route telemetry"}
          >
            <span className={loading ? "animate-spin" : ""}>🔄</span>
            <span>{loading ? t('common.refreshing') : (config.ENABLE_LIVE_POLLING ? t('details.livePolling') : t('common.refresh'))}</span>
          </button>

          <button
            onClick={() => navigate('/plan')}
            className="px-4 py-2 bg-accent hover:bg-accent-light text-white text-xs font-heading font-bold rounded-xl transition-all shadow-md shadow-accent/20"
          >
            {t('details.adjustRouteBtn')}
          </button>
        </div>
      </div>

      {/* Primary Metrics (ETA, Estimated Cost, Overall Risk, Risk Index) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* ETA */}
        <div className="bg-[#0c2e22]/40 border border-[#1e4635] rounded-3xl p-5 glass-panel">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{t('details.etaLabel')}</span>
          <span className="text-2xl sm:text-3xl font-heading font-black text-white mt-1.5 block tracking-tight">
            {formatEta(plannedRoute.eta_minutes)}
          </span>
          <span className="text-[10px] text-gray-400 mt-2 block">
            {t('planner.costEstimateNote')}
          </span>
        </div>

        {/* Cost */}
        <div className="bg-[#0c2e22]/40 border border-[#1e4635] rounded-3xl p-5 glass-panel">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{t('details.costLabel')}</span>
          <span className="text-2xl sm:text-3xl font-heading font-black text-white mt-1.5 block tracking-tight">
            ₹{plannedRoute.estimated_cost_inr ? plannedRoute.estimated_cost_inr.toLocaleString() : '0'}
          </span>
          <span className="text-[10px] text-gray-400 mt-2 block">
            {t('planner.costEstimateNote')}
          </span>
        </div>

        {/* Overall Risk */}
        <div className="bg-[#0c2e22]/40 border border-[#1e4635] rounded-3xl p-5 glass-panel">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{t('details.riskLevelLabel')}</span>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs px-2.5 py-1 rounded-lg border font-heading font-bold uppercase ${getRiskBadgeClasses(plannedRoute.overall_risk_level)}`}>
              {formatRiskLevel(plannedRoute.overall_risk_level, language)}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 mt-2 block">
            {t('details.auditHeader')}
          </span>
        </div>

        {/* Risk Index */}
        <div className="bg-[#0c2e22]/40 border border-[#1e4635] rounded-3xl p-5 glass-panel">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{t('details.riskIndexLabel')}</span>
          <span className="text-2xl sm:text-3xl font-heading font-black text-accent mt-1.5 block tracking-tight">
            {plannedRoute.total_risk_index}/100
          </span>
          <span className="text-[10px] text-gray-400 mt-2 block">
            {t('details.auditHeader')}
          </span>
        </div>
      </div>

      {/* PER-SEGMENT BREAKDOWN TABLE & RECHARTS RISK PROFILE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Table & Notes (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Per-Segment Breakdown Table */}
          <div className="bg-[#0c2e22]/40 border border-[#1e4635] rounded-3xl p-6 glass-panel flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm sm:text-base text-white">
                {t('details.routeSegmentsTitle')}
              </h3>
              <span className="text-[10px] text-gray-400 font-medium">
                {routeSegmentsData.length} {t('details.monitoredSectors')}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1e4635] text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                    <th className="pb-3 pr-2">{t('details.segmentName')}</th>
                    <th className="pb-3 pr-2 text-center">{t('dashboard.distance')}</th>
                    <th className="pb-3 pr-2 text-center">{t('details.riskLevelLabel')}</th>
                    <th className="pb-3 pr-2 text-center">{t('details.riskScore')}</th>
                    <th className="pb-3 text-center">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e4635]/60 text-gray-200">
                  {routeSegmentsData.map((seg) => (
                    <tr key={seg.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-2 font-semibold text-gray-200">
                        {seg.name}
                      </td>
                      <td className="py-3 pr-2 text-center">{seg.length_km} {t('common.km')}</td>
                      <td className="py-3 pr-2 text-center">
                        <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-heading font-bold uppercase ${getRiskBadgeClasses(seg.risk_level)}`}>
                          {formatRiskLevel(seg.risk_level, language)}
                        </span>
                      </td>
                      <td className="py-3 pr-2 text-center font-bold text-gray-200">
                        {seg.risk_index}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => navigate('/map', { state: { selectedSegmentId: seg.id } })}
                          className="px-2.5 py-1 bg-[#081C15] border border-[#1e4635] hover:border-accent text-accent hover:text-white rounded-lg text-[10px] font-medium transition-all"
                        >
                          {t('nav.interactiveMap')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Accessibility Notes Bullet Points */}
          <div className="bg-[#0c2e22]/40 border border-[#1e4635] rounded-3xl p-6 glass-panel flex flex-col gap-3">
            <h3 className="font-heading font-bold text-sm sm:text-base text-white flex items-center gap-2">
              <span>📝</span>
              <span>{t('planner.accessibilityNotes')}</span>
            </h3>
            {plannedRoute.accessibility_notes && plannedRoute.accessibility_notes.length > 0 ? (
              <ul className="flex flex-col gap-2 pl-4 list-disc text-xs text-gray-300 leading-relaxed">
                {plannedRoute.accessibility_notes.map((note, index) => (
                  <li key={index} className="marker:text-accent font-medium">
                    {note}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400 italic">{t('details.noObstacles') || "No specific obstacle notes reported for this corridor path."}</p>
            )}
          </div>
        </div>

        {/* Recharts Bar Chart: Risk Index by Segment (5 cols) */}
        <div className="lg:col-span-5 bg-[#0c2e22]/40 border border-[#1e4635] rounded-3xl p-6 glass-panel flex flex-col justify-between min-h-[380px]">
          <div>
            <h3 className="font-heading font-bold text-sm sm:text-base text-white">
              {t('details.segmentRiskIndex')}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {t('details.auditHeader')}
            </p>
          </div>

          <div className="w-full h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={routeSegmentsData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e4635" opacity={0.5} />
                <XAxis
                  dataKey="id"
                  stroke="#6b7280"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  interval={0}
                />
                <YAxis
                  stroke="#6b7280"
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c2e22',
                    borderColor: '#1e4635',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#E76F51' }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar
                  dataKey="risk_index"
                  name={t('details.riskScore')}
                  fill="#E76F51"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <span className="text-[10px] text-gray-400 text-center block mt-2 font-semibold uppercase tracking-wider">
            {t('details.segmentRiskIndex')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RouteDetails;
