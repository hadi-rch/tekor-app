import api from '../../api/axiosConfig';
import { API_URLS } from '../constants/api';

export const getCompletedTests = async () => {
  try {
    const response = await api.get(API_URLS.COMPLETED_TESTS);
    return response.data;
  } catch (error) {
    console.error('Error fetching completed tests:', error);
    throw error;
  }
};
