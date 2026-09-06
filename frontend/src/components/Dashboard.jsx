import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteGuard } from '../context/RouteGuardContext';
import {
  getRiskBadgeClasses,
  getRiskDotClasses,
  getAccessibilityStroke,
  getAccessibilityColorClass
} from '../utils/risk';
import {
  translateAlert,
  formatSegmentName,
  formatAlertMessage,
  formatStateName
} from '../utils/translations';

const STATE_OPTIONS = [
  { id: 'all', key: 'all' },
  { id: 'assam', key: 'assam' },
  { id: 'arunachal', key: 'arunachal' },
  { id: 'manipur', key: 'manipur' },
  { id: 'meghalaya', key: 'meghalaya' },
  { id: 'mizoram', key: 'mizoram' },
  { id: 'nagaland', key: 'nagaland' },
  { id: 'sikkim', key: 'sikkim' },
  { id: 'tripura', key: 'tripura' }
];

const RISK_OPTIONS = [
  { id: 'all', labelKey: 'filters.allRisks' },
  { id: 'low', labelKey: 'filters.low' },
  { id: 'medium', labelKey: 'filters.medium' },
  { id: 'high', labelKey: 'filters.high' }
];

const Dashboard = () => {
  const {
    segments,
    alerts,
    dashboardSummary,
    refreshData,
    loading,
    config,
    language,
    t
  } = useRouteGuard();

  const navigate = useNavigate();

  // Regional Filter State using stable IDs
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');

  // Filtered Segments according to filter controls
  const filteredSegments = useMemo(() => {
    return segments.filter((seg) => {
      // Risk filter
      if (selectedRisk === 'low' && (seg.current_risk_index > 30 || seg.current_risk_level === 'High' || seg.current_risk_level === 'Medium')) return false;
      if (selectedRisk === 'medium' && (seg.current_risk_index <= 30 || seg.current_risk_index > 70)) return false;
      if (selectedRisk === 'high' && seg.current_risk_index <= 70) return false;

      // State filter
      if (selectedState !== 'all') {
        const segText = `${seg.name || ''} ${seg.from || ''} ${seg.to || ''} ${seg.id || ''}`.toLowerCase();
        if (selectedState === 'assam' && !(segText.includes('guwahati') || segText.includes('assam') || segText.includes('jorabat'))) return false;
        if (selectedState === 'meghalaya' && !(segText.includes('shillong') || segText.includes('umiam') || segText.includes('mawphlang') || segText.includes('mawkyrwat') || segText.includes('nongstoin') || segText.includes('meghalaya'))) return false;
        if (selectedState === 'arunachal' && !(segText.includes('itanagar') || segText.includes('arunachal') || segText.includes('tawang') || segText.includes('ziro') || segText.includes('passighat'))) return false;
        if (selectedState !== 'assam' && selectedState !== 'meghalaya' && selectedState !== 'arunachal') {
          if (!segText.includes(selectedState)) return false;
        }
      }

      return true;
    });
  }, [segments, selectedRisk, selectedState]);

  // Calculate Regional Accessibility Score: 100 - average(current_risk_index across all segments)
  const totalRiskIndex = segments.reduce((sum, s) => sum + (Number(s.current_risk_index) || 0), 0);
  const avgRiskIndex = segments.length > 0 ? totalRiskIndex / segments.length : 0;
  const accessibilityScore = Math.max(0, Math.min(100, Math.round(100 - avgRiskIndex)));

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const handleSegmentClick = (segmentId) => {
    navigate('/map', { state: { selectedSegmentId: segmentId } });
  };

  // Recent alerts sorted by timestamp
  const recentAlerts = useMemo(() => {
    return [...alerts]
      .sort((a, b) => new Date(b.triggered_at || 0) - new Date(a.triggered_at || 0))
      .slice(0, 5);
  }, [alerts]);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 animate-fade-in pb-10">
      {/* Header Banner & Live Telemetry Refresh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0c2e22]/50 border border-[#1e4635] p-5 sm:p-6 rounded-3xl backdrop-blur-md glass-panel">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏔️</span>
            <h2 className="text-lg sm:text-xl font-heading font-black text-white">
              {t('dashboard.bannerTitle')}
            </h2>
          </div>
          <p className="text-xs text-gray-300 mt-1 max-w-3xl leading-relaxed">
            {t('dashboard.bannerSubtitle')}
          </p>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#1e4635]">
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-[#2d6a4f] text-white border border-[#2d6a4f] rounded-xl font-heading text-xs font-semibold shadow-lg transition-all disabled:opacity-50 active:scale-95"
            title={config.ENABLE_LIVE_POLLING ? "Auto-polling active every 5s" : "Click to refresh regional state"}
          >
            <span className={loading ? "animate-spin" : ""}>🔄</span>
            <span>{loading ? t('common.refreshing') : t('common.refresh')}</span>
          </button>
          <span className="text-[10px] text-gray-400">
            {t('common.lastUpdated')}: {formatTime(dashboardSummary.last_refresh)}
          </span>
        </div>
      </div>

      {/* COMPACT REGIONAL FILTER BAR */}
      <div className="bg-[#0c2e22]/40 border border-[#1e4635] px-4 py-3 sm:px-6 sm:py-3.5 rounded-2xl glass-panel flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2 text-xs font-heading font-bold text-accent uppercase tracking-wider">
          <span>🔍</span>
          <span>{t('filters.title') || "Regional Filters"}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full md:w-auto">
          {/* Region Select */}
          <div className="flex items-center gap-2 bg-[#081C15] border border-[#1e4635] px-3 py-1.5 rounded-xl text-xs">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{t('filters.region')}:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0c2e22]">{t('filters.allNorthEast')}</option>
            </select>
          </div>

          {/* State Select */}
          <div className="flex items-center gap-2 bg-[#081C15] border border-[#1e4635] px-3 py-1.5 rounded-xl text-xs">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{t('filters.state')}:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
            >
              {STATE_OPTIONS.map((st) => (
                <option key={st.id} value={st.id} className="bg-[#0c2e22]">
                  {formatStateName(st.key, language)}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Select */}
          <div className="flex items-center gap-2 bg-[#081C15] border border-[#1e4635] px-3 py-1.5 rounded-xl text-xs">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{t('filters.risk')}:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
            >
              {RISK_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-[#0c2e22]">
                  {t(opt.labelKey)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* PRIMARY METRICS & REGIONAL ACCESSIBILITY GAUGE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {/* Radial Gauge for Regional Accessibility Score */}
        <div className="flex items-center gap-5 bg-[#0c2e22]/40 border border-[#1e4635] rounded-3xl p-6 glass-panel relative overflow-hidden">
          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                strokeWidth="3.5"
                stroke="rgba(255,255,255,0.07)"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="transition-all duration-1000 ease-out"
                strokeDasharray={`${accessibilityScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke={getAccessibilityStroke(accessibilityScore)}
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <span className={`text-2xl font-heading font-black tracking-tight ${getAccessibilityColorClass(accessibilityScore)}`}>
                {accessibilityScore}
              </span>
              <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-wider">/ 100</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-accent font-bold uppercase tracking-wider">{t('dashboard.strategicIndicator')}</span>
              <span className="text-[9px] font-semibold text-gray-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">{t('dashboard.prototypeData')}</span>
            </div>
            <h3 className="font-heading font-bold text-sm sm:text-base text-white mt-0.5">
              {t('dashboard.accessibilityScore')}
            </h3>
            <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
              {t('dashboard.accessibilityDesc')}
            </p>
          </div>
        </div>

        {/* Dynamic Segment Risk Pill Counts */}
        <div className="bg-[#0c2e22]/40 border border-[#1e4635] rounded-3xl p-6 glass-panel flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-sm sm:text-base text-white">
              {t('dashboard.corridorRisk')}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {t('dashboard.corridorRiskDesc')}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-[#40916C]/15 border border-[#40916C]/30 rounded-2xl p-3 text-center">
              <span className="block text-2xl font-heading font-black text-[#40916C]">
                {dashboardSummary.green_count || 0}
              </span>
              <span className="text-[9px] font-bold text-[#40916C] uppercase tracking-wider">{t('dashboard.riskLow')}</span>
            </div>
            <div className="bg-[#E9A93B]/15 border border-[#E9A93B]/30 rounded-2xl p-3 text-center">
              <span className="block text-2xl font-heading font-black text-[#E9A93B]">
                {dashboardSummary.yellow_count || 0}
              </span>
              <span className="text-[9px] font-bold text-[#E9A93B] uppercase tracking-wider">{t('dashboard.riskMed')}</span>
            </div>
            <div className="bg-[#E63946]/15 border border-[#E63946]/30 rounded-2xl p-3 text-center">
              <span className="block text-2xl font-heading font-black text-[#E63946]">
                {dashboardSummary.red_count || 0}
              </span>
              <span className="text-[9px] font-bold text-[#E63946] uppercase tracking-wider">{t('dashboard.riskHigh')}</span>
            </div>
          </div>
        </div>

        {/* Regional Network Status */}
        <div className="bg-[#0c2e22]/40 border border-[#1e4635] rounded-3xl p-6 glass-panel flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-sm sm:text-base text-white">
              {t('dashboard.telemetry')}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {t('dashboard.telemetryDesc')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-[#081C15]/70 border border-[#1e4635] rounded-2xl p-3.5">
              <span className="text-gray-400 block text-[9px] uppercase font-bold tracking-wider">{t('dashboard.totalSegments')}</span>
              <span className="text-xl font-heading font-black text-white mt-1 block">
                {dashboardSummary.total_segments || segments.length}
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5 block">{t('dashboard.totalDistanceSub')}</span>
            </div>
            <div className="bg-[#081C15]/70 border border-[#1e4635] rounded-2xl p-3.5">
              <span className="text-gray-400 block text-[9px] uppercase font-bold tracking-wider">{t('dashboard.activeAlerts')}</span>
              <span className="text-xl font-heading font-black text-accent mt-1 block">
                {dashboardSummary.active_alerts || alerts.length}
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5 block">{t('dashboard.activeAlertsSub')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEGMENTS LIST & RECENT ALERTS FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Monitored Route Segments List (7 cols) */}
        <div className="lg:col-span-7 bg-[#0c2e22]/40 border border-[#1e4635] rounded-3xl p-6 glass-panel flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <span>🛣️</span>
                <span>{t('dashboard.monitoredSegments')}</span>
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {t('dashboard.monitoredSegmentsDesc')}
              </p>
            </div>
            <span className="text-[10px] text-accent font-semibold px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 hidden sm:inline-block">
              {filteredSegments.length} {t('segments.count')}
            </span>
          </div>

          {filteredSegments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-[#081C15]/40 rounded-2xl border border-white/5 text-center">
              <span className="text-2xl mb-1">🔍</span>
              <p className="text-xs text-gray-300 font-semibold">{t('dashboard.noSegmentsFound') || "No monitored segments found for selected filter."}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{t('dashboard.adjustFilterHint') || "Adjust state or risk filter to view available regional segments."}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredSegments.map((seg) => (
                <div
                  key={seg.id}
                  onClick={() => handleSegmentClick(seg.id)}
                  className="flex items-center justify-between p-4 bg-[#081C15]/70 border border-[#1e4635] hover:border-accent/50 rounded-2xl cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className={`w-3.5 h-3.5 rounded-full shrink-0 transition-transform group-hover:scale-125 ${getRiskDotClasses(seg.current_risk_index)}`}></span>
                    <div className="truncate">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-100 group-hover:text-white transition-colors truncate">
                        {formatSegmentName(seg, language)}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {t('dashboard.distance')}: <strong className="text-gray-300">{seg.length_km} {t('common.km')}</strong> | {t('dashboard.gradeScore')}: <strong className="text-gray-300">{seg.gradeability_score}/100</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className={`text-[10px] px-2.5 py-1 rounded-lg border font-heading font-bold uppercase ${getRiskBadgeClasses(seg.current_risk_level)}`}>
                      {t('details.riskScore')}: {seg.current_risk_index}
                    </span>
                    {seg.grade_excluded_heavy && (
                      <span className="text-[10px] bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/30 px-2 py-0.5 rounded-lg hidden sm:inline-block" title="Unsafe for heavy trucks due to slope">
                        🚫 {t('dashboard.heavyExcluded')}
                      </span>
                    )}
                    <span className="text-gray-500 group-hover:text-accent group-hover:translate-x-1 transition-transform text-sm pl-1">
                      &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Regional Alerts Feed (5 cols) */}
        <div className="lg:col-span-5 bg-[#0c2e22]/40 border border-[#1e4635] rounded-3xl p-6 glass-panel flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm sm:text-base text-white flex items-center gap-2">
              <span>🚨</span>
              <span>{t('dashboard.recentAlerts')}</span>
            </h3>
            <span className="text-[9px] font-semibold text-accent bg-accent/15 px-2 py-0.5 rounded border border-accent/30 uppercase">
              {t('dashboard.prototypeAlert')}
            </span>
          </div>

          {recentAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-[#081C15]/40 rounded-2xl border border-white/5 text-center">
              <span className="text-2xl mb-1">✓</span>
              <p className="text-xs text-gray-400">{t('dashboard.noAlertsDesc')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentAlerts.map((alert) => {
                const isCritical = String(alert.alert_type).toLowerCase().includes('landslide') ||
                                   String(alert.message).toLowerCase().includes('critical') ||
                                   String(alert.message).toLowerCase().includes('restricted');
                return (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-2xl border flex gap-3 items-start transition-all ${
                      isCritical
                        ? 'bg-[#E63946]/10 border-[#E63946]/30 text-gray-200'
                        : 'bg-[#E9A93B]/10 border-[#E9A93B]/30 text-gray-200'
                    }`}
                  >
                    <span className="text-base shrink-0 mt-0.5">
                      {isCritical ? '🛑' : '⚠️'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-xs font-bold ${isCritical ? 'text-[#E63946]' : 'text-[#E9A93B]'}`}>
                          {translateAlert(language, alert.alert_type)}
                        </h4>
                        <span className="text-[9px] text-gray-400 shrink-0">
                          {formatTime(alert.triggered_at)}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-300 mt-1 leading-snug">
                        {formatAlertMessage(alert, language)}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[9px] text-gray-400 font-semibold uppercase">
                        <span>{t('details.segmentName')}: {alert.segment_id}</span>
                        <span>•</span>
                        <span>{alert.channel || t('dashboard.channel')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
