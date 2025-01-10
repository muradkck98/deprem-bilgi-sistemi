import api from './api';
import { MAP_CONFIG } from '../constants/mapConstants';

export const fetchEarthquakes = async (filters) => {
  try {
    const response = await api.get('/query', {
      params: {
        format: 'geojson',
        starttime: filters.startDate,
        endtime: filters.endDate,
        minlatitude: MAP_CONFIG.BOUNDS.minLatitude,
        maxlatitude: MAP_CONFIG.BOUNDS.maxLatitude,
        minlongitude: MAP_CONFIG.BOUNDS.minLongitude,
        maxlongitude: MAP_CONFIG.BOUNDS.maxLongitude,
        minmagnitude: filters.minMagnitude,
        orderby: 'magnitude'
      }
    });
    return response.data.features;
  } catch (error) {
    console.error('Error fetching earthquakes:', error);
    throw error;
  }
}; 