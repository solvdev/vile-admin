import React, { useEffect, useState } from 'react';
import {
  Button,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Table,
  Badge
} from 'reactstrap';
import ReactLoading from 'react-loading';
import { Toaster } from 'react-hot-toast';
import { overlayStyles, loaderContainerStyles } from 'styles/commonStyles';

import { handleApiError } from 'utils/ErrorHandler';
import { useNotifications } from 'hooks/useNotifications';
import { fetchClientById, createClient, updateClient } from 'views/pages/Clients/service/clientsService';
import { createPayment, fetchPaymentsByClient } from 'views/pages/Clients/service/paymentsService';
import { fetchAllMemberships } from 'views/pages/Clients/service/membershipService';

const ClientDetail = ({ client, onClientUpdated, mode = "view", classHistory = [] }) => {
  const [loading, setLoading] = useState(false);
  const [memberships, setMemberships] = useState([]);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [hasPreviousPayments, setHasPreviousPayments] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [localClient, setLocalClient] = useState(client);
  const [paymentsHistory, setPaymentsHistory] = useState([]);
  const isFormMode = mode === 'create' || mode === 'edit';

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    age: '',
    address: '',
    sex: '',
    notes: '',
    source: ''
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [membershipsData, payments] = await Promise.all([
        fetchAllMemberships(),
        fetchPaymentsByClient(client.id)
      ]);
      setMemberships(membershipsData);
      setPaymentsHistory(payments);
      setHasPreviousPayments(payments.length > 0);
      setSuccess(true);
    } catch (err) {
      handleApiError(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (client && mode === 'view') {
      fetchData();
    }
    if (client && mode === 'edit') {
      setFormData({
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.email,
        phone: client.phone,
        age: client.age,
        dpi: client.dpi,
        address: client.address,
        sex: client.sex,
        notes: client.notes,
        source: client.source
      });
    }
  }, [client]);

  useEffect(() => {
    setLocalClient(client);
  }, [client]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateMembership = async () => {
  if (!localClient.active_membership) return;
  setLoading(true);
  try {
    await api.updateMembership(localClient.active_membership.id, {
      remaining_classes: parseInt(localClient.active_membership.remaining_classes),
      start_date: localClient.active_membership.start_date,
      end_date: localClient.active_membership.end_date
    });
    await fetchData();
    toast.success('Membresía actualizada');
  } catch (err) {
    handleApiError(err);
    toast.error('Error al actualizar membresía');
  } finally {
    setLoading(false);
  }
};

  const handleSaveClient = async () => {
    setLoading(true);
    try {
      if (mode === 'create') {
        console.log('aqui entre')
        await createClient(formData);
      } else if (mode === 'edit') {
        await updateClient(client.id, formData);
      }
      if (onClientUpdated) await onClientUpdated();
      setSuccess(true);
    } catch (err) {
      handleApiError(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMembership = async () => {
    if (!selectedMembership) return;
    setLoading(true);
    const selectedPlan = memberships.find(m => m.id === parseInt(selectedMembership));
    try {
      await createPayment({
        client_id: localClient.id,
        membership_id: selectedPlan.id,
        amount: selectedPlan.price
      });
      const updatedClient = await fetchClientById(localClient.id);
      setLocalClient(updatedClient);
      await fetchData();
      if (onClientUpdated) await onClientUpdated();
      setSuccess(true);
    } catch (err) {
      handleApiError(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const notificationMessages = {
    success: 'Datos cargados exitosamente.',
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
          <h5>{mode === 'view' ? 'Información del Alumno' : (mode === 'edit' ? 'Editar Alumno' : 'Nuevo Alumno')}</h5>
          {mode === 'view' ? (
            <>
              <p><strong>Nombre:</strong> {localClient.first_name} {localClient.last_name}</p>
              <p><strong>Correo:</strong> {localClient.email}</p>
              <p><strong>Teléfono:</strong> {localClient.phone}</p>
              <p><strong>Edad:</strong> {localClient.age} años</p>
              <p><strong>Estado:</strong> {localClient.status === 'A' ? 'Activo' : 'Inactivo'}</p>
              <p><strong>Clase de Prueba:</strong> {localClient.trial_used ? 'Usada' : 'Disponible'}</p>
              <p><strong>Membresía Activa:</strong> {localClient.active_membership ? localClient.active_membership.name : 'Sin membresía activa'}</p>
              {localClient.active_membership && (
                <>
                  <hr />
                  <h5>Editar Paquete Activo</h5>
                  <FormGroup>
                    <Label>Clases Pendientes</Label>
                    <Input
                      type="number"
                      value={localClient.active_membership.remaining_classes}
                      onChange={(e) => setLocalClient(prev => ({
                        ...prev,
                        active_membership: {
                          ...prev.active_membership,
                          remaining_classes: e.target.value
                        }
                      }))}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Fecha de Inicio</Label>
                    <Input
                      type="date"
                      value={localClient.active_membership.start_date}
                      onChange={(e) => setLocalClient(prev => ({
                        ...prev,
                        active_membership: {
                          ...prev.active_membership,
                          start_date: e.target.value
                        }
                      }))}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Fecha de Vencimiento</Label>
                    <Input
                      type="date"
                      value={localClient.active_membership.end_date}
                      onChange={(e) => setLocalClient(prev => ({
                        ...prev,
                        active_membership: {
                          ...prev.active_membership,
                          end_date: e.target.value
                        }
                      }))}
                    />
                  </FormGroup>
                  <Button
                    color="primary"
                    onClick={handleUpdateMembership}
                  >
                    Guardar Cambios de Paquete
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <FormGroup>
                <Label>Nombre</Label>
                <Input name="first_name" value={formData.first_name} onChange={handleInputChange} />
              </FormGroup>
              <FormGroup>
                <Label>Apellido</Label>
                <Input name="last_name" value={formData.last_name} onChange={handleInputChange} />
              </FormGroup>
              <FormGroup>
                <Label>Correo</Label>
                <Input name="email" type="email" value={formData.email} onChange={handleInputChange} />
              </FormGroup>
              <FormGroup>
                <Label>Teléfono</Label>
                <Input name="phone" value={formData.phone} onChange={handleInputChange} />
              </FormGroup>
              <FormGroup>
                <Label>No. DPI</Label>
                <Input name="phone" value={formData.dpi} onChange={handleInputChange} disabled={formData.dpi ? true : false} />
              </FormGroup>
              <FormGroup>
                <Label>Edad</Label>
                <Input name="age" type="number" min={1} value={formData.age} onChange={handleInputChange} />
              </FormGroup>
              <FormGroup>
                <Label>Sexo</Label>
                <Input type="select" name="sex" value={formData.sex} onChange={handleInputChange}>
                  <option value="">Selecciona sexo</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </Input>
              </FormGroup>

            </>
          )}
        </Col>

        <Col md="6">
          {(mode === 'create' || mode === 'edit') && (
            <>
              <FormGroup>
                <Label>¿Tiene alguna lesión?</Label>
                <Input name="notes" type="textarea" value={formData.notes} onChange={handleInputChange} />
              </FormGroup>
              <FormGroup>
                <Label>Fuente</Label>
                <Input name="source" value={formData.source} onChange={handleInputChange} />
              </FormGroup>
              <Button
                style={{ backgroundColor: "#92d871", color: "black", borderColor: "#92d871" }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = "#92d871"; }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = "#92d871"; }}
                onClick={handleSaveClient}>
                Guardar Alumno
              </Button>
            </>
          )}
          <h5>{hasPreviousPayments && mode === 'view' ? 'Renovar Membresía' : 'Suscribir Membresía'}</h5>
          <FormGroup>
            <Label for="membershipSelect">Selecciona un plan</Label>
            <Input
              type="select"
              id="membershipSelect"
              value={selectedMembership || ''}
              onChange={(e) => setSelectedMembership(e.target.value)}
            >
              <option value="" disabled>-- Elegir plan --</option>
              {memberships.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} - Q{m.price}
                </option>
              ))}
            </Input>
          </FormGroup>
          <Button
            style={{ backgroundColor: "#92d871", color: "black", borderColor: "#92d871" }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = "#92d871"; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = "#92d871"; }}
            onClick={handleSaveMembership}
            disabled={!selectedMembership || mode === 'create'}
          >
            {hasPreviousPayments && mode === 'view' ? 'Renovar Membresía' : 'Suscribir Membresía'}
          </Button>
        </Col>
      </Row>

      {mode === 'view' && (
        <Row>
          <Col md="12">
            <h5>Historial de Pagos</h5>
            <p>Últimos 3 pagos</p>
            {paymentsHistory.length === 0 ? (
              <p>Este alumno no ha realizado pagos aún.</p>
            ) : (
              <Table bordered responsive hover>
                <thead className="thead-light">
                  <tr>
                    <th>#</th>
                    <th>Plan</th>
                    <th>Monto</th>
                    <th>Pagado en</th>
                    <th>Válido hasta</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentsHistory.slice(0, 3).map((payment, idx) => (
                    <tr key={payment.id}>
                      <td>{idx + 1}</td>
                      <td>{payment.membership.name}</td>
                      <td>Q{parseFloat(payment.amount).toFixed(2)}</td>
                      <td>{new Date(payment.date_paid).toLocaleString()}</td>
                      <td>{new Date(payment.valid_until).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Col>
          <Col md="12">
            <h5>Historial de Asistencias</h5>
            {classHistory.length === 0 ? (
              <p>No hay clases registradas aún.</p>
            ) : (
              <Table bordered responsive hover>
                <thead className="thead-light">
                  <tr>
                    <th>Fecha</th>
                    <th>Horario</th>
                    <th>Membresía</th>
                    <th>Asistencia</th>
                  </tr>
                </thead>
                <tbody>
                  {classHistory.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.class_date}</td>
                      <td>{item.schedule}</td>
                      <td>{item.membership || "—"}</td>
                      <td>
                        <Badge color={{
                          attended: "success",
                          no_show: "danger",
                          pending: "warning",
                          cancelled: "secondary"
                        }[item.attendance_status?.toLowerCase()] || "dark"}>
                          {{
                            attended: "Asistió",
                            no_show: "No asistió",
                            pending: "Pendiente",
                            cancelled: "Cancelada"
                          }[item.attendance_status?.toLowerCase()] || "Desconocido"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Col>
        </Row>
      )}
    </>
  );
};

export default ClientDetail;
