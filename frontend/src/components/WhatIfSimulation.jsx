import React, { useState } from 'react';
import { useRouteGuard } from '../context/RouteGuardContext';
import { getRiskColor, getRiskBadgeClasses } from '../utils/risk';
import {
  formatLocation,
  formatSegmentName,
  formatHazardType,
  formatSeverity,
  formatRiskLevel,
  formatAlertMessage
} from '../utils/translations';

const WhatIfSimulation = () => {
  const { segments, simulateScenario, loading, language, t } = useRouteGuard();

  // Form State
  const [selectedSegId, setSelectedSegId] = useState('seg-4');
  const [hazardType, setHazardType] = useState('landslide');
  const [severity, setSeverity] = useState('moderate');

  // Simulation Result State
  const [simResult, setSimResult] = useState(null);
  const [localError, setLocalError] = useState('');
  const [history, setHistory] = useState([]);

  const handleRunSimulation = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!selectedSegId) {
      setLocalError(t('simulation.selectSegmentWarning') || t('planner.errorOriginDest'));
      return;
    }

    try {
      const data = await simulateScenario(selectedSegId, hazardType, severity);

      const runRecord = {
        id: `run-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        segmentId: data.segment_id || selectedSegId,
        hazardType,
        severity,
        newRiskIndex: data.new_risk_index,
        newRiskLevel: data.new_risk_level,
        routeChanged: data.route_changed,
        newRecommendedRoute: data.new_recommended_route,
        alertMessage: data.alert_message,
        templateKey: data.templateKey,
        params: data.params
      };

      setSimResult(runRecord);
      setHistory(prev => [runRecord, ...prev]);
    } catch (err) {
      console.error(err);
      setLocalError(err.message || t('planner.errorFailed'));
    }
  };

  const baselineSegment = segments.find(s => s.id === selectedSegId) || segments[0];

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-6xl mx-auto animate-fade-in pb-10">
      {/* Header Banner */}
      <div className="bg-[#0c2e22]/50 border border-[#1e4635] p-5 sm:p-6 rounded-3xl backdrop-blur-md glass-panel">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🔬</span>
          <div>
            <h2 className="text-lg sm:text-xl font-heading font-black text-white">
              {t('simulation.bannerTitle')}
            </h2>
            <p className="text-xs text-gray-300 mt-1 max-w-2xl leading-relaxed">
              {t('simulation.bannerSubtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Controls Card (5 cols) */}
        <div className="lg:col-span-5 bg-[#0c2e22]/40 border border-[#1e4635] rounded-3xl p-6 glass-panel flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e4635]">
            <h3 className="font-heading font-bold text-sm sm:text-base text-white">
              {t('simulation.parameters')}
            </h3>
            <span className="text-[10px] text-accent font-semibold px-2 py-0.5 rounded bg-accent/15 border border-accent/30">
              {t('simulation.inMemoryBadge')}
            </span>
          </div>

          <form onSubmit={handleRunSimulation} className="flex flex-col gap-4">
            {/* Target Segment */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-gray-300 font-semibold uppercase tracking-wider">
                {t('simulation.targetSegment')}
              </label>
              <select
                value={selectedSegId}
                onChange={(e) => setSelectedSegId(e.target.value)}
                className="bg-[#081C15] border border-[#1e4635] focus:border-accent text-xs rounded-xl p-3 text-white focus:outline-none transition-colors cursor-pointer"
                required
              >
                {segments.map((seg) => (
                  <option key={seg.id} value={seg.id}>
                    {formatSegmentName(seg, language)} ({t('details.riskScore')}: {seg.current_risk_index})
                  </option>
                ))}
              </select>
            </div>

            {/* Hazard Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-gray-300 font-semibold uppercase tracking-wider">
                {t('simulation.hazardType')}
              </label>
              <select
                value={hazardType}
                onChange={(e) => setHazardType(e.target.value)}
                className="bg-[#081C15] border border-[#1e4635] focus:border-accent text-xs rounded-xl p-3 text-white focus:outline-none transition-colors cursor-pointer"
                required
              >
                <option value="landslide">{t('simulation.landslide')}</option>
                <option value="flood">{t('simulation.flood')}</option>
                <option value="roadblock">{t('simulation.roadblock')}</option>
              </select>
            </div>

            {/* Severity */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-gray-300 font-semibold uppercase tracking-wider">
                {t('simulation.severity')}
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="bg-[#081C15] border border-[#1e4635] focus:border-accent text-xs rounded-xl p-3 text-white focus:outline-none transition-colors cursor-pointer"
                required
              >
                <option value="mild">{t('simulation.mild')}</option>
                <option value="moderate">{t('simulation.moderate')}</option>
                <option value="severe">{t('simulation.severe')}</option>
              </select>
            </div>

            {/* Non-blocking error */}
            {localError && (
              <div className="bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] text-xs p-3 rounded-xl flex items-start gap-2">
                <span>⚠️</span>
                <span>{localError}</span>
              </div>
            )}

            {/* Run Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent hover:bg-accent-light text-white font-heading font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50 shadow-accent/20 active:scale-98 mt-2"
            >
              {loading ? t('simulation.runningSimulation') : `🔬 ${t('simulation.runSimulationBtn')}`}
            </button>
          </form>
        </div>

        {/* Results Card (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {simResult ? (
            <div className="bg-[#0c2e22]/40 border border-[#1e4635] rounded-3xl p-6 sm:p-7 glass-panel flex flex-col gap-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1e4635]">
                <div>
                  <span className="text-[10px] text-accent font-bold uppercase tracking-wider">
                    {t('simulation.impactAnalysis')}
                  </span>
                  <h3 className="text-base sm:text-lg font-heading font-black text-white mt-0.5">
                    {t('simulation.impactAnalysis')}: {formatSegmentName(simResult.segmentId, language)}
                  </h3>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">
                  {t('common.lastUpdated')}: {simResult.timestamp}
                </span>
              </div>

              {/* Before vs After Side-by-Side Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Baseline */}
                <div className="bg-[#081C15]/70 border border-[#1e4635] p-4 rounded-2xl">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">{t('simulation.baselineAssessment')}</span>
                  <h4 className="text-sm font-semibold text-gray-200 mt-1">
                    {baselineSegment ? formatSegmentName(baselineSegment, language) : simResult.segmentId}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-3xl font-heading font-black text-white">
                      {baselineSegment?.current_risk_index || 30}
                    </span>
                    <span className="text-xs text-gray-400">/ 100</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold uppercase ml-2 ${getRiskBadgeClasses(baselineSegment?.current_risk_level || 'Low')}`}>
                      {formatRiskLevel(baselineSegment?.current_risk_level || 'Low', language)}
                    </span>
                  </div>
                </div>

                {/* Simulated */}
                <div className="bg-[#081C15]/70 border border-[#1e4635] p-4 rounded-2xl">
                  <span className="text-[9px] text-accent font-bold uppercase tracking-wider block">{t('simulation.impactAnalysis')}</span>
                  <h4 className="text-sm font-semibold text-white mt-1">
                    {formatSeverity(simResult.severity, language)} &bull; {formatHazardType(simResult.hazardType, language)}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-3xl font-heading font-black" style={{ color: getRiskColor(simResult.newRiskIndex) }}>
                      {simResult.newRiskIndex}
                    </span>
                    <span className="text-xs text-gray-400">/ 100</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold uppercase ml-2 ${getRiskBadgeClasses(simResult.newRiskLevel)}`}>
                      {formatRiskLevel(simResult.newRiskLevel, language)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rerouting Status & Alert Message */}
              <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                simResult.routeChanged
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-[#40916C]/10 border-[#40916C]/30'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{simResult.routeChanged ? '⚠️' : '✓'}</span>
                  <h4 className={`text-xs sm:text-sm font-heading font-black uppercase tracking-wider ${
                    simResult.routeChanged ? 'text-amber-300' : 'text-[#40916C]'
                  }`}>
                    {simResult.routeChanged ? t('simulation.reroutingTriggered') : t('simulation.routeRemainsSafe')}
                  </h4>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-medium">
                  {formatAlertMessage(simResult, language)}
                </p>

                {simResult.routeChanged && (
                  <div className="mt-2 pt-3 border-t border-amber-500/20">
                    <span className="text-[10px] text-amber-200 font-bold uppercase tracking-wider block mb-2">
                      {t('simulation.alternativePath')}:
                    </span>
                    {simResult.newRecommendedRoute && simResult.newRecommendedRoute.length > 0 ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        {simResult.newRecommendedRoute.map((step, idx) => (
                          <React.Fragment key={`route-step-${idx}`}>
                            {idx > 0 && <span className="text-gray-500 text-xs">&rarr;</span>}
                            <span className="px-2.5 py-1 rounded-lg bg-accent/20 border border-accent/40 text-accent font-heading font-bold text-xs">
                              {formatSegmentName(step, language)}
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-[#E63946]">
                        {t('simulation.noAlt')}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Dynamic Corridor Topology Preview */}
              <div className="bg-[#081C15]/50 border border-[#1e4635] rounded-2xl p-4">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-3">
                  {t('simulation.topographyComparison')}
                </span>
                <div className="flex items-center justify-between overflow-x-auto py-2 px-3 gap-2 bg-[#081C15]/70 rounded-xl min-w-[500px]">
                  {["Guwahati", "Umiam", "Mawphlang", "Mawkyrwat", "Nongstoin", "Shillong"].map((node, idx, arr) => (
                    <React.Fragment key={node}>
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-4 h-4 rounded-full bg-white border-2 border-[#1B4332]"></div>
                        <span className="text-[9px] text-gray-300 font-semibold">{formatLocation(node, language)}</span>
                      </div>
                      {idx < arr.length - 1 && (
                        <div
                          className="flex-1 h-1.5 rounded relative mx-1 shrink-0 min-w-[45px]"
                          style={{
                            backgroundColor: simResult.segmentId === `seg-${idx + 1}`
                              ? getRiskColor(simResult.newRiskIndex)
                              : getRiskColor(segments[idx]?.current_risk_index || 25)
                          }}
                        >
                          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] text-gray-400 font-mono">
                            S{idx + 1}
                          </span>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0c2e22]/40 border border-[#1e4635] rounded-3xl p-8 glass-panel h-96 flex flex-col items-center justify-center text-center gap-3">
              <span className="text-4xl">🔬</span>
              <h3 className="font-heading font-bold text-base text-white">{t('simulation.bannerTitle')}</h3>
              <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
                {t('simulation.bannerSubtitle')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* History Log Table */}
      {history.length > 0 && (
        <div className="bg-[#0c2e22]/40 border border-[#1e4635] rounded-3xl p-6 glass-panel flex flex-col gap-4 animate-fade-in">
          <h3 className="font-heading font-bold text-sm sm:text-base text-white">
            {t('simulation.simulationHistory')}
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-[#1e4635] bg-[#081C15]/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1e4635] text-gray-400 uppercase tracking-wider text-[9px] font-bold">
                  <th className="p-3 pr-2">{t('common.lastUpdated')}</th>
                  <th className="p-3 pr-2">{t('details.segmentName')}</th>
                  <th className="p-3 pr-2">{t('simulation.hazardType')}</th>
                  <th className="p-3 pr-2 text-center">{t('simulation.severity')}</th>
                  <th className="p-3 pr-2 text-center">{t('details.riskScore')}</th>
                  <th className="p-3 text-center">{t('simulation.reroutingTriggered')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e4635]/50 text-gray-200">
                {history.map((run) => (
                  <tr key={run.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono text-[10px] text-gray-400">{run.timestamp}</td>
                    <td className="p-3 font-semibold">{formatSegmentName(run.segmentId, language)}</td>
                    <td className="p-3 capitalize">{formatHazardType(run.hazardType, language)}</td>
                    <td className="p-3 text-center capitalize">{formatSeverity(run.severity, language)}</td>
                    <td className="p-3 text-center font-bold" style={{ color: getRiskColor(run.newRiskIndex) }}>
                      {run.newRiskIndex} ({formatRiskLevel(run.newRiskLevel, language)})
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${
                        run.routeChanged
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-[#40916C]/15 text-[#40916C] border border-[#40916C]/30'
                      }`}>
                        {run.routeChanged ? t('common.yes') : t('common.no')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatIfSimulation;
