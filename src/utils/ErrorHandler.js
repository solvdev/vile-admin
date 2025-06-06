import toast from 'react-hot-toast';
import axios from 'axios';

export const handleApiError = (error) => {
  if (axios.isAxiosError(error)) {
    if (error.response && error.response.status === 404) {
      toast.error("No se encontraron clientes.", {
        style: {
          fontSize: '16px',
          padding: '16px',
          minWidth: '300px',
        }
      });
    } else if (error.request) {
      toast.error("Error de conexión: No se pudo conectar al servidor.", {
        style: {
          fontSize: '16px',
          padding: '16px',
          minWidth: '300px',
        }
      });
    } else {
      toast.error(`Error en la solicitud: ${error.message}`, {
        style: {
          fontSize: '16px',
          padding: '16px',
          minWidth: '300px',
        }
      });
    }
  } else {
    // Errores que no son de Axios
    toast.error(`Error desconocido: ${error.message}`, {
      style: {
        fontSize: '16px',
        padding: '16px',
        minWidth: '300px',
      }
    });
  }
};
