import React from 'react';
import styled from 'styled-components';

const LayerContainer = styled.div`
  background: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
`;

const LayerTitle = styled.h3`
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
`;

const LayerItem = styled.div`
  margin-bottom: 10px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
`;

const Checkbox = styled.input`
  cursor: pointer;
`;

function LayerManager({ layers, onLayerChange }) {
  return (
    <LayerContainer>
      <LayerTitle>Katman Yöneticisi</LayerTitle>
      <LayerItem>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={layers.earthquakes}
            onChange={(e) => onLayerChange('earthquakes', e.target.checked)}
          />
          Deprem
        </CheckboxLabel>
      </LayerItem>
      <LayerItem>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={layers.faultLines}
            onChange={(e) => onLayerChange('faultLines', e.target.checked)}
          />
          Fay Hattı
        </CheckboxLabel>
      </LayerItem>
      <LayerItem>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={layers.analysis}
            onChange={(e) => onLayerChange('analysis', e.target.checked)}
          />
          Analiz
        </CheckboxLabel>
      </LayerItem>
    </LayerContainer>
  );
}

export default LayerManager;