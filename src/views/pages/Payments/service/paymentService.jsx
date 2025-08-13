import { getData } from "RestControllers/Controller";

const BASE_URL = process.env.REACT_APP_BASE_URL + "studio/payments/";

// Obtener todos los pagos
export const getAllPayments = async () => {
  const response = await getData("GET", BASE_URL);
  return response.data;
};

export const getFullClosureSummary = async (mes) => {
  // Construir URL sin ?month si "all" o ninguno
  let url = `${BASE_URL}closure-full-summary/`;
  if (mes && mes !== "all") {
    url += `?month=${mes}`;
  }
  const response = await getData("GET", url);
  return response.data;
};

// Si necesitas mantener getPaymentsByMonth o similares, los dejas aquí
export const getFullSummaryByMonth = async (mes) => {
  const url = `${BASE_URL}closure-full-summary/?month=${mes}`;
  const response = await getData("GET", url);
  return response.data;
};

export const getPaymentsByMonth = async (mes) => {
  const response = await getData("GET", `${BASE_URL}?month=${mes}`);
  return response.data;
};

export const getPaymentsByDate = async (dia) => {
  const response = await getData("GET", `${BASE_URL}?date=${dia}`);
  return response.data;
};

// Obtener pagos por cliente
export const getPaymentsByClient = async (clientId) => {
  const response = await getData("GET", BASE_URL + `?client=${clientId}`);
  return response.data;
};

// Crear un nuevo pago
export const createPayment = async (payload) => {
  const response = await getData("POST", BASE_URL, {}, payload);
  return response.data;
};

// Actualizar un pago existente
export const updatePayment = async (id, payload) => {
  const response = await getData("PUT", BASE_URL + `${id}/`, {}, payload);
  return response.data;
};

// Eliminar un pago
export const deletePayment = async (id) => {
  const response = await getData("DELETE", BASE_URL + `${id}/`);
  return response.data;
};

// Obtener clientes en periodo de gracia
export const getClientesEnGracia = async () => {
  const response = await getData("GET", BASE_URL + "en-gracia/");
  return response.data;
};

// Extender vigencia de un pago específico
export const extendVigencia = async (id) => {
  const response = await getData("PUT", BASE_URL + `${id}/extend-vigencia/`);
  return response.data;
};
