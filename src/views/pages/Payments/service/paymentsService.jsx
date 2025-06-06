import { getData } from "RestControllers/Controller";

const BASE_URL = process.env.REACT_APP_BASE_URL + "studio/monthly-revenue/";

export const getMonthlyRevenue = async () => {
  const response = await getData("GET", BASE_URL);
  return response.data;
};


export const recalculateAllRevenue = async () => {
  const response = await getData("POST", BASE_URL + "recalculate-all/");
  return response.data;
};

export const recalculateMonthlyRevenue = async (year, month) => {
  const response = await getData("POST", BASE_URL + "recalculate/", {}, { year, month });
  return response.data;
};

export const getTotalRevenue = async () => {
  const res = await getData("GET", BASE_URL + "total/");
  return res?.data?.total_revenue || 0;
};


export const getTodayRevenue = async () => {
  const response = await getData("GET", process.env.REACT_APP_BASE_URL + "studio/today/");
  return response.data;
};

export const getCierresSemanales = async () => {
  const response = await getData("GET", process.env.REACT_APP_BASE_URL + "studio/cierres-semanales/");
  return response.data;
};