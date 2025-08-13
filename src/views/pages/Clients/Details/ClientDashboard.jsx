// ClientDashboard.jsx - vista consolidada del alumno

import React, { useEffect, useState } from "react";
import {
  Card, CardBody, CardHeader, CardTitle,
  Row, Col, Table, Button, Input, FormGroup, Label
} from "reactstrap";
import { getBookingsByClient, fetchClientById } from "../service/clientsService";
import { applyPenalty } from "../service/paymentsService";
import api from "api/api";
import toast from "react-hot-toast";
import ReactLoading from "react-loading";
import { overlayStyles, loaderContainerStyles } from "styles/commonStyles";

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function ClientDashboard({ clientId }) {
  const [client, setClient] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [controlData, setControlData] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loadingClient, setLoadingClient] = useState(false);
  const [loadingControl, setLoadingControl] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const isLoading = loadingClient || loadingControl || loadingBookings;

  useEffect(() => {
    if (!clientId) return;
    const fetchAll = async () => {
      setLoadingClient(true);
      setLoadingBookings(true);
      try {
        const [clientData, bookingData] = await Promise.all([
          fetchClientById(clientId),
          getBookingsByClient(clientId)
        ]);
        setClient(clientData);
        setBookings(bookingData);
      } catch (err) {
        toast.error("Error al cargar información del alumno");
      } finally {
        setLoadingClient(false);
        setLoadingBookings(false);
      }
    };
    fetchAll();
  }, [clientId]);

  useEffect(() => {
    if (!clientId) return;
    const fetchControl = async () => {
      setLoadingControl(true);
      try {
        const res = await api.get(`/studio/clases-por-mes/?year=${year}&month=${month}`);
        const row = res.data.find(item => item.client_id === clientId);
        setControlData(row);
      } catch (err) {
        toast.error("Error al cargar control mensual");
      } finally {
        setLoadingControl(false);
      }
    };
    fetchControl();
  }, [clientId, year, month]);

  useEffect(() => {
    const filtered = bookings.filter(b => {
      const date = new Date(b.class_date);
      return date.getFullYear() === year && (date.getMonth() + 1) === month;
    });
    setFilteredBookings(filtered);
  }, [bookings, year, month]);

  const handlePenalty = async (amount) => {
    if (!window.confirm(`¿Asignar penalización de Q${amount}?`)) return;
    try {
      await applyPenalty({ client_id: clientId, amount });
      toast.success("Penalización aplicada");
    } catch {
      toast.error("Error al aplicar penalización");
    }
  };

  const calcularObservacion = () => {
    if (!controlData || !client) return '';
    if (!client.active_membership) return '';
    const totalClases = (controlData.valid_classes || 0) + (controlData.no_show_classes || 0);
    if (totalClases <= 1 && new Date(client.created_at).getMonth() === (month - 1)) return 'NUEVA';
    if (totalClases >= client.active_membership.classes_per_month) return 'RENOVACIÓN TEMPRANA';
    return 'RENOVACIÓN';
  };

  const fechaSiguienteRenovacion = () => {
    const fecha = new Date(year, month - 1, 1);
    fecha.setMonth(fecha.getMonth() + 1);
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '');
  };

  if (!client) return null;

  return (
    <>
      {isLoading && (
        <div style={overlayStyles}>
          <div style={loaderContainerStyles}>
            <ReactLoading type="spin" color="white" height="40%" />
          </div>
        </div>
      )}

      <Card className="mb-4">
        <CardHeader>
          <CardTitle tag="h4">Información del Alumno</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col md={6}>
              <p><strong>Nombre:</strong> {client.first_name} {client.last_name}</p>
              <p><strong>Correo:</strong> {client.email}</p>
              <p><strong>Teléfono:</strong> {client.phone}</p>
              <p><strong>DPI:</strong> {client.dpi || '—'}</p>
            </Col>
            <Col md={6}>
              <p><strong>Membresía activa:</strong> {client.active_membership ? client.active_membership.name : '—'}</p>
              <p><strong>Clases por mes:</strong> {client.active_membership ? client.active_membership.classes_per_month : '—'}</p>
              <p><strong>Clase de prueba:</strong> {client.trial_used ? 'Usada' : 'Disponible'}</p>
              <p><strong>Estado:</strong> {client.status === 'A' ? 'Activo' : 'Inactivo'}</p>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle tag="h4">Control de Clases</CardTitle>
        </CardHeader>
        <CardBody>
          <Row className="mb-3">
            <Col md={3}>
              <FormGroup>
                <Label>Mes</Label>
                <Input type="select" value={month} onChange={e => setMonth(Number(e.target.value))}>
                  {monthNames.map((name, i) => <option key={i} value={i + 1}>{name}</option>)}
                </Input>
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label>Año</Label>
                <Input type="number" value={year} onChange={e => setYear(Number(e.target.value))} />
              </FormGroup>
            </Col>
          </Row>

          {controlData ? (
            <Table responsive bordered>
              <thead>
                <tr>
                  <th># Clases Paquete</th>
                  <th>Tomadas</th>
                  <th>Inasistencias</th>
                  <th>Restantes</th>
                  <th>Penalización</th>
                  <th>Renovación</th>
                  <th>Observación</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{controlData.expected_classes}</td>
                  <td>{controlData.valid_classes}</td>
                  <td>{controlData.no_show_classes}</td>
                  <td>{controlData.expected_classes - controlData.valid_classes - controlData.no_show_classes}</td>
                  <td>Q{parseFloat(controlData.penalty).toFixed(2)}</td>
                  <td>{fechaSiguienteRenovacion()}</td>
                  <td>{calcularObservacion()}</td>
                  <td>
                    {controlData.penalty > 0 ? (
                      <Button color="danger" size="sm" onClick={() => handlePenalty(controlData.penalty)}>
                        Aplicar Penalización
                      </Button>
                    ) : '-'}
                  </td>
                </tr>
              </tbody>
            </Table>
          ) : <p>No hay datos de control este mes.</p>}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle tag="h4">Historial de Reservas</CardTitle>
        </CardHeader>
        <CardBody>
          <Table responsive bordered>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Horario</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((item, index) => (
                <tr key={index}>
                  <td>{item.class_date}</td>
                  <td>{item.schedule || '—'}</td>
                  <td>{
                    item.attendance_status === 'attended' ? 'Asistió' :
                    item.attendance_status === 'no_show' ? 'Inasistencia' :
                    item.attendance_status === 'cancelled' ? 'Cancelada' : 'Pendiente'
                  }</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </>
  );
}