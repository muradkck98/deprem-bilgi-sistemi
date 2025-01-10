import axios from 'axios';
import { FAULT_LINES_URL } from '../constants/mapConstants';

export const fetchFaultLines = async () => {
  try {
    const response = await axios.get(FAULT_LINES_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching fault lines:', error);
    throw error;
  }
}; 