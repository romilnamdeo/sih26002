/**
 * RASTA-NER — Centralized Multilingual / i18n Architecture
 * 
 * Supports 10 language options across the North Eastern Region:
 * 1. English (en) — Default / Common / Fallback
 * 2. Hindi (hi) — National / Inter-State Logistics
 * 3. Assamese (as) — Assam
 * 4. Nyishi (nys) — Arunachal Pradesh
 * 5. Meitei / Manipuri (mni) — Manipur
 * 6. Khasi (kha) — Meghalaya
 * 7. Mizo (lus) — Mizoram
 * 8. Nagamese (nag) — Nagaland
 * 9. Nepali (ne) — Sikkim
 * 10. Bengali (bn) — Tripura
 */

import en from './locales/en';
import hi from './locales/hi';
import as from './locales/as';
import nys from './locales/nys';
import mni from './locales/mni';
import kha from './locales/kha';
import lus from './locales/lus';
import nag from './locales/nag';
import ne from './locales/ne';
import bn from './locales/bn';

export const LOCALES = [
  { code: 'en', name: 'English', nativeName: 'English', label: 'English', state: 'Default / Common' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', label: 'हिन्दी (Hindi)', state: 'National Logistics' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', label: 'অসমীয়া (Assamese)', state: 'Assam' },
  { code: 'nys', name: 'Nyishi', nativeName: 'Nyishi', label: 'Nyishi', state: 'Arunachal Pradesh' },
  { code: 'mni', name: 'Meitei / Manipuri', nativeName: 'মৈতৈলোন্', label: 'মৈতৈলোন্ (Manipuri)', state: 'Manipur' },
  { code: 'kha', name: 'Khasi', nativeName: 'Khasi', label: 'Khasi', state: 'Meghalaya' },
  { code: 'lus', name: 'Mizo', nativeName: 'Mizo', label: 'Mizo', state: 'Mizoram' },
  { code: 'nag', name: 'Nagamese', nativeName: 'Nagamese', label: 'Nagamese', state: 'Nagaland' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', label: 'नेपाली (Nepali)', state: 'Sikkim' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', label: 'বাংলা (Bengali)', state: 'Tripura' }
];

export const SUPPORTED_LANG_CODES = LOCALES.map(l => l.code);

export const dictionaries = {
  en,
  hi,
  as,
  nys,
  mni,
  kha,
  kr: kha, // Alias for backward compatibility
  lus,
  nag,
  ne,
  bn
};

/**
 * Resolves dot-notated or top-level key paths in an object.
 * e.g. "dashboard.accessibilityScore" -> obj.dashboard.accessibilityScore
 */
function resolveKey(obj, path) {
  if (!obj || !path) return undefined;
  if (obj[path] !== undefined) return obj[path];

  const parts = String(path).split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
}

/**
 * Interpolates variables within a string template.
 * E.g. "Hello {name}" with { name: "World" } -> "Hello World"
 */
function interpolate(template, params = {}) {
  if (typeof template !== 'string' || !params || Object.keys(params).length === 0) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined && params[key] !== null ? String(params[key]) : match;
  });
}

/**
 * Centralized translation lookup function with strict English fallback and variable interpolation.
 * 
 * Signature:
 * t(key, lang, params) or t(key, params) when called with lang from context
 * 
 * Rules:
 * - If translated value exists in selected language, interpolate and return it.
 * - If missing or empty in selected language, fallback to English with interpolation.
 * - Never returns undefined, null, or [object Object].
 */
