import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useRouteGuard } from '../context/RouteGuardContext';

const Navbar = ({ onOpenDemoSettings, onOpenAbout }) => {
  const { language, setLanguage, t, locales = [] } = useRouteGuard();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: t('nav.dashboard'), icon: '🏠' },
    { path: '/plan', label: t('nav.routePlanner'), icon: '🧭' },
    { path: '/map', label: t('nav.interactiveMap'), icon: '🗺️' },
    { path: '/route-details', label: t('nav.routeDetails'), icon: '📋' },
    { path: '/simulate', label: t('nav.whatIfSimulation'), icon: '🔬' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0c2e22]/90 backdrop-blur-md border-b border-[#1e4635] shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-tr from-[#2d6a4f] via-[#40916C] to-[#E76F51] rounded-2xl flex items-center justify-center font-heading text-xl shadow-lg shadow-[#2d6a4f]/30 transition-transform group-hover:scale-105 border border-[#52b788]/30">
                🧭
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                    RASTA-NER
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#40916C]/20 text-[#52b788] border border-[#40916C]/40 tracking-wider uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#52b788] animate-pulse"></span>
                    {t('nav.systemStatus') || "MONITORING ACTIVE"}
                  </span>
                </div>
                <span className="text-[10px] text-gray-300 font-bold tracking-wider uppercase hidden sm:block">
                  {t('nav.brandSubtitle')}
                </span>
              </div>
            </NavLink>
          </div>

          {/* Desktop & Tablet Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-heading font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-light/30 to-primary-light/10 text-white border border-[#2d6a4f] shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Multilingual Selector (Always accessible with all 10 Northeast languages) */}
            <div className="flex items-center gap-1.5 bg-[#081C15] border border-[#1e4635] rounded-xl px-2.5 py-1.5 text-xs text-gray-300 shadow-sm" title="Select Interface Language">
              <span className="text-sm select-none" aria-hidden="true">🌐</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label="Select Interface Language"
                className="bg-transparent border-none text-white text-xs focus:outline-none cursor-pointer font-medium max-w-[130px] sm:max-w-[160px] truncate"
              >
                {locales.map((loc) => (
                  <option key={loc.code} value={loc.code} className="bg-[#0c2e22] text-white py-1">
                    {loc.nativeName} ({loc.name})
                  </option>
                ))}
              </select>
            </div>

            {/* About This Prototype Button */}
            <button
              onClick={onOpenAbout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#081C15] hover:bg-[#1B4332] text-gray-300 hover:text-white border border-[#1e4635] hover:border-[#2d6a4f] rounded-xl text-xs font-heading font-semibold transition-all"
              title={t('about.title')}
            >
              <span>ℹ️</span>
              <span className="hidden md:inline">{t('nav.about')}</span>
            </button>

            {/* Demo Mode Settings Gear Button */}
            <button
              onClick={onOpenDemoSettings}
              className="p-2 sm:px-3 sm:py-1.5 bg-accent/15 hover:bg-accent/25 border border-accent/40 text-accent hover:text-white rounded-xl text-xs font-heading font-bold flex items-center gap-1.5 transition-all shadow-sm"
              title={t('settings.title')}
            >
              <span className="text-sm">⚙️</span>
              <span className="hidden md:inline">{t('nav.demoSettings')}</span>
            </button>

            {/* Mobile / Tablet Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/5 border border-[#1e4635] text-gray-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#081C15] border-b border-[#1e4635] px-4 py-4 space-y-2 animate-fade-in">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-heading font-semibold ${
                  isActive
                    ? 'bg-primary border border-[#2d6a4f] text-white'
                    : 'text-gray-300 hover:bg-white/5'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className="pt-3 border-t border-[#1e4635] flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAbout();
              }}
              className="text-xs text-accent font-semibold flex items-center gap-1.5 py-1.5"
            >
              <span>ℹ️</span> {t('about.title')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
