import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
} from 'reactstrap';
import ReactLoading from 'react-loading';
import { Toaster } from 'react-hot-toast';
import { overlayStyles, loaderContainerStyles } from 'styles/commonStyles';
import { useNotifications } from 'hooks/useNotifications';
const ClientDetailCoach = ({ client, }) => {
  const [loading, setLoading] = useState(false);
  const [localClient, setLocalClient] = useState(client);
  const [success, setSuccess] = useState(false);
   const [error, setError] = useState(null);

  useEffect(() => {
    setLocalClient(client);
  }, [client]);

  const notificationMessages = {
    success: 'Membresías cargadas exitosamente.',
    error: (e) => e.message || 'Error al cargar datos.',
  };
  useNotifications(success, error, notificationMessages);

  return (
    <>
      {loading && (
        <div style={overlayStyles}>
          <div style={loaderContainerStyles}>
            <ReactLoading type="spin" color="white" height={'40%'} />
          </div>
        </div>
      )}
      <Toaster position="top-right" />

      <Row className="mb-3">
        <Col md="6">
          <h5>Información del Alumno</h5>
          <p><strong>Nombre:</strong> {localClient.first_name} {localClient.last_name}</p>
          <p><strong>Edad:</strong> {localClient.age} años</p>
          <p><strong>Estado:</strong> {localClient.status === 'A' ? 'Activo' : 'Inactivo'}</p>
        </Col>
        <Col md="6">
          <p><strong>Clase de Prueba:</strong> {localClient.trial_used ? 'Usada' : 'Disponible'}</p>
          <p><strong>Membresía Activa:</strong> {localClient.active_membership ? localClient.active_membership.name : 'Sin membresía activa'}</p>
          <p><strong>Lesión o condición medica:</strong> {localClient.notes ? localClient.notes : "Ninguna"}</p>
        </Col>
      </Row>

    </>
  );
};

export default ClientDetailCoach;
