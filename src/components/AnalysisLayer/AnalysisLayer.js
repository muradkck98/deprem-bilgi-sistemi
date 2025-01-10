import React, { useState, useEffect } from 'react';
import { Rectangle, useMap } from 'react-leaflet';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AnalysisPanel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  z-index: 1000;
  height: 350px;
  overflow-y: auto;
  display: ${props => props.visible ? 'block' : 'none'};
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
`;

const TimeSeriesPanel = styled.div`
  height: 280px;
  background: rgba(255, 255, 255, 0.1);
  margin-top: 10px;
  padding: 10px;
  border-radius: 4px;
`;

const AnalysisHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ClearButton = styled.button`
  padding: 8px 16px;
  background: #FF6B00;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: background 0.3s;
  
  &:hover {
    background: #FF8533;
  }
`;

const SelectionHint = styled.div`
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 20px;
  border-radius: 4px;
  z-index: 9999;
  pointer-events: none;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

function AnalysisLayer({ isActive, earthquakes, filters }) {
  const map = useMap();
  const [bounds, setBounds] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState([]);

  useEffect(() => {
    const mapContainer = map.getContainer();
    if (isActive) {
      mapContainer.style.cursor = 'crosshair';
    } else {
      mapContainer.style.cursor = '';
    }
    return () => {
      mapContainer.style.cursor = '';
    };
  }, [isActive, map]);

  const analyzeEarthquakes = React.useCallback((selectedBounds) => {
    const filteredEarthquakes = earthquakes.filter(eq => {
      const [lng, lat] = eq.geometry.coordinates;
      return lat >= selectedBounds[0][0] && 
             lat <= selectedBounds[1][0] && 
             lng >= selectedBounds[0][1] && 
             lng <= selectedBounds[1][1];
    });

    // Yıllara göre gruplama
    const timeData = filteredEarthquakes
      .map(eq => ({
        time: new Date(eq.properties.time).getFullYear(),
        magnitude: eq.properties.mag
      }))
      .sort((a, b) => a.time - b.time)
      .reduce((acc, curr) => {
        const existingYear = acc.find(item => item.year === curr.time);
        if (existingYear) {
          existingYear.avgMagnitude = 
            (existingYear.avgMagnitude * existingYear.count + curr.magnitude) / (existingYear.count + 1);
          existingYear.count += 1;
          existingYear.maxMagnitude = Math.max(existingYear.maxMagnitude, curr.magnitude);
        } else {
          acc.push({
            year: curr.time,
            avgMagnitude: curr.magnitude,
            maxMagnitude: curr.magnitude,
            count: 1
          });
        }
        return acc;
      }, []);

    setTimeSeriesData(timeData);
  }, [earthquakes]);

  const handleMapClick = React.useCallback((e) => {
    console.log('Map clicked:', e.latlng, 'isDrawing:', isDrawing);
    if (!isActive) return;

    if (!isDrawing) {
      setStartPoint(e.latlng);
      setIsDrawing(true);
      console.log('Started drawing at:', e.latlng);
    } else {
      const endPoint = e.latlng;
      const newBounds = [
        [Math.min(startPoint.lat, endPoint.lat), Math.min(startPoint.lng, endPoint.lng)],
        [Math.max(startPoint.lat, endPoint.lat), Math.max(startPoint.lng, endPoint.lng)]
      ];
      setBounds(newBounds);
      setIsDrawing(false);
      analyzeEarthquakes(newBounds);
      console.log('Finished drawing at:', endPoint);
    }
  }, [isActive, isDrawing, startPoint, analyzeEarthquakes]);

  useEffect(() => {
    if (isActive) {
      console.log('Adding click listener');
      map.on('click', handleMapClick);
      return () => {
        console.log('Removing click listener');
        map.off('click', handleMapClick);
      };
    }
  }, [isActive, map, handleMapClick]);

  // Analiz katmanı deaktif olduğunda state'i sıfırla
  useEffect(() => {
    if (!isActive) {
      setBounds(null);
      setIsDrawing(false);
      setStartPoint(null);
      setTimeSeriesData([]);
    }
  }, [isActive]);

  return (
    <>
      {isActive && !bounds && (
        <SelectionHint>
          {!isDrawing 
            ? "📍 Analiz için ilk noktayı seçin" 
            : "📍 İkinci noktayı seçerek alanı belirleyin"
          }
        </SelectionHint>
      )}

      {bounds && (
        <Rectangle
          bounds={bounds}
          pathOptions={{
            color: '#FF6B00',
            weight: 2,
            fillOpacity: 0.2,
            fillColor: '#FF6B00'
          }}
        />
      )}

      <AnalysisPanel visible={bounds !== null}>
        <AnalysisHeader>
          <h3 style={{ margin: 0 }}>Yıllara Göre Deprem Şiddeti Analizi</h3>
          <ClearButton
            onClick={() => {
              setBounds(null);
              setIsDrawing(false);
              setStartPoint(null);
              setTimeSeriesData([]);
            }}
          >
            Seçimi Temizle
          </ClearButton>
        </AnalysisHeader>
        
        <TimeSeriesPanel>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData}>
              <XAxis 
                dataKey="year" 
                stroke="#fff"
                tick={{ fill: '#fff' }}
              />
              <YAxis 
                stroke="#fff"
                tick={{ fill: '#fff' }}
                domain={[0, 'auto']}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(0,0,0,0.8)', 
                  border: 'none',
                  color: '#fff' 
                }}
              />
              <Line 
                type="monotone" 
                dataKey="maxMagnitude" 
                stroke="#FF6B00" 
                name="En Yüksek Şiddet"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="avgMagnitude" 
                stroke="#FFD700" 
                name="Ortalama Şiddet"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </TimeSeriesPanel>
      </AnalysisPanel>
    </>
  );
}

export default AnalysisLayer; 