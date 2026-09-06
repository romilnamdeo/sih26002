/**
 * Centralized Re-export for Backward Compatibility
 * Redirects to the complete 10-language i18n system in src/i18n
 */
export {
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
} from '../i18n';

export { default } from '../i18n';
