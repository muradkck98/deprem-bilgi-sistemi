import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import axios from 'axios';
import FilterLine from './FilterLine/FilterLine';
import LayerManager from './LayerManager/LayerManager';

// ... diğer styled components aynı ...

// Cache yönetimi için yardımcı fonksiyonlar
const CACHE_KEY = 'earthquake_data_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 saat

const getCachedData = (filters) => {
  const cacheData = localStorage.getItem(CACHE_KEY);
  if (!cacheData) return null;

  try {
    const { data, timestamp, usedFilters } = JSON.parse(cacheData);
    const isExpired = Date.now() - timestamp > CACHE_DURATION;
    const filtersMatch = JSON.stringify(usedFilters) === JSON.stringify(filters);

    if (isExpired || !filtersMatch) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Cache okuma hatası:', error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

const setCachedData = (data, filters) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      usedFilters: filters
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Cache yazma hatası:', error);
  }
};

// Fay hatları için API URL'i
const FAULT_LINES_URL = 'https://mapelse.github.io/fayHatlari/assets/js/tr_faults_imp.geojson';
const FAULT_LINES_CACHE_KEY = 'fault_lines_cache';
const FAULT_LINES_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 gün

// Fay hatları için cache fonksiyonları
const getCachedFaultLines = () => {
  const cacheData = localStorage.getItem(FAULT_LINES_CACHE_KEY);
  if (!cacheData) return null;

  try {
    const { data, timestamp } = JSON.parse(cacheData);
    const isExpired = Date.now() - timestamp > FAULT_LINES_CACHE_DURATION;

    if (isExpired) {
      localStorage.removeItem(FAULT_LINES_CACHE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Fay hatları cache okuma hatası:', error);
    localStorage.removeItem(FAULT_LINES_CACHE_KEY);
    return null;
  }
};

const setCachedFaultLines = (data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(FAULT_LINES_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Fay hatları cache yazma hatası:', error);
  }
};

function MapComponent() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faultLinesLoading, setFaultLinesLoading] = useState(true);
  const [faultLines, setFaultLines] = useState(null);
  const [layers, setLayers] = useState({
    earthquakes: true,
    faultLines: true,
  });
  const [filters, setFilters] = useState({
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endTime: new Date().toISOString().split('T')[0],
    minMagnitude: 4.5,
  });

  // Fay hatlarının stilini belirleyen fonksiyon
  const getFaultLineStyle = (feature) => {
    const importance = feature.properties.importance;
    let color = '#D2691E'; // Varsayılan renk (düşük önem)
    
    if (importance <= 2) {
      color = '#FF0000'; // Yüksek önem
    } else if (importance <= 4) {
      color = '#800000'; // Orta-yüksek önem
    } else if (importance === 5) {
      color = '#A52A2A'; // Orta önem
    }
    
    return {
      color: color,
      weight: 2,
      opacity: 0.8
    };
  };

  // Fay hattı popup içeriği
  const onEachFaultLine = (feature, layer) => {
    if (feature.properties) {
      const { FAULT_NAME, ZONE_NAME, importance, TEXT } = feature.properties;
      layer.bindPopup(`
        <strong>${FAULT_NAME || 'İsimsiz Fay'}</strong><br/>
        ${ZONE_NAME ? `Bölge: ${ZONE_NAME}<br/>` : ''}
        Önem Derecesi: ${importance}<br/>
        ${TEXT ? `<small>${TEXT}</small>` : ''}
      `);
    }
  };

  // Fay hatlarını çekme fonksiyonu
  useEffect(() => {
    const fetchFaultLines = async () => {
      if (!layers.faultLines) {
        setFaultLines(null);
        return;
      }

      try {
        setFaultLinesLoading(true);
        
        // Önce cache'den kontrol et
        const cachedData = getCachedFaultLines();
        if (cachedData) {
          console.log('Fay hatları cache\'den yüklendi');
          setFaultLines(cachedData);
          setFaultLinesLoading(false);
          return;
        }

        // Cache'de yoksa API'den çek
        console.log('Fay hatları API\'den yükleniyor...');
        const response = await axios.get(FAULT_LINES_URL);
        const newData = response.data;
        
        if (newData && newData.features) {
          console.log(`${newData.features.length} adet fay hattı yüklendi`);
          setFaultLines(newData);
          setCachedFaultLines(newData);
          console.log('Fay hatları cache\'lendi');
        } else {
          console.error('Fay hatları verisi beklenen formatta değil:', newData);
        }
      } catch (error) {
        console.error('Fay hatları yüklenirken hata:', error);
      } finally {
        setFaultLinesLoading(false);
      }
    };
    
    fetchFaultLines();
  }, [layers.faultLines]);

  useEffect(() => {
    const fetchEarthquakes = async () => {
      if (!layers.earthquakes) {
        setEarthquakes([]);
        return;
      }

      try {
        setLoading(true);

        // Önce cache'den veriyi kontrol et
        const cachedData = getCachedData(filters);
        if (cachedData) {
          console.log('Veriler cache\'den yüklendi');
          setEarthquakes(cachedData);
          setLoading(false);
          return;
        }

        // Cache'de veri yoksa API'den çek
        const response = await axios.get(`https://earthquake.usgs.gov/fdsnws/event/1/query`, {
          params: {
            format: 'geojson',
            starttime: filters.startDate,
            endtime: filters.endDate,
            minlatitude: 35.5,
            maxlatitude: 42.5,
            minlongitude: 25.0,
            maxlongitude: 45.0,
            minmagnitude: filters.minMagnitude,
            orderby: 'magnitude'
          }
        });

        const newData = response.data.features;
        setEarthquakes(newData);
        
        // Verileri cache'e kaydet
        setCachedData(newData, filters);
        console.log('Veriler API\'den yüklendi ve cache\'lendi');

      } catch (error) {
        console.error('Deprem verileri çekilirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarthquakes();
  }, [filters, layers.earthquakes]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleLayerChange = (layerName, checked) => {
    setLayers(prev => ({
      ...prev,
      [layerName]: checked
    }));
  };

  // ... getColor ve getRadius fonksiyonları aynı ...

  return (
    <StyledContainer>
      <LayerManager 
        layers={layers}
        onLayerChange={handleLayerChange}
      />
      
      <FilterLine 
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      
      <StyledMapContainer
        center={[39.0, 35.0]}
        zoom={6}
        scrollWheelZoom={true}
        style={{ background: '#1a1a1a' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
        />
        {layers.earthquakes && earthquakes.map((earthquake) => {
          const { coordinates } = earthquake.geometry;
          const { mag, place, time } = earthquake.properties;
          
          return (
            <CircleMarker
              key={earthquake.id}
              center={[coordinates[1], coordinates[0]]}
              radius={getRadius(mag)}
              fillColor={getColor(mag)}
              color="#000"
              weight={1}
              opacity={1}
              fillOpacity={0.7}
            >
              <Popup>
                <div>
                  <h3>Büyüklük: {mag}</h3>
                  <p>Yer: {place}</p>
                  <p>Tarih: {new Date(time).toLocaleString('tr-TR')}</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
        
        {layers.faultLines && faultLines && !faultLinesLoading && (
          <GeoJSON 
            data={faultLines}
            style={getFaultLineStyle}
            onEachFeature={onEachFaultLine}
          />
        )}
      </StyledMapContainer>

      <Legend>
        <h4 style={{ margin: '0 0 10px 0' }}>Deprem Büyüklüğü</h4>
        {legendItems.map((item, index) => (
          <LegendItem key={index}>
            <LegendColor color={item.color} />
            <span>{item.label}</span>
          </LegendItem>
        ))}
        <h4 style={{ margin: '10px 0' }}>Fay Hatları</h4>
        <LegendItem>
          <LegendColor color="#FF0000" />
          <span>Yüksek Önem (1-2)</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#800000" />
          <span>Orta-Yüksek Önem (3-4)</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#A52A2A" />
          <span>Orta Önem (5)</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#D2691E" />
          <span>Düşük Önem (6)</span>
        </LegendItem>
      </Legend>

      {(loading || faultLinesLoading) && (
        <LoadingOverlay>
          <p>
            {loading && 'Deprem verileri yükleniyor...'}
            {faultLinesLoading && 'Fay hatları yükleniyor...'}
          </p>
        </LoadingOverlay>
      )}
    </StyledContainer>
  );
}

export default MapComponent;