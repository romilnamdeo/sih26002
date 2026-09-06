/**
 * RASTA-NER — Risk System Utilities
 * Exact Risk Ranges:
 * GREEN:  0 - 30   (Low)    #40916C
 * YELLOW: 30 - 70  (Medium) #E9A93B
 * RED:    70 - 100 (High)   #E63946
 * PRIMARY: #1B4332
 * ACCENT:  #E76F51
 */

export const RISK_COLORS = {
  GREEN: '#40916C',
  YELLOW: '#E9A93B',
  RED: '#E63946',
  PRIMARY: '#1B4332',
  ACCENT: '#E76F51',
  DARK_BG: '#081C15',
  SURFACE: '#0C2E22'
};

/**
 * Returns 'Low', 'Medium', or 'High' based on numerical risk index (0 - 100)
 */
export const getRiskLevel = (riskIndex) => {
  const score = Number(riskIndex) || 0;
  if (score <= 30) return 'Low';
  if (score <= 70) return 'Medium';
  return 'High';
};

/**
 * Returns hex color code for a given risk index
 * If monsoonMode is enabled, applies client-side visual intensification (+20 display score)
 */
export const getRiskColor = (riskIndex, monsoonMode = false) => {
  let score = Number(riskIndex) || 0;
  if (monsoonMode) {
    score = Math.min(100, score + 20);
  }
  if (score <= 30) return RISK_COLORS.GREEN;
  if (score <= 70) return RISK_COLORS.YELLOW;
  return RISK_COLORS.RED;
};

/**
 * Tailwind classes for risk badges and status pills
 */
export const getRiskBadgeClasses = (levelOrIndex) => {
  let level = levelOrIndex;
  if (typeof levelOrIndex === 'number') {
    level = getRiskLevel(levelOrIndex);
  }
  const lvl = String(level).toLowerCase();
  if (lvl === 'low' || lvl === 'green') {
    return 'bg-[#40916C]/15 text-[#40916C] border-[#40916C]/40';
  }
  if (lvl === 'medium' || lvl === 'yellow') {
    return 'bg-[#E9A93B]/15 text-[#E9A93B] border-[#E9A93B]/40';
  }
  return 'bg-[#E63946]/15 text-[#E63946] border-[#E63946]/40';
};

/**
 * Tailwind classes for circular risk dots
 */
export const getRiskDotClasses = (riskIndex, monsoonMode = false) => {
  let score = Number(riskIndex) || 0;
  if (monsoonMode) {
    score = Math.min(100, score + 20);
  }
  if (score <= 30) return 'bg-[#40916C] shadow-[#40916C]/40';
  if (score <= 70) return 'bg-[#E9A93B] shadow-[#E9A93B]/40';
  return 'bg-[#E63946] shadow-[#E63946]/40';
};

/**
 * Stroke color for Accessibility Score radial gauge
 */
export const getAccessibilityStroke = (score) => {
  const s = Number(score) || 0;
  if (s >= 70) return RISK_COLORS.GREEN;
  if (s >= 30) return RISK_COLORS.YELLOW;
  return RISK_COLORS.RED;
};

/**
 * Text color class for Accessibility Score
 */
export const getAccessibilityColorClass = (score) => {
  const s = Number(score) || 0;
  if (s >= 70) return 'text-[#40916C]';
  if (s >= 30) return 'text-[#E9A93B]';
  return 'text-[#E63946]';
};
