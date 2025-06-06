import { getData } from "RestControllers/Controller";

const BASE_URL = process.env.REACT_APP_BASE_URL + "studio/planintents/";

export const fetchPotentialClients = async () => {
    const response = await getData("GET", BASE_URL + "potenciales/");
    return response.data;
  };
