import { getData } from 'RestControllers/Controller';

const BASE_URL = process.env.REACT_APP_BASE_URL + 'studio/memberships/';

export const fetchAllMemberships = async () => {
  try {
    const response = await getData('GET', BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener membresías:', error);
    throw error;
  }
};