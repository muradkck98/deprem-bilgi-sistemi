import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  layers: {
    earthquakes: true,
    faultLines: false
  }
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    toggleLayer: (state, action) => {
      state.layers[action.payload] = !state.layers[action.payload];
    }
  }
});

export const { toggleLayer } = mapSlice.actions;
export default mapSlice.reducer; 