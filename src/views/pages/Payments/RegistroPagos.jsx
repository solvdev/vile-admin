import React, { useEffect, useState } from "react";
import {
  Button, Card, CardHeader, CardBody, CardTitle,
  Row, Col, FormGroup, Label, Input,
  Modal, ModalHeader, ModalBody, ModalFooter, Table
} from "reactstrap";
import Select from "react-select";
import ReactLoading from "react-loading";
import { Toaster } from "react-hot-toast";
import { overlayStyles, loaderContainerStyles } from "styles/commonStyles";
import { useNotifications } from "hooks/useNotifications";
import { createPayment } from "../Clients/service/paymentsService";
import { createVenta } from "../Clients/service/ventasService";
import { fetchAllMemberships } from "../Clients/service/membershipService";
import { fetchAllClients } from "../Clients/service/clientsService";

const normalize = (text) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function PaymentsRegister() {
  const [loading, setLoading] = useState(false);
  const [isLoadedSuccess, setIsLoadedSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [clients, setClients] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [clientId, setClientId] = useState(null);

  const [isMembership, setIsMembership] = useState(true);
  const [saleDate, setSaleDate] = useState('');

  const [memberships, setMemberships] = useState([]);
  const [selectedMembership, setSelectedMembership] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [ventaNotes, setVentaNotes] = useState('');

  const [paymentList, setPaymentList] = useState([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const toggleConfirmModal = () => setConfirmModalOpen(!confirmModalOpen);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [clientData, membershipData] = await Promise.all([
          fetchAllClients(),
          fetchAllMemberships(),
        ]);
        setClients(clientData);
        setMemberships(membershipData);
        setClientOptions(clientData.map(c => ({
          value: c.id,
          label: `${c.first_name} ${c.last_name} - ${c.email}`
        })));
      } catch (err) {
        console.error("Error cargando datos", err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleAddToList = () => {
    if (!clientId || !paymentMethod) return;

    const selectedClient = clients.find(c => c.id === clientId);
    const clientName = selectedClient ? `${selectedClient.first_name} ${selectedClient.last_name}` : `ID: ${clientId}`;

    if (isMembership) {
      if (!selectedMembership || !paymentAmount || !paymentDate || !validUntil) return;
      const membershipName = memberships.find(m => m.id === parseInt(selectedMembership))?.name;
      setPaymentList((prev) => [
        ...prev,
        {
          type: 'membership',
          client_id: clientId,
          client_name: clientName,
          membership_id: selectedMembership,
          membership_name: membershipName,
          amount: paymentAmount,
          date_paid: paymentDate,
          valid_until: validUntil,
          payment_method: paymentMethod
        }
      ]);
    } else {
      if (!productName || !quantity || !pricePerUnit) return;
      setPaymentList((prev) => [
        ...prev,
        {
          type: 'venta',
          client_id: clientId,
          client_name: clientName,
          product_name: productName,
          quantity,
          price_per_unit: pricePerUnit,
          total_amount: (quantity * parseFloat(pricePerUnit)).toFixed(2),
          payment_method: paymentMethod,
          notes: ventaNotes,
          date_sold: paymentDate
        }
      ]);
    }

    // Limpiar campos
    setClientId(null);
    setSelectedMembership('');
    setPaymentAmount('');
    setPaymentDate('');
    setValidUntil('');
    setPaymentMethod('');
    setProductName('');
    setQuantity(1);
    setPricePerUnit('');
    setVentaNotes('');
  };

  const handleRemoveFromList = (index) => {
    setPaymentList(prev => prev.filter((_, i) => i !== index));
  };

  const handleRegisterAll = async () => {
    setLoading(true);
    try {
      for (let p of paymentList) {
        if (p.type === 'membership') {
          await createPayment({
            client_id: p.client_id,
            membership_id: p.membership_id,
            amount: p.amount,
            date_paid: new Date(`${p.date_paid}T00:00:00`).toLocaleString("sv-SE", { hour12: false }).replace(" ", "T"),
            valid_until: p.valid_until,
            payment_method: p.payment_method
          });
        } else {
          await createVenta({
            client_id: p.client_id,
            product_name: p.product_name,
            quantity: p.quantity,
            date_sold: new Date(`${saleDate}T00:00:00`).toLocaleString("sv-SE", { hour12: false }).replace(" ", "T"),
            price_per_unit: p.price_per_unit,
            total_amount: (quantity * parseFloat(p.price_per_unit)).toFixed(2),
            payment_method: p.payment_method,
            notes: p.notes
          });
        }
      }
      setIsLoadedSuccess(true);
      setPaymentList([]);
      toggleConfirmModal();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const notificationMessages = {
    success: "Pagos/ventas registrados exitosamente.",
    error: (e) => e.message || "Error al registrar.",
  };

  useNotifications(isLoadedSuccess, error, notificationMessages);

  const customFilterOption = (option, inputValue) => {
    return normalize(option.label).includes(normalize(inputValue));
  };

  return (
    <>
      {loading && (
        <div style={overlayStyles}>
          <div style={loaderContainerStyles}>
            <ReactLoading type="spin" color="white" height="40%" />
          </div>
        </div>
      )}
      <Toaster position="top-right" />

      <Modal isOpen={confirmModalOpen} toggle={toggleConfirmModal} centered>
        <ModalHeader toggle={toggleConfirmModal}>Confirmar Registro de Pagos</ModalHeader>
        <ModalBody>
          {paymentList.length === 0 ? (
            <p>No hay pagos para guardar.</p>
          ) : (
            <ul>
              {paymentList.map((p, idx) => (
                <li key={idx}>
                  {p.type === 'membership'
                    ? `${p.client_name} - ${p.membership_name} Q${p.amount} (${p.payment_method})`
                    : `${p.client_name} - ${p.product_name} x${p.quantity} Q${p.total_amount} (${p.payment_method})`
                  }
                </li>
              ))}
            </ul>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleConfirmModal}>Cancelar</Button>
          <Button style={{ backgroundColor: "#7F6552", borderColor: "#7F6552" }} onClick={handleRegisterAll}>
            Registrar Pagos
          </Button>
        </ModalFooter>
      </Modal>

      <div className="content">
        <Row>
          <Col md="12">
            <Card>
              <CardHeader><CardTitle tag="h4">Registrar Pago o Venta</CardTitle></CardHeader>
              <CardBody>
                <FormGroup tag="fieldset">
                  <legend>Tipo de Pago</legend>
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="radio"
                        name="tipoRegistro"
                        checked={isMembership}
                        onChange={() => setIsMembership(true)}
                      />{' '}
                      Pago de Membresía
                    </Label>
                  </FormGroup>
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="radio"
                        name="tipoRegistro"
                        checked={!isMembership}
                        onChange={() => setIsMembership(false)}
                      />{' '}
                      Pagos Adicionales
                    </Label>
                  </FormGroup>
                </FormGroup>

                <FormGroup>
                  <Label>Alumno</Label>
                  <Select
                    options={clientOptions}
                    value={clientOptions.find(o => o.value === clientId) || null}
                    onChange={(selected) => setClientId(selected ? selected.value : null)}
                    placeholder="Buscar alumno..."
                    isClearable
                    filterOption={customFilterOption}
                  />
                </FormGroup>

                {isMembership ? (
                  <>
                    <FormGroup>
                      <Label>Membresía</Label>
                      <Input
                        type="select"
                        value={selectedMembership || ''}
                        onChange={(e) => {
                          const id = e.target.value;
                          setSelectedMembership(id);
                          const selected = memberships.find(m => m.id === parseInt(id));
                          if (selected) setPaymentAmount(selected.price);
                        }}
                      >
                        <option value="" disabled>-- Elegir Membresía --</option>
                        {memberships.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} - Q{parseFloat(m.price).toFixed(2)}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>

                    <FormGroup>
                      <Label>Método de Pago</Label>
                      <Input
                        type="select"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <option value="" disabled>-- Selecciona método de pago --</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Transferencia">Transferencia</option>
                        <option value="Tarjeta">Tarjeta</option>
                      </Input>
                    </FormGroup>

                    <FormGroup>
                      <Label>Monto</Label>
                      <Input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
                    </FormGroup>

                    <FormGroup>
                      <Label>Fecha de Inicio</Label>
                      <Input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => {
                          const start = e.target.value;
                          setPaymentDate(start);
                          if (start) {
                            const end = new Date(start);
                            end.setDate(end.getDate() + 30);
                            setValidUntil(end.toISOString().split("T")[0]);
                          } else {
                            setValidUntil('');
                          }
                        }}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Fecha de Vencimiento</Label>
                      <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
                    </FormGroup>
                  </>
                ) : (
                  <>
                    <FormGroup>
                      <Label>Pago de: </Label>
                      <Input
                        type="select"
                        value={productName ? productName : ''}
                        onChange={(e) => setProductName(e.target.value)}
                      >
                        <option value="" disabled>-- Selecciona Concepto --</option>
                        <option value="Penalizacion">Penalización</option>
                        <option value="Calcetas de Pilates">Calcetas de Pilates</option>
                      </Input>
                    </FormGroup>
                    <FormGroup>
                      <Label>Cantidad</Label>
                      <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                    </FormGroup>
                    <FormGroup>
                      <Label>Fecha de Pago</Label>
                      <Input
                        type="date"
                        value={saleDate}
                        onChange={(e) => setSaleDate(e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Precio Por Unidad</Label>
                      <Input type="number" value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value)} />
                    </FormGroup>
                    <FormGroup>
                      <Label>Método de Pago</Label>
                      <Input
                        type="select"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <option value="" disabled>-- Selecciona método de pago --</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Transferencia">Transferencia</option>
                        <option value="Tarjeta">Tarjeta</option>
                      </Input>
                    </FormGroup>
                  </>
                )}

                <Button
                  style={{ backgroundColor: "#7F6552", color: "white", borderColor: "#7F6552" }}
                  onClick={handleAddToList}
                >
                  Agregar a la lista
                </Button>

                {paymentList.length > 0 && (
                  <>
                    <hr />
                    <h5>Pagos por confirmar:</h5>
                    <Table bordered hover responsive>
                      <thead className="thead-light">
                        <tr>
                          <th>#</th>
                          <th>Alumno</th>
                          <th>Detalle</th>
                          <th>Monto</th>
                          <th>Método</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentList.map((p, idx) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{p.client_name}</td>
                            <td>
                              {p.type === 'membership'
                                ? `${p.membership_name} (${p.date_paid} → ${p.valid_until})`
                                : `${p.product_name} x${p.quantity}`}
                            </td>
                            <td>Q{p.type === 'membership' ? parseFloat(p.amount).toFixed(2) : parseFloat(p.total_amount).toFixed(2)}</td>
                            <td>{p.payment_method}</td>
                            <td>
                              <Button color="danger" size="sm" className="btn-icon btn-link remove" onClick={() => handleRemoveFromList(idx)}>
                                <i className="fa fa-remove" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>

                    <Button
                      style={{ backgroundColor: "#7F6552", color: "white", borderColor: "#7F6552" }}
                      onClick={toggleConfirmModal}
                    >
                      Confirmar y Registrar Todos
                    </Button>
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default PaymentsRegister;
