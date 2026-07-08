import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Voir app.json > expo.extra.apiUrl. Sur émulateur Android, 10.0.2.2 pointe
// vers le "localhost" de la machine hôte. Sur un vrai téléphone, remplacez
// par l'adresse IP locale de votre ordinateur (ex: http://192.168.1.20:3000/api/v1).
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2:3000/api/v1';

export const api = axios.create({ baseURL: API_URL, timeout: 15000 });

// Attache automatiquement le token JWT à chaque requête sortante.
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si le token a expiré (401), on tente un rafraîchissement silencieux une fois,
// puis on rejoue la requête initiale. Si ça échoue aussi, l'appelant doit
// rediriger l'utilisateur vers l'écran de connexion (voir AuthContext).
let isRefreshing = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !isRefreshing) {
      original._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        await AsyncStorage.setItem('accessToken', data.data.accessToken);
        await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch (refreshError) {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);
