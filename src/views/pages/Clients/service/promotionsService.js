import { getData } from "RestControllers/Controller";

const BASE_URL = process.env.REACT_APP_BASE_URL + 'studio/promotions/';

export const fetchAllPromotions = async () => {
  try {
    const response = await getData('GET', BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener promociones:', error);
    throw error;
  }
};

export const createPromotion = async (data) => {
  try {
    const response = await getData('POST', BASE_URL, {}, data);
    return response.data;
  } catch (error) {
    console.error('Error al crear promoción:', error);
    throw error;
  }
};

export const updatePromotion = async (id, data) => {
  try {
    const response = await getData('PUT', `${BASE_URL}${id}/`, {}, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar la promoción con ID ${id}:`, error);
    throw error;
  }
};

export const deletePromotion = async (id) => {
  try {
    const response = await getData('DELETE', `${BASE_URL}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar la promoción con ID ${id}:`, error);
    throw error;
  }
};

const INSTANCE_URL = process.env.REACT_APP_BASE_URL + 'studio/promotion-instances/';

export const fetchPromotionInstances = async () => {
  try {
    const response = await getData('GET', INSTANCE_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener instancias de promociones:', error);
    throw error;
  }
};

export const createPromotionInstance = async (data) => {
  try {
    const response = await getData('POST', INSTANCE_URL, {}, data);
    return response.data;
  } catch (error) {
    console.error('Error al crear instancia de promoción:', error);
    throw error;
  }
};

export const confirmPromotionPayment = async (instanceId, clientId) => {
  try {
    const response = await getData(
      'POST',
      `${INSTANCE_URL}${instanceId}/confirm-payment/`,
      {},
      { client_id: clientId }
    );
    return response.data;
  } catch (error) {
    console.error('Error al confirmar el pago del cliente en la promoción:', error);
    throw error;
  }
};

export const updatePromotionInstance = async (id, data) => {
    try {
      const response = await getData('PUT', `${INSTANCE_URL}${id}/`, {}, data);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar instancia con ID ${id}:`, error);
      throw error;
    }
  };
  
  export const deletePromotionInstance = async (id) => {
    try {
      const response = await getData('DELETE', `${INSTANCE_URL}${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar la instancia con ID ${id}:`, error);
      throw error;
    }
  };