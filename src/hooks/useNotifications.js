// useNotifications.js
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export const useNotifications = (isSuccess, error, messages = {}) => {
  const [notificationShown, setNotificationShown] = useState(false);

  useEffect(() => {
    if (isSuccess && !notificationShown) {
      const successMessage = messages.success || 'Operación realizada exitosamente!';
      toast.success(successMessage, {
        style: {
          fontSize: '16px',
          padding: '16px',
          minWidth: '300px',
        }
      });
      setNotificationShown(true);
    } else if (error && !notificationShown) {
      const errorMessage = messages.error ? messages.error(error) : error.message;
      toast.error(errorMessage, {
        style: {
          fontSize: '16px',
          padding: '16px',
          minWidth: '300px',
        }
      });
      setNotificationShown(true); // Aquí se establece la notificación como mostrada
    }
  }, [isSuccess, error, messages, notificationShown]);
};
