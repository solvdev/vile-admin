import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
} from "reactstrap";
import ReactTable from "components/ReactTable/ReactTable.js";
import ReactLoading from "react-loading";
import { Toaster } from 'react-hot-toast';
import { overlayStyles, loaderContainerStyles } from "styles/commonStyles";
import { fetchAllClients, fetchClientById, updateClient } from "./service/clientsService";
import { handleApiError } from "utils/ErrorHandler";
import { useNotifications } from "hooks/useNotifications";
import DetailModal from "../Clients/modals/DetailModal";
import ClientDetail from "../Clients/Details/ClientDetail";

function Clients() {
  const [clientsData, setClientsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoadedSuccess, setIsLoadedSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientModalMode, setClientModalMode] = useState("view");

  const toggleClientModal = () => setClientModalOpen(!clientModalOpen);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllClients();
      const formatted = response.map((item) => ({
        id: item.id,
        name: `${item.first_name} ${item.last_name}`,
        phone: item.phone,
        email: item.email,
        age: item.age,
        trial: item.trial_used,
        status: item.status,
        actions: (
          <div className="actions-right">
            <Button
              onClick={() => handleClientClick(item.id)}
              color="info"
              size="sm"
              className="btn-icon btn-link"
            >
              <i className="fa fa-search" />
            </Button>
            <Button
              onClick={() => handleEditClient(item)}
              color="warning"
              size="sm"
              className="btn-icon btn-link"
            >
              <i className="fa fa-edit" />
            </Button>
            {item.status === 'A' && (
              <Button
                onClick={() => handleDisable(item.id)}
                color="danger"
                size="sm"
                className="btn-icon btn-link remove"
              >
                <i className="fa fa-power-off" />
              </Button>
            )}
          </div>
        )
      }));
      setClientsData(formatted);
      setIsLoadedSuccess(true);
    } catch (err) {
      handleApiError(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDisable = async (id) => {
    try {
      await updateClient(id, { status: 'I' });
      fetchData();
    } catch (error) {
      console.error("Error al desactivar cliente:", error);
    }
  };

  const notificationMessages = {
    success: 'Clientes cargados exitosamente.',
    error: (e) => e.message || "Error al cargar clientes.",
  };

  useNotifications(isLoadedSuccess, error, notificationMessages);

  const handleClientClick = async (id) => {
    try {
      const updatedClient = await fetchClientById(id);
      setSelectedClient(updatedClient);
      setClientModalMode("view");
      setClientModalOpen(true);
    } catch (error) {
      console.error("Error al obtener el cliente:", error);
    }
  };

  const handleEditClient = async (client) => {
    setSelectedClient(client);
    setClientModalMode("edit");
    setClientModalOpen(true);
  };

  const handleNewClient = () => {
    setSelectedClient(null);
    setClientModalMode("create");
    setClientModalOpen(true);
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

      <DetailModal
        isOpen={clientModalOpen}
        toggle={toggleClientModal}
        title={
          clientModalMode === "create"
            ? "Registrar Nuevo Alumno"
            : selectedClient
              ? `Alumno: ${selectedClient.first_name} ${selectedClient.last_name}`
              : ""
        }
        content={
          <ClientDetail
            mode={clientModalMode}
            client={selectedClient}
            onClientUpdated={() => {
              fetchData(); // actualiza lista
              setClientModalOpen(false); // cierra modal
            }}
          />
        }
        showPrimaryAction={false}
      />

      <div className="content">
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <CardTitle tag="h4">Listado de Alumnos</CardTitle>
                <Button onClick={handleNewClient}
                  style={{ backgroundColor: "#7F6552", color: "white", borderColor: "#7F6552" }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = "#7F6552"; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = "#7F6552"; }}
                >
                  <i className="fa fa-plus" /> Nuevo Alumno
                </Button>
              </CardHeader>
              <CardBody>
                <ReactTable
                  data={clientsData}
                  columns={[
                    { Header: "Nombre", accessor: "name" },
                    { Header: "Correo", accessor: "email" },
                    { Header: "Teléfono", accessor: "phone" },
                    { Header: "Edad", accessor: "age" },
                    {
                      Header: "Clase de Prueba",
                      accessor: "trial",
                      className: "text-center",
                      headerClassName: "text-center",
                      Cell: ({ value }) => (
                        <span
                          style={{
                            padding: "5px 10px",
                            borderRadius: "5px",
                            color: value === false ? "black" : "white",
                            backgroundColor: value === false ? "#c5ebb7" : "#f37777",
                            fontWeight: "bold",
                            fontSize: "0.8rem",
                            textAlign: "center",
                          }}
                        >
                          {value === false ? "Disponible" : "No Disponible"}
                        </span>
                      ),
                    },
                    {
                      Header: "Estado",
                      accessor: "status",
                      className: "text-center",
                      headerClassName: "text-center",
                      Cell: ({ value }) => (
                        <span
                          style={{
                            padding: "5px 10px",
                            borderRadius: "5px",
                            color: value === 'A' ? "black" : "white",
                            backgroundColor: value === 'A' ? "#c5ebb7" : "#f37777",
                            fontWeight: "bold",
                            fontSize: "0.8rem",
                            textAlign: "center",
                          }}
                        >
                          {value === 'A' ? 'Activo' : 'Inactivo'}
                        </span>
                      )
                    },
                    { Header: "Acciones", accessor: "actions", sortable: false, filterable: false },
                  ]}
                  className="-striped -highlight primary-pagination"
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Clients;