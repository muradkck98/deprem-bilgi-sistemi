import { EARTHQUAKE_COLORS, FAULT_LINE_COLORS } from '../constants/mapConstants';

export const getEarthquakeColor = (magnitude) => {
  if (magnitude >= 7) return EARTHQUAKE_COLORS.SEVERE;
  if (magnitude >= 6) return EARTHQUAKE_COLORS.HIGH;
  if (magnitude >= 5) return EARTHQUAKE_COLORS.MEDIUM;
  return EARTHQUAKE_COLORS.LOW;
};

export const getEarthquakeRadius = (magnitude) => {
  return Math.pow(2, magnitude) * 0.15;
};

export const getFaultLineStyle = (feature) => {
  const importance = feature.properties.importance;
  let color = FAULT_LINE_COLORS.LOW;
  let weight = 2;
  
  if (importance <= 2) {
    color = FAULT_LINE_COLORS.HIGH;
    weight = 8;
  } else if (importance <= 4) {
    color = FAULT_LINE_COLORS.MEDIUM_HIGH;
    weight = 6;
  } else if (importance === 5) {
    color = FAULT_LINE_COLORS.MEDIUM;
    weight = 4;
  }
  
  return { color, weight, opacity: 0.9 };
}; 