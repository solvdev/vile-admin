import { getData } from "RestControllers/Controller";

const BASE_URL = process.env.REACT_APP_BASE_URL + "studio/bookings/";
const BASE_URL_SCHEDULE = process.env.REACT_APP_BASE_URL + "studio/schedules/";

export const getTodayBookingsForCoach = async (coachId) => {
  const url = coachId 
    ? `${BASE_URL_SCHEDULE}today/?coach_id=${coachId}` 
    : `${BASE_URL_SCHEDULE}today/`;
  const response = await getData('GET', url);
  return response.data;
};

export const updateAttendance = async (bookingId, attendanceStatus) => {
  try {
    const url = `${BASE_URL}${bookingId}/attendance/`;
    const data = { attendance_status: attendanceStatus };
    const response = await getData('PUT', url, {}, data);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar asistencia:", error);
    throw error;
  }
};

export const getAvailabilityByDate = async (date) => {
  try {
    const response = await getData("GET", `${process.env.REACT_APP_BASE_URL}studio/availability/`, {
      date: date, // debe ser un string en formato YYYY-MM-DD
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener disponibilidad:", error);
    throw error;
  }
};

export const getBookingsByClient = async (clientId) => {
  try {
    const url = `${BASE_URL}by-client/${clientId}/`;
    const response = await getData('GET', url);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener historial del cliente ${clientId}:`, error);
    throw error;
  }
};

export const fetchAllBookings = async () => {
  try {
    const response = await getData("GET", `${BASE_URL}historial/`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener bookings:", error);
    throw error;
  }
};

export const getClassTypeSummary = async () => {
  const response = await getData("GET",`${process.env.REACT_APP_BASE_URL}studio/summary-by-class-type/`);
  return response.data;
};

export const getAttendanceSummary = async () => {
  const response = await getData("GET",`${process.env.REACT_APP_BASE_URL}studio/attendance-summary/` );
  return response.data;
};

export const getBookingsByDate = async (date) => {
  try {
    const response = await getData("GET", `${BASE_URL}historial/`, {
      date: date // en formato YYYY-MM-DD
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener reservas por fecha:", error);
    throw error;
  }
};


export const registerBooking = async (payload) => {
  try {
    const response = await getData("POST", `${BASE_URL}`, {}, payload);
    return response.data;
  } catch (error) {
    console.error("Error al registrar booking:", error);
    throw error;
  }
};

export const cancelBooking = async (bookingId, by = "admin", reason = "Cancelado desde recepción") => {
  const url = `${process.env.REACT_APP_BASE_URL}studio/bookings/${bookingId}/cancel/`;
  return await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ by, reason })
  });
};


export const fetchAllSchedules = async () => {
  try {
    const response = await getData("GET", `${BASE_URL_SCHEDULE}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener horarios:", error);
    throw error;
  }
};


