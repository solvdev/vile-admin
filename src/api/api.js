import axios from 'axios';

const API_BASE_URL = 'https://config.vilepilates.com/api/'; //solo para desplegar
//const API_BASE_URL = 'http://localhost:8000/api/';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Agregar token automáticamente si existe
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Métodos específicos
export const loginUser = async (username, password) => {
    const response = await axios.post(`${API_BASE_URL}auth/login/`, {
      username,
      password,
    });
  
    const { access, refresh } = response.data;
  
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
  
    const userResp = await api.get("auth/me/"); // usa api aquí
    const user = userResp.data;
    localStorage.setItem("user", JSON.stringify(user));
  
    return user;
  };
  

export const getCurrentUser = async () => {
    const token = localStorage.getItem("access");
    if (!token) throw new Error("No token available");

    const response = await api.get("auth/me/"); // ⬅️ usa api en vez de axios
    return response.data;
};



export default api;
