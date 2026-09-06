import React, { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { RouteGuardProvider, useRouteGuard } from './context/RouteGuardContext';
import { translations } from './utils/translations';

// Components
import Navbar from './components/Navbar';
import AboutModal from './components/AboutModal';
import DemoSettingsModal from './components/DemoSettingsModal';

// Pages
import Dashboard from './components/Dashboard';
import RoutePlanner from './components/RoutePlanner';
import InteractiveMapPage from './components/InteractiveMapPage';
import RouteDetails from './components/RouteDetails';
import WhatIfSimulation from './components/WhatIfSimulation';

function MainLayout() {
  const { config, t } = useRouteGuard();
  const [showDemoSettings, setShowDemoSettings] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showOfflineBanner, setShowOfflineBanner] = useState(true);

  return (
    <div className="min-h-screen w-full bg-[#081C15] font-body text-gray-100 flex flex-col selection:bg-accent selection:text-white">
      {/* TOP NAVIGATION BAR */}
      <Navbar
        onOpenDemoSettings={() => setShowDemoSettings(true)}
        onOpenAbout={() => setShowAboutModal(true)}
      />

      {/* DISMISSIBLE OFFLINE SYNC BANNER (Only when enabled in demo configuration) */}
      {config.ENABLE_OFFLINE_SYNC_DEMO && showOfflineBanner && (
        <div className="bg-gradient-to-r from-amber-600/30 via-yellow-600/20 to-amber-600/30 border-b border-yellow-500/40 text-yellow-200 px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs animate-fade-in z-30">
          <div className="flex items-center gap-2 max-w-4xl">
            <span className="text-base animate-pulse">📡</span>
            <p>
              <strong className="font-semibold">{t('offlineTitle')}:</strong> {t('offlineDesc')}
            </p>
          </div>
          <button
            onClick={() => setShowOfflineBanner(false)}
            className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg border border-yellow-500/40 text-yellow-100 font-heading font-semibold text-[11px] transition-colors"
          >
            {t('common.dismiss')}
          </button>
        </div>
      )}

      {/* MAIN VIEWPORT CONTAINER */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/plan" element={<RoutePlanner />} />
          <Route path="/map" element={<InteractiveMapPage />} />
          <Route path="/route-details" element={<RouteDetails />} />
          <Route path="/simulate" element={<WhatIfSimulation />} />
        </Routes>
      </main>

      {/* MODALS */}
      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />

      <DemoSettingsModal
        isOpen={showDemoSettings}
        onClose={() => setShowDemoSettings(false)}
      />
    </div>
  );
}

function App() {
  return (
    <RouteGuardProvider>
      <HashRouter>
        <MainLayout />
      </HashRouter>
    </RouteGuardProvider>
  );
}

export default App;