export function t(key, langOrParams = 'en', optionalParams = {}) {
  if (!key) return '';

  let lang = 'en';
  let params = {};

  if (typeof langOrParams === 'string' && SUPPORTED_LANG_CODES.includes(langOrParams)) {
    lang = langOrParams;
    params = optionalParams || {};
  } else if (typeof langOrParams === 'object' && langOrParams !== null) {
    params = langOrParams;
    lang = 'en';
  } else if (typeof langOrParams === 'string') {
    lang = dictionaries[langOrParams] ? langOrParams : 'en';
    params = optionalParams || {};
  }

  const targetDict = dictionaries[lang] || dictionaries.en;

  // 1. Check in requested language
  const translated = resolveKey(targetDict, key);
  if (translated !== undefined && translated !== null && translated !== '') {
    return typeof translated === 'string' ? interpolate(translated, params) : translated;
  }

  // 2. Fallback to English
  const englishVal = resolveKey(dictionaries.en, key);
  if (englishVal !== undefined && englishVal !== null && englishVal !== '') {
    return typeof englishVal === 'string' ? interpolate(englishVal, params) : englishVal;
  }

  // 3. Fallback to key or key's last segment if not found anywhere
  return key;
}

/**
 * Standardize Location Name to normalized key
 */
export function normalizeLocationKey(loc) {
  if (!loc) return '';
  return String(loc).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Translates geographic location / city / terminal name
 */
export function formatLocation(locationName, lang = 'en') {
  if (!locationName) return '';
  const key = normalizeLocationKey(locationName);
  const localized = t(`locations.${key}`, lang);
  if (localized && localized !== `locations.${key}`) {
    return localized;
  }
  return locationName;
}

/**
 * Translates state name
 */
export function formatStateName(stateName, lang = 'en') {
  if (!stateName) return '';
  const key = normalizeLocationKey(stateName);
  const localized = t(`states.${key}`, lang);
  if (localized && localized !== `states.${key}`) {
    return localized;
  }
  return stateName;
}

/**
 * Formats a route segment display name (e.g. "seg-1: Guwahati → Umiam" -> localized)
 */
export function formatSegmentName(segmentOrName, lang = 'en') {
  if (!segmentOrName) return '';

  let id = '';
  let from = '';
  let to = '';

  if (typeof segmentOrName === 'object' && segmentOrName !== null) {
    id = segmentOrName.id || '';
    from = segmentOrName.from || '';
    to = segmentOrName.to || '';

    // If from/to not explicitly on object, try extracting from name
    if ((!from || !to) && segmentOrName.name) {
      const match = segmentOrName.name.match(/(?:(seg-\d+|[A-Za-z0-9_-]+):\s*)?([^→\-]+)\s*(?:→|-|to)\s*(.+)/i);
      if (match) {
        if (!id && match[1]) id = match[1];
        if (!from) from = match[2]?.trim();
        if (!to) to = match[3]?.trim();
      }
    }
  } else if (typeof segmentOrName === 'string') {
    const match = segmentOrName.match(/(?:(seg-\d+|[A-Za-z0-9_-]+):\s*)?([^→\-]+)\s*(?:→|-|to)\s*(.+)/i);
    if (match) {
      id = match[1] || '';
      from = match[2]?.trim() || '';
      to = match[3]?.trim() || '';
    } else {
      return segmentOrName;
    }
  }

  if (from && to) {
    const locFrom = formatLocation(from, lang);
    const locTo = formatLocation(to, lang);
    if (id) {
      return `${id}: ${locFrom} → ${locTo}`;
    }
    return `${locFrom} → ${locTo}`;
  }

  return typeof segmentOrName === 'object' ? (segmentOrName.name || segmentOrName.id) : segmentOrName;
}

/**
 * Translates hazard type
 */
export function formatHazardType(hazard, lang = 'en') {
  if (!hazard) return '';
  const key = normalizeLocationKey(hazard);
  const lookup = t(`hazards.${key}`, lang);
  if (lookup && lookup !== `hazards.${key}`) return lookup;
  return t(`alerts.${hazard}`, lang) || hazard;
}

/**
 * Translates hazard severity
 */
export function formatSeverity(severity, lang = 'en') {
  if (!severity) return '';
  const key = normalizeLocationKey(severity);
  const lookup = t(`severities.${key}`, lang);
  if (lookup && lookup !== `severities.${key}`) return lookup;
  return severity;
}

/**
 * Translates risk level (Low, Medium, High, Critical)
 */
export function formatRiskLevel(level, lang = 'en') {
  if (!level) return '';
  const key = normalizeLocationKey(level);
  const lookup = t(`riskLevels.${key}`, lang);
  if (lookup && lookup !== `riskLevels.${key}`) return lookup;
  return level;
}

/**
 * Translates vehicle classification
 */
export function formatVehicleClass(vClass, lang = 'en') {
  if (!vClass) return '';
  const key = normalizeLocationKey(vClass);
  const lookup = t(`vehicles.${key}`, lang);
  if (lookup && lookup !== `vehicles.${key}`) return lookup;
  return vClass;
}

/**
 * Formats incident / hazard alert messages dynamically
 */
export function formatAlertMessage(alert, lang = 'en') {
  if (!alert) return '';
  if (typeof alert === 'string') {
    // If it is a known alert template or simple string
    const matchSimLandslide = alert.match(/simulated\s+landslide\s+on\s+([a-zA-Z0-9_-]+)/i);
    if (matchSimLandslide) {
      const seg = matchSimLandslide[1];
      const riskMatch = alert.match(/(\d+)\s*\/\s*100|risk\s*(?:is|elevated to)?\s*(\d+)/i);
      const riskVal = riskMatch ? (riskMatch[1] || riskMatch[2]) : '90';
      return t('alertTemplates.landslideSim', lang, { segment: seg, risk: riskVal });
    }

    const matchErosion = alert.match(/High erosion vulnerability.*(?:Segment|seg-)\s*(\d+|[a-zA-Z0-9_-]+)/i);
    if (matchErosion) {
      const segId = matchErosion[1].startsWith('seg-') ? matchErosion[1] : `seg-${matchErosion[1]}`;
      return t('alertTemplates.terrainWarning', lang, { segment: segId });
    }

    const matchRunoff = alert.match(/pooling observed near\s*([a-zA-Z0-9\s]+?)\s*sector/i);
    if (matchRunoff) {
      const loc = formatLocation(matchRunoff[1], lang);
      return t('alertTemplates.runoffWarning', lang, { location: loc });
    }

    const matchScenario = alert.match(/Simulated\s+(\w+)\s+(\w+)\s+applied on\s+([a-zA-Z0-9_-]+).*?New Risk:\s*(\d+)\s*\(([^)]+)\)/i);
    if (matchScenario) {
      const sev = formatSeverity(matchScenario[1], lang);
      const haz = formatHazardType(matchScenario[2], lang);
      const seg = matchScenario[3];
      const risk = matchScenario[4];
      const lvl = formatRiskLevel(matchScenario[5], lang);
      return t('alertTemplates.scenarioSimulation', lang, {
        severity: sev,
        hazard: haz,
        segment: seg,
        risk: risk,
        level: lvl
      });
    }

    return alert;
  }

  // Structured alert object
  if (alert.templateKey) {
    return t(alert.templateKey, lang, alert.params || {});
  }

  if (alert.message) {
    return formatAlertMessage(alert.message, lang);
  }

  return '';
}

/**
 * Translates incident / hazard alert labels
 */
export function translateAlert(lang, alertText) {
  if (!alertText) return '';
  const activeLang = dictionaries[lang] ? lang : 'en';
  const dict = dictionaries[activeLang];
  return dict.alerts?.[alertText] || dictionaries.en.alerts?.[alertText] || formatHazardType(alertText, lang);
}

/**
 * Backwards compatibility export
 */
export const translations = dictionaries;

export default {
  LOCALES,
  SUPPORTED_LANG_CODES,
  dictionaries,
  translations,
  t,
  formatLocation,
  formatStateName,
  formatSegmentName,
  formatHazardType,
  formatSeverity,
  formatRiskLevel,
  formatVehicleClass,
  formatAlertMessage,
  translateAlert
};
