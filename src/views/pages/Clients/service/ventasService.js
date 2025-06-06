import { getData } from "RestControllers/Controller";

const BASE_URL = process.env.REACT_APP_BASE_URL + 'studio/ventas/';

export const fetchAllVentas = async () => {
  try {
    const response = await getData('GET', BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener las ventas:', error);
    throw error;
  }
};

export const fetchVentaById = async (id) => {
  try {
    const response = await getData('GET', BASE_URL + id + '/');
    return response.data;
  } catch (error) {
    console.error(`Error al obtener la venta con ID ${id}:`, error);
    throw error;
  }
};

export const createVenta = async (ventaData) => {
  try {
    const response = await getData('POST', BASE_URL, {}, ventaData);
    return response.data;
  } catch (error) {
    console.error('Error al crear una venta:', error);
    throw error;
  }
};

export const updateVenta = async (id, ventaData) => {
  try {
    const response = await getData('PATCH', `${BASE_URL}${id}/`, {}, ventaData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar la venta con ID ${id}:`, error);
    throw error;
  }
};

export const deleteVenta = async (id) => {
  try {
    const response = await getData('DELETE', BASE_URL + id + '/');
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar la venta con ID ${id}:`, error);
    throw error;
  }
};
