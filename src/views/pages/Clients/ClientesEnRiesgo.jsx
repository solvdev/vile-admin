import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col
} from "reactstrap";
import ReactTable from "components/ReactTable/ReactTable.js";
import ReactLoading from "react-loading";
import { Toaster } from 'react-hot-toast';
import { overlayStyles, loaderContainerStyles } from "styles/commonStyles";
import { fetchClientsAtRisk } from "../Clients/service/clientsService";
import { handleApiError } from "utils/ErrorHandler";
import { useNotifications } from "hooks/useNotifications";
import { fetchClientById } from "../Clients/service/clientsService";
import DetailModal from "../Clients/modals/DetailModal";
import ClientDetail from "../Clients/Details/ClientDetail";

function ClientesEnRiesgo() {
  const [clientsData, setClientsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoadedSuccess, setIsLoadedSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const toggleClientModal = () => setClientModalOpen(!clientModalOpen);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchClientsAtRisk();
      const formatted = response.map((item) => ({
        id: item.id,
        name: `${item.first_name} ${item.last_name}`,
        phone: item.phone,
        email: item.email,
        status: item.status,
        actions: (
          <Button
            onClick={() => handleClientClick(item.id)}
            color="info"
            size="sm"
            className="btn-icon btn-link"
          >
            <i className="fa fa-search" />
          </Button>
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

  const notificationMessages = {
    success: 'Clientes en riesgo cargados exitosamente.',
    error: (e) => e.message || "Error al cargar clientes en riesgo.",
  };

  useNotifications(isLoadedSuccess, error, notificationMessages);

  const handleClientClick = async (id) => {
    try {
      const updatedClient = await fetchClientById(id);
      setSelectedClient(updatedClient);
      setClientModalOpen(true);
    } catch (error) {
      console.error("Error al obtener el cliente:", error);
    }
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
          selectedClient
            ? `Alumno: ${selectedClient.first_name} ${selectedClient.last_name}`
            : "Detalle del Alumno"
        }
        content={<ClientDetail mode="view" client={selectedClient} />}
        showPrimaryAction={false}
      />

      <div className="content">
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <CardTitle tag="h4">Alumnos con Riesgo de Abandono</CardTitle>
              </CardHeader>
              <CardBody>
                <ReactTable
                  data={clientsData}
                  columns={[
                    { Header: "Nombre", accessor: "name" },
                    { Header: "Correo", accessor: "email" },
                    { Header: "Teléfono", accessor: "phone" },
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

export default ClientesEnRiesgo;