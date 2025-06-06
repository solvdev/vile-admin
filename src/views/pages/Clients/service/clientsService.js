import { getData } from "RestControllers/Controller";


const BASE_URL = process.env.REACT_APP_BASE_URL + 'accounts/clients/';

export const fetchAllClients = async () => {
  try {
    const response = await getData('GET', BASE_URL); // sin parámetros de paginado
    return response.data;
  } catch (error) {
    console.error('Error al obtener los clientes:', error);
    throw error;
  }
};


export const getClientsCount = async () => {
  try {
    const response = await getData('GET', BASE_URL + 'count/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener el conteo de clientes:', error);
    throw error;
  }
};

export const fetchClientById = async (id) => {
  try {
    const response = await getData('GET', BASE_URL + id);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el cliente con ID ${id}:`, error);
    throw error;
  }
};

export const createClient = async (clientData) => {
  try {
    const response = await getData('POST', BASE_URL, {}, clientData);
    return response.data;
  } catch (error) {
    console.error('Error al crear un cliente:', error);
    throw error;
  }
};

export const updateClient = async (id, clientData) => {
  try {
    const response = await getData('PATCH', `${BASE_URL}${id}/`, {}, clientData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el cliente con ID ${id}:`, error);
    throw error;
  }
};

export const deleteClient = async (id) => {
  try {
    const response = await getData('DELETE', id);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar el cliente con ID ${id}:`, error);
    throw error;
  }
};

export const importBookingsExcel = async (formData) => {
  try {
    const response = await getData('POST', `${BASE_URL.replace('accounts/clients/', 'studio/bookings/import/')}`, {
      'Content-Type': 'multipart/form-data'
    }, formData);
    return response.data;
  } catch (error) {
    console.error("Error al importar reservas:", error);
    throw error;
  }
};


export const fetchClientsAtRisk = async () => {
  try {
    const response = await getData('GET', process.env.REACT_APP_BASE_URL + 'studio/bookings/clientes-en-riesgo/');
    return response.data;
  } catch (error) {
    console.error("Error al obtener clientes en riesgo:", error);
    throw error;
  }
};


export const getBookingsByClient = async (clientId) => {
  try {
    const response = await getData(
      'GET',
      `${process.env.REACT_APP_BASE_URL}studio/bookings/by-client/${clientId}/`
    );
    return response.data;
  } catch (error) {
    console.error(`Error al obtener bookings del cliente ${clientId}:`, error);
    throw error;
  }
};
