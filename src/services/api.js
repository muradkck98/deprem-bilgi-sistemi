import axios from 'axios';

const api = axios.create({
  baseURL: 'https://earthquake.usgs.gov/fdsnws/event/1'
});

export default api; 