import React from 'react';
import styled from 'styled-components';
import Map from './components/Map';

const AppContainer = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  height: 100vh;
  background-color: #f5f5f5;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: #e5e5e5;
  position: relative;
`;

function App() {
  return (
    <AppContainer>
      <MapContainer>
        <Map />
      </MapContainer>
    </AppContainer>
  );
}

export default App; 