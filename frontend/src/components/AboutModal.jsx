import React from 'react';
import { useRouteGuard } from '../context/RouteGuardContext';

const AboutModal = ({ isOpen, onClose }) => {
  const { t } = useRouteGuard();
  if (!isOpen) return null;

  const capabilities = [
    { icon: "🛣️", text: t('about.cap1') },
    { icon: "🏔️", text: t('about.cap2') },
    { icon: "🌧️", text: t('about.cap3') },
    { icon: "🚨", text: t('about.cap4') },
    { icon: "⚖️", text: t('about.cap5') },
    { icon: "🧭", text: t('about.cap6') },
    { icon: "🔬", text: t('about.cap7') },
    { icon: "📊", text: t('about.cap8') }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl bg-[#0c2e22] border border-[#1e4635] rounded-3xl p-6 sm:p-8 shadow-2xl glass-panel relative flex flex-col gap-5 text-gray-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1e4635]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#2d6a4f] to-accent flex items-center justify-center text-xl text-white shadow-lg shadow-accent/20">
              🧭
            </div>
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-black text-white">{t('about.title')}</h3>
              <p className="text-[11px] text-accent font-bold tracking-wide uppercase">{t('about.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors text-lg"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Core Description */}
        <div className="text-xs leading-relaxed text-gray-300 bg-[#081C15]/50 border border-[#1e4635] p-4 rounded-2xl">
          <p className="leading-relaxed">
            {t('about.description')}
          </p>
        </div>

        {/* Platform Capabilities Grid */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {t('about.capabilitiesTitle') || "CORE PLATFORM CAPABILITIES"}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {capabilities.map((cap, idx) => (
              <div key={idx} className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#081C15]/70 border border-[#1e4635]/70">
                <span className="text-lg shrink-0">{cap.icon}</span>
                <p className="text-xs font-semibold text-white leading-snug">{cap.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Real GIS vs Scenario Intelligence Notice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
          <div className="bg-[#081C15]/70 border border-[#2d6a4f]/50 p-4 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#40916C] font-heading font-bold">
              <span>🌐</span>
              <span>{t('about.realDataTitle')}</span>
            </div>
            <ul className="text-[11px] text-gray-300 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>{t('about.realData1')}</li>
              <li>{t('about.realData2')}</li>
              <li>{t('about.realData3')}</li>
            </ul>
          </div>

          <div className="bg-[#081C15]/70 border border-[#E76F51]/40 p-4 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-accent font-heading font-bold">
              <span>🔬</span>
              <span>{t('about.simDataTitle')}</span>
            </div>
            <ul className="text-[11px] text-gray-300 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>{t('about.simData1')}</li>
              <li>{t('about.simData2')}</li>
              <li>{t('about.simData3')}</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1e4635] text-[11px] text-gray-400">
          <span className="font-medium">{t('about.footerNote')}</span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-accent hover:bg-accent-light text-white font-heading font-bold text-xs rounded-xl shadow-lg transition-all shadow-accent/20"
          >
            {t('about.understoodBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
