import { useState, useEffect } from 'react';
import { fetchEarthquakes } from '../services/earthquakeService';
import { fetchFaultLines } from '../services/faultLineService';

export const useMapData = (layers, filters) => {
  const [earthquakes, setEarthquakes] = useState([]);
  const [faultLines, setFaultLines] = useState(null);
  const [loading, setLoading] = useState(true);
  const [faultLinesLoading, setFaultLinesLoading] = useState(true);

  useEffect(() => {
    const loadEarthquakes = async () => {
      if (!layers.earthquakes) {
        setEarthquakes([]);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchEarthquakes(filters);
        setEarthquakes(data);
      } catch (error) {
        console.error('Failed to load earthquakes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEarthquakes();
  }, [filters, layers.earthquakes]);

  useEffect(() => {
    const loadFaultLines = async () => {
      if (!layers.faultLines) {
        setFaultLines(null);
        return;
      }

      try {
        setFaultLinesLoading(true);
        const data = await fetchFaultLines();
        setFaultLines(data);
      } catch (error) {
        console.error('Failed to load fault lines:', error);
      } finally {
        setFaultLinesLoading(false);
      }
    };

    loadFaultLines();
  }, [layers.faultLines]);

  return {
    earthquakes,
    faultLines,
    loading,
    faultLinesLoading
  };
}; 