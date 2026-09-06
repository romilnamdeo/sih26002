import React from 'react';
import { useRouteGuard } from '../context/RouteGuardContext';

const DemoSettingsModal = ({ isOpen, onClose }) => {
  const { config, setConfig, t } = useRouteGuard();

  if (!isOpen) return null;

  const handleToggle = (flag) => {
    setConfig(prev => ({
      ...prev,
      [flag]: !prev[flag]
    }));
  };

  const settingsList = [
    {
      key: 'ENABLE_LIVE_POLLING',
      title: t('settings.livePollingTitle'),
      description: t('settings.livePollingDesc'),
      icon: '🔄'
    },
    {
      key: 'ENABLE_GPS_SIMULATION',
      title: t('settings.gpsSimulationTitle'),
      description: t('settings.gpsSimulationDesc'),
      icon: '🚚'
    },
    {
      key: 'ENABLE_MULTILINGUAL_ALERTS',
      title: t('settings.multilingualTitle'),
      description: t('settings.multilingualDesc'),
      icon: '🌐'
    },
    {
      key: 'ENABLE_OFFLINE_SYNC_DEMO',
      title: t('settings.offlineSyncTitle'),
      description: t('settings.offlineSyncDesc'),
      icon: '📡'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0c2e22] border border-[#1e4635] rounded-3xl p-6 shadow-2xl glass-panel relative flex flex-col gap-5 text-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1e4635]">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⚙️</span>
            <div>
              <h3 className="font-heading text-base font-bold text-white">{t('settings.title')}</h3>
              <p className="text-[10px] text-accent font-semibold">{t('settings.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Switches List */}
        <div className="flex flex-col gap-4">
          {settingsList.map((item) => {
            const isChecked = Boolean(config[item.key]);
            return (
              <div
                key={item.key}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#081C15]/60 border border-[#1e4635]/60 hover:border-[#2d6a4f] transition-all"
              >
                <div className="flex items-start gap-3 pr-2">
                  <span className="text-lg mt-0.5">{item.icon}</span>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{item.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{item.description}</p>
                  </div>
                </div>

                {/* Toggle switch */}
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle(item.key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                </label>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t border-[#1e4635] flex items-center justify-between text-[10px] text-gray-400">
          <span>{t('settings.footerNote')}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1B4332] hover:bg-[#2d6a4f] border border-[#2d6a4f] text-white rounded-xl font-heading font-semibold text-xs transition-colors"
          >
            {t('settings.doneBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoSettingsModal;
