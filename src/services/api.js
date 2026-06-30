import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.12:3001/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 90000,
});

export async function analyzeInteractions(diseases, drugs) {
  const response = await api.post('/analyze', { diseases, drugs });
  return response.data;
}

export async function suggestPrescription(diseases, allergies, currentMeds) {
  const response = await api.post('/prescribe', { diseases, allergies, currentMeds });
  return response.data;
}

export async function searchDrugs(query) {
  const response = await api.get('/search', { params: { q: query } });
  return response.data;
}
