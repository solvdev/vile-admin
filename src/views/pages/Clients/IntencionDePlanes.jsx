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
import { Toaster, toast } from 'react-hot-toast';
import { overlayStyles, loaderContainerStyles } from "styles/commonStyles";
import { fetchPotentialClients } from "./service/planIntentService";
import { fetchClientById } from "./service/clientsService";
import DetailModal from "../Clients/modals/DetailModal";
import ClientDetail from "../Clients/Details/ClientDetail";

function IntentosDePlanes() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [subscriptionConfirmed, setSubscriptionConfirmed] = useState(false);
    const [shouldReload, setShouldReload] = useState(false);
    const [overlayStyles, setOverlayStyles] = useState({
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 9999,
    });

    const toggleModal = () => setModalOpen(!modalOpen);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetchPotentialClients();
            const formatted = res.map((item) => ({
                id: item.client.id,
                name: `${item.client.first_name} ${item.client.last_name}`,
                email: item.client.email,
                phone: item.client.phone,
                plan: item.plan_intent?.membership?.name || "Sin Plan Seleccionado",
                selected_at: item.plan_intent?.selected_at
                    ? new Date(item.plan_intent.selected_at).toLocaleString()
                    : "Clase gratuita pendiente",
                actions: (
                    <Button
                        onClick={() => handleClick(item.client.id)}
                        color="info"
                        size="sm"
                        className="btn-icon btn-link"
                    >
                        <i className="fa fa-search" />
                    </Button>
                )
            }));
            setData(formatted);
            toast.success("Se han obtenido los potenciales alumnos")
        } catch (error) {
            console.error("Error al cargar intentos de plan:", error);
            toast.success("Error al cargar potenciales alumnos")
        } finally {
            setLoading(false);
        }
    };

    const handleClick = async (clientId) => {
        try {
            const fullClient = await fetchClientById(clientId);
            setSelectedClient(fullClient);
            setModalOpen(true);
        } catch (error) {
            console.error("Error al abrir cliente:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (subscriptionConfirmed) {
            toast.success("Cliente suscrito con éxito.");
            setSubscriptionConfirmed(false);
        }
    }, [subscriptionConfirmed]);

    useEffect(() => {
        if (!modalOpen && shouldReload) {
          fetchData();
          setShouldReload(false);
        }
      }, [modalOpen, shouldReload]);

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
                isOpen={modalOpen}
                toggle={toggleModal}
                title={
                    selectedClient
                        ? `Suscripción: ${selectedClient.first_name} ${selectedClient.last_name}`
                        : ""
                }
                content={
                    <ClientDetail
                        mode="view"
                        client={selectedClient}
                        onUpdateClient={() => {
                            setSubscriptionConfirmed(true);
                            setShouldReload(true); // activamos bandera
                        }}
                        onClose={toggleModal}
                    />
                }
                showPrimaryAction={false}
            />

            <div className="content">
                <Row>
                    <Col md="12">
                        <Card>
                            <CardHeader>
                                <CardTitle tag="h4">Potenciales Alumnos Suscritos</CardTitle>
                            </CardHeader>
                            <CardBody>
                                <ReactTable
                                    data={data}
                                    columns={[
                                        { Header: "Nombre", accessor: "name" },
                                        { Header: "Correo", accessor: "email" },
                                        { Header: "Teléfono", accessor: "phone" },
                                        { Header: "Plan Seleccionado", accessor: "plan" },
                                        { Header: "Seleccionado en", accessor: "selected_at" },
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

export default IntentosDePlanes;
