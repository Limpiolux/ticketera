import React, { useEffect, useState } from 'react';

const AutoLogout = ({ logoutAfterMinutes }) => {
  const [timeoutId, setTimeoutId] = useState(null);

  const resetLogoutTimer = () => {
    // Si hay un temporizador existente, límpialo
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Inicia un nuevo temporizador
    const milliseconds = logoutAfterMinutes * 60 * 1000;
    const newTimeoutId = setTimeout(() => {
      // Eliminar el token y los datos del usuario después del tiempo especificado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirigir al usuario a la página de inicio de sesión
      window.location.href = '/';
    }, milliseconds);

    // Actualiza el ID del temporizador
    setTimeoutId(newTimeoutId);
  };

  useEffect(() => {
    // Agrega manejadores de eventos para detectar actividad del usuario
    const activityEvents = ['mousemove', 'keydown', 'scroll'];
    const handleActivity = () => resetLogoutTimer();

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Cuando se desmonte el componente, elimina los manejadores de eventos y limpia el temporizador
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  // Inicia el temporizador cuando el componente se monta
  useEffect(() => {
    resetLogoutTimer();
  }, [logoutAfterMinutes]);

  return null; // No se renderiza ningún contenido en la aplicación
};

export default AutoLogout;
