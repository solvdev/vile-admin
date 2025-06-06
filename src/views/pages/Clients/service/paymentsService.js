import { getData } from 'RestControllers/Controller';

const BASE_URL = process.env.REACT_APP_BASE_URL + 'studio/payments/';

export const createPayment = async (paymentData) => {
    try {
        const response = await getData('POST', BASE_URL, {}, paymentData);
        return response.data;
    } catch (error) {
        console.error("Error al registrar el pago:", error);
        throw error;
    }
};

export const fetchAllPayments = async () => {
    try {
        const response = await getData('GET', BASE_URL);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener pagos: `, error);
        throw error;
    }
};

export const applyPenalty = async ({ client_id, amount }) => {
    return await api.post('/payments/', {
      client_id,
      membership_id: 9999, // ← después creamos una membresía especial "Penalización"
      amount,
      date_paid: new Date().toISOString(),
      valid_until: new Date().toISOString(),
    });
  };


export const fetchPaymentsByClient = async (clientId) => {
    try {
        const response = await getData('GET', BASE_URL + `?client=${clientId}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener pagos del cliente ${clientId}:`, error);
        throw error;
    }
};

export const getPaymentsInGrace = async () => {
    try {
      const response = await getData('GET', BASE_URL + 'en-gracia/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener clientes en periodo de gracia:', error);
      throw error;
    }
  };


  export const extendPaymentValidity = async (paymentId) => {
    try {
      const url = `${BASE_URL}${paymentId}/extend-vigencia/`;
      const response = await getData('PUT', url);   // puedes mandar body vacío
      return response.data;
    } catch (error) {
      console.error('Error al extender vigencia del pago:', error);
      throw error;
    }
  };