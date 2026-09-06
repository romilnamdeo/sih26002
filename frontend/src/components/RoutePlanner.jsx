import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteGuard } from '../context/RouteGuardContext';
import { getRiskBadgeClasses } from '../utils/risk';
import {
  formatLocation,
  formatSegmentName,
  formatRiskLevel
} from '../utils/translations';

const RoutePlanner = () => {
  const {
    calculateRoutePlan,
    plannedRoute,
    vehicleClass,
    safetyWeight,
    loading,
    error,
    segments,
    language,
    t
  } = useRouteGuard();

  const navigate = useNavigate();

  // Populate endpoints dynamically from corridor nodes
  const endpoints = useMemo(() => {
    return ["Guwahati", "Umiam", "Mawphlang", "Mawkyrwat", "Nongstoin", "Shillong"];
  }, []);

  const [origin, setOrigin] = useState('Guwahati');
  const [destination, setDestination] = useState('Shillong');
  const [vClass, setVClass] = useState(vehicleClass || 'light');
  const [sWeight, setSWeight] = useState(safetyWeight !== undefined ? safetyWeight : 0.5);
  const [localError, setLocalError] = useState('');

  const handleFindRoute = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!origin || !destination) {
      setLocalError(t('planner.errorOriginDest'));
      return;
    }

    if (origin === destination) {
      setLocalError(t('planner.errorDistinct'));
      return;
    }

    try {
      await calculateRoutePlan(origin, destination, vClass, sWeight);
    } catch (err) {
      setLocalError(err.message || t('planner.errorFailed'));
    }
  };

  const getSegmentNameById = (id) => {
    const seg = segments.find(s => s.id === id || String(s.id).includes(id));
    return seg ? formatSegmentName(seg, language) : `Segment ${id}`;
  };

  const formatEta = (minutes) => {
    if (!minutes) return `0 ${t('common.min')}`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}${t('common.hrs')} ${mins}${t('common.min')}` : `${mins} ${t('common.min')}`;
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-6xl mx-auto animate-fade-in pb-10">
      {/* Header Banner */}
      <div className="bg-[#0c2e22]/50 border border-[#1e4635] p-5 sm:p-6 rounded-3xl backdrop-blur-md glass-panel">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🧭</span>
          <div>
            <h2 className="text-lg sm:text-xl font-heading font-black text-white">
              {t('planner.bannerTitle')}
            </h2>
            <p className="text-xs text-gray-300 mt-1 max-w-2xl leading-relaxed">
              {t('planner.bannerSubtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Router Inputs Card (5 cols) */}
        <div className="lg:col-span-5 bg-[#0c2e22]/40 border border-[#1e4635] rounded-3xl p-6 glass-panel flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e4635]">
            <h3 className="font-heading font-bold text-sm sm:text-base text-white">
              {t('planner.parameters')}
            </h3>
            <span className="text-[10px] text-accent font-semibold px-2 py-0.5 rounded bg-accent/15 border border-accent/30">
              {t('planner.corridorBadge')}
            </span>
          </div>

          <form onSubmit={handleFindRoute} className="flex flex-col gap-4">
            {/* Origin */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-gray-300 font-semibold uppercase tracking-wider">
                {t('planner.originTerminal')}
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="bg-[#081C15] border border-[#1e4635] focus:border-accent text-xs rounded-xl p-3 text-white focus:outline-none transition-colors cursor-pointer"
                required
              >
                <option value="">{t('planner.selectOrigin')}</option>
                {endpoints.map((ep) => (
                  <option key={`origin-${ep}`} value={ep}>{formatLocation(ep, language)}</option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-gray-300 font-semibold uppercase tracking-wider">
                {t('planner.destinationTerminal')}
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="bg-[#081C15] border border-[#1e4635] focus:border-accent text-xs rounded-xl p-3 text-white focus:outline-none transition-colors cursor-pointer"
                required
              >
                <option value="">{t('planner.selectDestination')}</option>
                {endpoints.map((ep) => (
                  <option key={`dest-${ep}`} value={ep}>{formatLocation(ep, language)}</option>
                ))}
              </select>
            </div>

            {/* Vehicle Class */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-gray-300 font-semibold uppercase tracking-wider">
                {t('planner.vehicleClass')}
              </label>
              <select
                value={vClass}
                onChange={(e) => setVClass(e.target.value)}
                className="bg-[#081C15] border border-[#1e4635] focus:border-accent text-xs rounded-xl p-3 text-white focus:outline-none transition-colors cursor-pointer"
                required
              >
                <option value="light">{t('vehicles.lightCommercial')}</option>
                <option value="heavy">{t('vehicles.heavyTruck')}</option>
              </select>
              <p className="text-[10px] text-gray-400">
                {t('details.heavyRestrictedNotice')}
              </p>
            </div>

            {/* Safety vs Speed Slider */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex justify-between items-center text-[11px] text-gray-300 font-semibold uppercase tracking-wider">
                <span>{t('planner.safetyWeight')}</span>
                <span className="text-accent font-heading font-black">
                  {Math.round(sWeight * 100)}% {t('common.safe')}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sWeight}
                onChange={(e) => setSWeight(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#081C15] rounded-lg appearance-none cursor-pointer accent-accent border border-[#1e4635] focus:outline-none"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <span>⏱️</span>
                  <span>{t('planner.speedPriority')}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span>{t('planner.safetyPriority')}</span>
                  <span>🛡️</span>
                </span>
              </div>
            </div>

            {/* Errors */}
            {(localError || error) && (
              <div className="bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] text-xs p-3 rounded-xl flex gap-2 items-start leading-snug mt-1">
                <span className="text-sm">⚠️</span>
                <div>
                  <p className="font-bold">{t('common.error')}</p>
                  <p className="text-gray-300 mt-0.5">{localError || error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent hover:bg-accent-light text-white font-heading font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50 shadow-accent/20 active:scale-98 mt-2"
            >
              {loading ? t('planner.calculating') : `🔍 ${t('planner.calculateButton')}`}
            </button>
          </form>
        </div>

        {/* Results Card (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {loading ? (
            /* Loading Skeleton */
            <div className="bg-[#0c2e22]/40 border border-[#1e4635] rounded-3xl p-8 glass-panel h-96 flex flex-col items-center justify-center text-center gap-4 animate-pulse">
              <div className="w-12 h-12 rounded-full border-4 border-accent/30 border-t-accent animate-spin"></div>
              <div>
                <h4 className="text-sm font-heading font-bold text-white">{t('planner.calculating')}</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-sm leading-relaxed">
                  {t('planner.summaryDesc')}
                </p>
              </div>
            </div>
          ) : plannedRoute ? (
            /* Results Presentation */
            <div className="bg-[#0c2e22]/40 border border-[#1e4635] rounded-3xl p-6 sm:p-7 glass-panel flex flex-col gap-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1e4635]">
                <div>
                  <span className="text-[10px] text-accent font-bold uppercase tracking-wider">
                    {t('planner.traversalSummary')}
                  </span>
                  <h3 className="text-lg sm:text-xl font-heading font-black text-white mt-0.5">
                    {formatLocation(origin, language)} &rarr; {formatLocation(destination, language)}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-3 py-1 rounded-xl border font-heading font-bold uppercase ${getRiskBadgeClasses(plannedRoute.overall_risk_level)}`}>
                    {t('planner.transitRiskLevel')}: {formatRiskLevel(plannedRoute.overall_risk_level, language)} ({plannedRoute.total_risk_index}/100)
                  </span>
                </div>
              </div>

              {/* 4 Primary Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-[#081C15]/70 border border-[#1e4635] p-3.5 rounded-2xl">
                  <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t('planner.totalLength')}</span>
                  <span className="block text-lg font-heading font-black text-white mt-1">
                    {plannedRoute.total_length_km} {t('common.km')}
                  </span>
                </div>

                <div className="bg-[#081C15]/70 border border-[#1e4635] p-3.5 rounded-2xl">
                  <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t('planner.dynamicFreightCost')}</span>
                  <span className="block text-lg font-heading font-black text-white mt-1">
                    ₹{plannedRoute.estimated_cost_inr ? plannedRoute.estimated_cost_inr.toLocaleString() : '0'}
                  </span>
                </div>

                <div className="bg-[#081C15]/70 border border-[#1e4635] p-3.5 rounded-2xl">
                  <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t('planner.estimatedEta')}</span>
                  <span className="block text-lg font-heading font-black text-white mt-1">
                    {formatEta(plannedRoute.eta_minutes)}
                  </span>
                </div>

                <div className="bg-[#081C15]/70 border border-[#1e4635] p-3.5 rounded-2xl">
                  <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t('details.riskScore')}</span>
                  <span className="block text-lg font-heading font-black text-accent mt-1">
                    {plannedRoute.total_risk_index}/100
                  </span>
                </div>
              </div>

              {/* Excluded Segments Warning */}
              {plannedRoute.excluded_segments && plannedRoute.excluded_segments.length > 0 && (
                <div className="bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] text-xs p-4 rounded-2xl leading-relaxed flex items-start gap-3">
                  <span className="text-xl">🚫</span>
                  <div>
                    <h4 className="font-bold text-[#E63946] uppercase tracking-wide">
                      {t('planner.segmentsExcludedWarning', {
                        count: plannedRoute.excluded_segments.length,
                        vehicle: vClass === 'heavy' ? t('vehicles.heavyTruck') : t('vehicles.lightCommercial')
                      })}
                    </h4>
                    <ul className="list-disc pl-5 mt-1.5 text-gray-300 space-y-0.5">
                      {plannedRoute.excluded_segments.map((id) => (
                        <li key={`excluded-${id}`} className="font-medium">
                          {getSegmentNameById(id)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Accessibility Notes */}
              {plannedRoute.accessibility_notes && plannedRoute.accessibility_notes.length > 0 && (
                <div className="bg-[#081C15]/50 border border-[#1e4635] p-4 rounded-2xl">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">
                    {t('planner.accessibilityNotes')}
                  </span>
                  <ul className="list-disc pl-4 space-y-1.5 text-xs text-gray-300">
                    {plannedRoute.accessibility_notes.map((note, idx) => (
                      <li key={idx} className="marker:text-accent leading-snug">{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Navigation Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-[#1e4635]">
                <button
                  onClick={() => navigate('/map')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#081C15] hover:bg-[#1B4332] border border-[#1e4635] hover:border-[#2d6a4f] text-gray-200 hover:text-white text-xs font-heading font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <span>🗺️</span>
                  <span>{t('nav.interactiveMap')}</span>
                </button>

                <button
                  onClick={() => navigate('/route-details')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-accent hover:bg-accent-light text-white text-xs font-heading font-bold rounded-xl transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
                >
                  <span>📋</span>
                  <span>{t('planner.viewFullAudit')}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Blank/Prompt State */
            <div className="bg-[#0c2e22]/40 border border-[#1e4635] rounded-3xl p-8 glass-panel h-96 flex flex-col items-center justify-center text-center gap-3">
              <span className="text-4xl">🗺️</span>
              <h3 className="font-heading font-bold text-base text-white">{t('planner.traversalSummary')}</h3>
              <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
                {t('planner.summaryDesc')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;
