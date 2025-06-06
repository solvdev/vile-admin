// Promotions.jsx
import React, { useEffect, useState } from "react";
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    CardTitle,
    Row,
    Col,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Form,
    FormGroup,
    Label,
    Input
} from "reactstrap";
import ReactLoading from "react-loading";
import { Toaster } from "react-hot-toast";
import { overlayStyles, loaderContainerStyles } from "styles/commonStyles";
import {
    fetchAllPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion
} from "./service/promotionsService";
import { useNotifications } from "hooks/useNotifications";
import { fetchAllMemberships } from "./service/membershipService";

function Promotions() {
    const [promotionsData, setPromotionsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isLoadedSuccess, setIsLoadedSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [promotionModalOpen, setPromotionModalOpen] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [modalMode, setModalMode] = useState("view");
    const [memberships, setMemberships] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        price: "",
        membership_id: ""
    });

    const toggleModal = () => setPromotionModalOpen(!promotionModalOpen);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchAllPromotions();
            setPromotionsData(response);
            setIsLoadedSuccess(true);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMembershipOptions = async () => {
        try {
            const data = await fetchAllMemberships();
            setMemberships(data);
        } catch (err) {
            console.error("Error cargando membresías", err);
        }
    };

    useEffect(() => {
        fetchData();
        fetchMembershipOptions();
    }, []);

    const handleView = (promo) => {
        setSelectedPromotion(promo);
        setModalMode("view");
        setFormData(promo);
        setPromotionModalOpen(true);
    };

    const handleEdit = (promo) => {
        setSelectedPromotion(promo);
        setModalMode("edit");
        setFormData({
            name: promo.name,
            description: promo.description,
            start_date: promo.start_date,
            end_date: promo.end_date,
            price: promo.price,
            membership_id: promo.membership.id,
        });
        setPromotionModalOpen(true);
    };

    const handleNew = () => {
        setSelectedPromotion(null);
        setModalMode("create");
        setFormData({ name: "", description: "", start_date: "", end_date: "", price: "", membership_id: "" });
        setPromotionModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await deletePromotion(id);
            fetchData();
        } catch (err) {
            console.error("Error al eliminar promoción:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === "create") {
                await createPromotion(formData);
            } else if (modalMode === "edit") {
                await updatePromotion(selectedPromotion.id, formData);
            }
            fetchData();
            setPromotionModalOpen(false);
        } catch (err) {
            console.error("Error al guardar promoción:", err);
        }
    };

    const notificationMessages = {
        success: "Promociones cargadas exitosamente.",
        error: (e) => e.message || "Error al cargar promociones.",
    };

    useNotifications(isLoadedSuccess, error, notificationMessages);

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

            <Modal isOpen={promotionModalOpen} toggle={toggleModal}>
                <ModalHeader toggle={toggleModal}>
                    {modalMode === "create"
                        ? "Crear Promoción"
                        : modalMode === "edit"
                            ? "Editar Promoción"
                            : "Detalles de Promoción"}
                </ModalHeader>
                <ModalBody>
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label>Nombre</Label>
                            <Input value={formData.name} disabled={modalMode === "view"} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </FormGroup>
                        <FormGroup>
                            <Label>Descripción</Label>
                            <Input value={formData.description} disabled={modalMode === "view"} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </FormGroup>
                        <FormGroup>
                            <Label>Inicio</Label>
                            <Input type="date" value={formData.start_date} disabled={modalMode === "view"} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                        </FormGroup>
                        <FormGroup>
                            <Label>Fin</Label>
                            <Input type="date" value={formData.end_date} disabled={modalMode === "view"} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                        </FormGroup>
                        <FormGroup>
                            <Label>Precio</Label>
                            <Input type="number" value={formData.price} disabled={modalMode === "view"} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                        </FormGroup>
                        <FormGroup>
                            <Label>Membresía</Label>
                            <Input type="select" value={formData.membership_id} disabled={modalMode === "view"} onChange={(e) => setFormData({ ...formData, membership_id: e.target.value })}>
                                <option value="">Seleccione una</option>
                                {memberships.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </Input>
                        </FormGroup>
                        {modalMode !== "view" && <Button color="primary">Guardar</Button>}
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggleModal}>Cerrar</Button>
                </ModalFooter>
            </Modal>

            <div className="content">
                <Row>
                    <Col md="12">
                        <Card>
                            <CardHeader>
                                <CardTitle tag="h4">Promociones</CardTitle>
                                <Button onClick={handleNew} style={{ backgroundColor: "#7F6552", color: "white" }}>
                                    <i className="fa fa-plus" /> Nueva Promoción
                                </Button>
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    {promotionsData.map((promo) => (
                                        <Col md="4" key={promo.id} className="mb-4">
                                            <Card>
                                                <CardBody>
                                                    <h5>{promo.name}</h5>
                                                    <p>{promo.description}</p>
                                                    <p><strong>Desde:</strong> {promo.start_date}</p>
                                                    <p><strong>Hasta:</strong> {promo.end_date}</p>
                                                    <p><strong>Precio:</strong> Q{promo.price}</p>
                                                    <p><strong>Plan:</strong> {promo.membership.name}</p>
                                                    <div className="d-flex gap-1">
                                                        <Button color="info" size="sm" className="btn-icon btn-link" onClick={() => handleView(promo)}><i className="fa fa-search" /></Button>
                                                        <Button color="warning" size="sm" className="btn-icon btn-link" onClick={() => handleEdit(promo)}><i className="fa fa-edit" /></Button>
                                                        <Button color="danger" size="sm" className="btn-icon btn-link remove" onClick={() => handleDelete(promo.id)}><i className="fa fa-power-off" /></Button>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    );
}

export default Promotions;
