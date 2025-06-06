import React, { useEffect, useState } from 'react';
import {
  Button,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Table,
  Card, CardBody, CardHeader, Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import ReactLoading from 'react-loading';
import { Toaster } from 'react-hot-toast';
import { overlayStyles, loaderContainerStyles } from 'styles/commonStyles';

import { handleApiError } from 'utils/ErrorHandler';
import { useNotifications } from 'hooks/useNotifications';
import { fetchClientById, createClient, updateClient } from '../service/clientsService';
import { createPayment, fetchPaymentsByClient, getPaymentsInGrace, extendPaymentValidity } from '../service/paymentsService';
import { fetchAllMemberships } from '../service/membershipService';
import { formatSpanishDate } from 'views/utils/DateUtil';

const ClientDetail = ({ client, onClientUpdated = () => { }, mode = "view" }) => {
  const [loading, setLoading] = useState(false);
  const [memberships, setMemberships] = useState([]);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [hasPreviousPayments, setHasPreviousPayments] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [localClient, setLocalClient] = useState(client);
  const [paymentsHistory, setPaymentsHistory] = useState([]);
  const isFormMode = mode === 'create' || mode === 'edit';
  const [graceInfo, setGraceInfo] = useState(null);
  const [assignedMembership, setAssignedMembership] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [paymentToExtend, setPaymentToExtend] = useState(null);


  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    age: '',
    dpi: '',
    address: '',
    sex: '',
    notes: '',
    source: '',
    trial_used: false,
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [membershipsData, payments] = await Promise.all([
        fetchAllMemberships(),
        fetchPaymentsByClient(localClient.id)
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
    const loadData = async () => {
      try {
        if ((mode === 'view' && client) || mode === 'edit') {
          await fetchData();
        }

        if (mode === 'create') {
          const membershipsData = await fetchAllMemberships();
          setMemberships(membershipsData);
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
            source: client.source,
            trial_used: client.trial_used ?? false,
          });
        }
      } catch (err) {
        handleApiError(err);
      }
    };

    loadData();
  }, [client, mode]);

  useEffect(() => {
    const fetchGraceInfo = async () => {
      try {
        const data = await getPaymentsInGrace();
        const match = data.find(entry => entry.client.id === client.id);
        if (match) setGraceInfo(match);
      } catch (err) {
        console.error("Error al obtener información de gracia:", err);
      }
    };

    if (mode === 'view' && client) {
      fetchGraceInfo();
    }
  }, [client, mode]);


  useEffect(() => {
    setLocalClient(client);
  }, [client]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClient = async () => {
    setLoading(true);
    try {
      let newClient = null;

      if (mode === 'create') {
        const created = await createClient(formData);
        newClient = created; // guardamos al nuevo cliente para usar su ID
      } else if (mode === 'edit') {
        await updateClient(client.id, formData);
      }

      // Si se seleccionó una membresía y se acaba de crear el cliente:
      if (mode === 'create' && selectedMembership && newClient?.id) {
        const selectedPlan = memberships.find(m => m.id === parseInt(selectedMembership));
        await createPayment({
          client_id: newClient.id,
          membership_id: selectedPlan.id,
          amount: selectedPlan.price,
        });
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

  const handleAssignMembership = async () => {
    if (!assignedMembership) return;
    setLoading(true);
    try {
      await updateClient(localClient.id, {
        current_membership: assignedMembership
      });
      const updatedClient = await fetchClientById(localClient.id);
      setLocalClient(updatedClient);
      if (onClientUpdated) await onClientUpdated();
      setSuccess(true);
    } catch (err) {
      handleApiError(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayment = async () => {
    setLoading(true);
    try {
      await createPayment({
        client_id: localClient.id,
        membership_id: selectedMembership,
        amount: paymentAmount,
        date_paid: new Date(paymentDate).toISOString(),
        valid_until: validUntil
      });
      await fetchData(); // recargar historial de pagos
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
          <h5>{mode === 'view' ? 'Información del Alumno' : (mode === 'edit' ? 'Editar Alumno' : 'Nuevo Alumno')}</h5>
          {mode === 'view' ? (
            <>
              <Card className="mb-4">
                <CardHeader>Información del Alumno</CardHeader>
                <CardBody>
                  <Row>

                  </Row>
                  <Col md="6">
                    <p><strong>Nombre:</strong> {localClient.first_name} {localClient.last_name}</p>
                    <p><strong>Correo:</strong> {localClient.email}</p>
                    <p><strong>Teléfono:</strong> {localClient.phone}</p>
                    <p><strong>DPI:</strong> {localClient.dpi}</p>
                    <p><strong>Edad:</strong> {localClient.age} años</p>
                  </Col>
                  <Col md="6">
                    <p><strong>Estado:</strong> {localClient.status === 'A' ? 'Activo' : 'Inactivo'}</p>
                    <p><strong>Clase de Prueba:</strong> {localClient.trial_used ? 'Usada' : 'Disponible'}</p>
                    <p><strong>Notas:</strong> {localClient.notes || 'Sin notas'}</p>
                    <p><strong>Clase de Prueba:</strong> {' '}
                      {localClient.trial_used ? (
                        <span style={{
                          backgroundColor: '#f37777',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          Usada
                        </span>
                      ) : (
                        <span style={{
                          backgroundColor: '#c5ebb7',
                          color: 'black',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          Disponible
                        </span>
                      )}
                    </p>
                    <p><strong>Membresía Activa:</strong> {localClient.active_membership ? localClient.active_membership.name : 'Sin membresía activa'}</p>
                  </Col>
                </CardBody>
              </Card>
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
                <Input name="dpi" value={formData.dpi} onChange={handleInputChange} />
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

              <FormGroup>
                <Label>Clase de Prueba</Label>
                <Input
                  type="select"
                  name="trial_used"
                  value={formData.trial_used ? 'used' : 'available'}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      trial_used: e.target.value === 'used' ? true : false
                    }))
                  }
                >
                  <option value="available">Disponible</option>
                  <option value="used">No Disponible</option>
                </Input>
              </FormGroup>


            </>
          )}
        </Col>

        {(mode === 'create' || mode === 'edit') && (
          <>
            <Col md="6">
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
            </Col>
          </>
        )}
      </Row>

      {mode === 'view' && (
        <Row>
          <Col md="12">
            <Card className="mb-4">
              <CardHeader>Historial de Pagos</CardHeader>
              <CardBody>
                {paymentsHistory.length === 0 ? (
                  <p>Este alumno no ha realizado pagos aún.</p>
                ) : (
                  <>


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
                            <td>{formatSpanishDate(payment.date_paid, true)}</td>
                            <td>{formatSpanishDate(payment.valid_until)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    {paymentsHistory.length > 0 && (
                      (() => {
                        const latestPayment = paymentsHistory[0];
                        const isExpired = new Date(latestPayment.valid_until) < new Date();

                        if (isExpired) {
                          return (
                            <div className="mt-3">
                              <Button
                                style={{ backgroundColor: "#7F6552", color: "white", borderColor: "#7F6552" }}
                                onMouseEnter={(e) => { e.target.style.backgroundColor = "#7F6552"; }}
                                onMouseLeave={(e) => { e.target.style.backgroundColor = "#7F6552"; }}
                                size="sm"
                                onClick={() => {
                                  setPaymentToExtend(latestPayment);
                                  setShowExtendModal(true);
                                }}
                              >
                                💡 Extender Vigencia +6 días
                              </Button>
                            </div>
                          );
                        }

                        return null;
                      })()
                    )}
                    {showExtendModal && (
                      <Modal isOpen={showExtendModal} toggle={() => setShowExtendModal(false)} centered>
                        <ModalHeader toggle={() => setShowExtendModal(false)}>Extender Vigencia</ModalHeader>
                        <ModalBody>
                          ¿Deseas extender la vigencia de este plan 6 días adicionales?
                        </ModalBody>
                        <ModalFooter>
                          <Button style={{ backgroundColor: "#e83838", color: "white", borderColor: "#e83838" }}
                            onMouseEnter={(e) => { e.target.style.backgroundColor = "#e83838"; }}
                            onMouseLeave={(e) => { e.target.style.backgroundColor = "#e83838"; }} onClick={() => setShowExtendModal(false)}>
                            Cancelar
                          </Button>
                          <Button
                            style={{ backgroundColor: "#7F6552", color: "white", borderColor: "#7F6552" }}
                            onMouseEnter={(e) => { e.target.style.backgroundColor = "#7F6552"; }}
                            onMouseLeave={(e) => { e.target.style.backgroundColor = "#7F6552"; }}
                            onClick={async () => {
                              try {
                                extendPaymentValidity(paymentToExtend.id);
                                await fetchData();
                                setShowExtendModal(false);
                                setPaymentToExtend(null);
                              } catch (err) {
                                console.error("Error extendiendo vigencia:", err);
                              }
                            }}
                          >
                            Confirmar
                          </Button>
                        </ModalFooter>
                      </Modal>
                    )}

                  </>

                )}
              </CardBody>
            </Card>

            {/* NUEVA SECCIÓN DE INFORMACIÓN DE GRACIA */}
            {graceInfo ? (
              <div className="mt-3 p-3 border rounded bg-warning text-dark">
                <strong>⚠️ En periodo de gracia</strong>
                <p className="mb-0">
                  Este cliente puede renovar su plan <strong>{graceInfo.membership}</strong>
                  con el mismo precio de <strong>Q{parseFloat(graceInfo.client.last_payment_amount || 0).toFixed(2)}</strong>
                  hasta el <strong>{new Date(graceInfo.grace_ends).toLocaleDateString()}</strong>.
                </p>
              </div>
            ) : (
              hasPreviousPayments && paymentsHistory.length > 0 &&
              new Date(paymentsHistory[0].valid_until) < new Date() && (
                <div className="mt-3 p-3 border rounded bg-light">
                  <strong>💡 Renovación fuera de gracia</strong>
                  <p className="mb-0">Este cliente deberá pagar el precio actual del plan si desea renovar.</p>
                </div>
              )
            )}
          </Col>
        </Row> // ← CIERRA el <Row> y el <Col> correctamente
      )}
    </>
  );
};

export default ClientDetail;
