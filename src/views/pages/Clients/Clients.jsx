// Clients.jsx - Vista unificada con filtro global por cliente

import React, { useState, useEffect } from "react";
import { Row, Col, Label } from "reactstrap";
import Select from "react-select";
import { Toaster } from "react-hot-toast";
import { fetchAllClients } from "./service/clientsService";
import ClientDashboard from "./Details/ClientDashboard"; // crearás este archivo
import { overlayStyles, loaderContainerStyles } from "styles/commonStyles";
import ReactLoading from "react-loading";


export default function Clients() {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [loadingClients, setLoadingClients] = useState(false); // nuevo estado
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoadingClients(true); // iniciar carga
        const data = await fetchAllClients();
        setClients(data);
        setLoadingClients(false); // finalizar carga
      } catch (err) {
        console.error("Error al cargar clientes");
      }
    };
    fetchClients();
  }, []);

  return (
    <>
      {loadingClients && (
        <div style={overlayStyles}>
          <div style={loaderContainerStyles}>
            <ReactLoading type="spin" color="white" height="40%" />
          </div>
        </div>
      )}
      <Toaster position="top-right" />
      <div className="content">
        <Row className="mb-3">
          <Col md={6}>
            <Label>Selecciona un alumno</Label>
            <Select
              options={clients.map(c => ({ value: c.id, label: `${c.first_name} ${c.last_name}` }))}
              value={clients.find(c => c.id === selectedClientId) ? {
                value: selectedClientId,
                label: `${clients.find(c => c.id === selectedClientId).first_name} ${clients.find(c => c.id === selectedClientId).last_name}`
              } : null}
              onChange={selected => setSelectedClientId(selected ? selected.value : null)}
              isClearable
              placeholder="Buscar alumno..."
            />
          </Col>
        </Row>

        {selectedClientId && <ClientDashboard clientId={selectedClientId} />}
      </div>
    </>
  );
}

