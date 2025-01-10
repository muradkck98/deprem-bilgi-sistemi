import React, { useState } from 'react';
import { MapContainer, TileLayer, Popup, GeoJSON, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import FilterLine from './FilterLine/FilterLine';
import LayerManager from './LayerManager/LayerManager';
import AnalysisLayer from './AnalysisLayer/AnalysisLayer';
import { useMapData } from '../hooks/useMapData';
import { MAP_CONFIG } from '../constants/mapConstants';
import { getEarthquakeColor, getEarthquakeRadius, getFaultLineStyle } from '../utils/mapUtils';

const StyledContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
`;

const StyledMapContainer = styled(MapContainer)`
  width: 100%;
  height: 100%;
`;

const Legend = styled.div`
  position: absolute;
  bottom: 67vh;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 200px;
  pointer-events: auto;
  margin-top: 60px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin: 5px 0;
  font-size: 12px;
  color: #333;
`;

const LegendColor = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: ${props => props.color};
  border: 1px solid rgba(0, 0, 0, 0.2);
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

function MapComponent() {
  const [layers, setLayers] = useState({
    earthquakes: true,
    faultLines: true,
    analysis: false
  });
  const [filters, setFilters] = useState({
    startDate: '1979-01-01',
    endDate: new Date().toISOString().split('T')[0],
    minMagnitude: 4.5
  });

  const { earthquakes, faultLines, loading, faultLinesLoading } = useMapData(layers, filters);

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

  const legendItems = [
    { color: '#800000', label: 'M ≥ 7.0' },
    { color: '#FF0000', label: 'M 6.0-6.9' },
    { color: '#FF6B00', label: 'M 5.0-5.9' },
    { color: '#FFD700', label: 'M 4.0-4.9' }
  ];

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
        center={MAP_CONFIG.CENTER}
        zoom={MAP_CONFIG.ZOOM}
        scrollWheelZoom={true}
        style={{ background: '#1a1a1a' }}
        className="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
        />
        {layers.earthquakes && earthquakes.map((earthquake) => {
          const { coordinates } = earthquake.geometry;
          const { mag, place, time } = earthquake.properties;
          const depth = coordinates[2];
          
          return (
            <CircleMarker
              key={earthquake.id}
              center={[coordinates[1], coordinates[0]]}
              radius={getEarthquakeRadius(mag)}
              fillColor={getEarthquakeColor(mag)}
              color="#000"
              weight={0.5}
              opacity={1}
              fillOpacity={0.85}
            >
              <Popup>
                <div>
                  <h3>Büyüklük: {mag}</h3>
                  <p>Derinlik: {depth.toFixed(1)} km</p>
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
        
        {layers.analysis && (
          <AnalysisLayer
            isActive={layers.analysis}
            earthquakes={earthquakes}
            filters={filters}
          />
        )}
      </StyledMapContainer>

      <div style={{ position: 'relative', zIndex: 1001 }}>
        <Legend>
          <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '14px' }}>Deprem Büyüklüğü</h4>
          {legendItems.map((item, index) => (
            <LegendItem key={index}>
              <LegendColor color={item.color} />
              <span>{item.label}</span>
            </LegendItem>
          ))}
          <h4 style={{ margin: '10px 0', color: '#333', fontSize: '14px' }}>Fay Hatları</h4>
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
      </div>

      {loading && (
        <LoadingOverlay>
          <p>Deprem verileri yükleniyor...</p>
        </LoadingOverlay>
      )}
    </StyledContainer>
  );
}

export default MapComponent;