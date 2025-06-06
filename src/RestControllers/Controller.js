import axios from 'axios';

export const getData = async (method, endpoint, params = {}, data = {}) => {
  const token = localStorage.getItem("access"); // o donde lo tengas almacenado

  const headers = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  switch (method.toUpperCase()) {
    case 'GET':
      return axios.get(endpoint, { params, headers });
    case 'POST':
      return axios.post(endpoint, data, { headers });
    case 'PUT':
      return axios.put(endpoint, data, { headers });
    case 'PATCH':
      return axios.patch(endpoint, data, { headers });
    case 'DELETE':
      return axios.delete(endpoint, { data, headers });
    default:
      throw new Error(`Método ${method} no soportado.`);
  }
};