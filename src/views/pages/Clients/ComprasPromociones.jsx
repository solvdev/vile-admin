// PromotionsPanel.jsx
import React, { useEffect, useState } from 'react';
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
} from 'reactstrap';
import ReactTable from 'components/ReactTable/ReactTable.js';
import ReactLoading from 'react-loading';
import { Toaster } from 'react-hot-toast';
import { overlayStyles, loaderContainerStyles } from 'styles/commonStyles';
import {
    createPromotionInstance,
    fetchPromotionInstances,
    confirmPromotionPayment,
    deletePromotionInstance,
    updatePromotionInstance
} from './service/promotionsService';
import { fetchAllClients } from './service/clientsService';
import { fetchAllPromotions } from './service/promotionsService';
import Select from 'react-select';
import { format } from 'date-fns';

function PromotionsPanel() {
    const [instances, setInstances] = useState([]);
    const [clients, setClients] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [selectedInstance, setSelectedInstance] = useState(null);
    const [showInstanceModal, setShowInstanceModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ created_at: '', promotion: {}, client_ids: [] });

    const fetchData = async () => {
        try {
            const [clientData, promotionData, instanceData] = await Promise.all([
                fetchAllClients(),
                fetchAllPromotions(),
                fetchPromotionInstances()
            ]);
            setClients(clientData);
            setPromotions(promotionData);
            setInstances(instanceData);
        } catch (err) {
            console.error('Error fetching data', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenInstance = (instance) => {
        setSelectedInstance(instance);
        setFormData(instance);
        setShowInstanceModal(true);
        setEditMode(false);
    };

    const handleEditInstance = (instance) => {
        setSelectedInstance(instance);
        setFormData({
            promotion: instance.promotion || {},
            client_ids: instance.clients ? instance.clients.map(c => c.id) : [],
            created_at: instance.created_at || ''
        });
        setShowInstanceModal(true);
        setEditMode(true);
    };


    const handleDeleteInstance = async (id) => {
        try {
            await deletePromotionInstance(id);
            fetchData();
        } catch (err) {
            console.error('Error deleting promotion instance', err);
        }
    };

    const handleSaveInstance = async () => {
        try {
            await updatePromotionInstance(selectedInstance.id, formData);
            setShowInstanceModal(false);
            fetchData();
        } catch (err) {
            console.error('Error updating promotion instance', err);
        }
    };

    const handleNewInstance = () => {
        setSelectedInstance(null);
        setFormData({ created_at: '', promotion: {}, client_ids: [] });
        setEditMode(true);
        setShowInstanceModal(true);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleConfirmPayment = async (clientId) => {
        try {
            await confirmPromotionPayment(selectedInstance.id, clientId);
            fetchData();
        } catch (err) {
            console.error('Error confirming payment:', err);
        }
    };

    const handleConfirmAllPayments = async () => {
        if (!selectedInstance) return;
        for (const client of selectedInstance.clients) {
            try {
                await confirmPromotionPayment(selectedInstance.id, client.id);
            } catch (err) {
                console.error(`Error confirmando pago de ${client.first_name}`, err);
            }
        }
        fetchData();
    };

    const allConfirmed = (selectedInstance?.clients || []).every(c => c.payment_confirmed);

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

            <Modal isOpen={showInstanceModal} toggle={() => setShowInstanceModal(false)}>
                <ModalHeader toggle={() => setShowInstanceModal(false)}>
                    {editMode ? 'Nueva Asociación de Promoción' : `Detalle de la promoción #${selectedInstance?.id}`}
                </ModalHeader>
                <ModalBody>
                    {editMode ? (
                        <Form>
                            <FormGroup>
                                <Label>Promoción</Label>
                                <Select
                                    options={promotions.map(p => ({ value: p.id, label: p.name }))}
                                    onChange={(option) => setFormData({ ...formData, promotion: { id: option.value, name: option.label } })}
                                    placeholder="Selecciona una promoción"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Clientes</Label>
                                <Select
                                    isMulti
                                    options={clients.map(c => ({ value: c.id, label: `${c.first_name} ${c.last_name}` }))}
                                    onChange={(options) => setFormData({ ...formData, client_ids: options.map(o => o.value) })}
                                    placeholder="Selecciona clientes"
                                />
                            </FormGroup>
                            {formData.client_ids.length > 0 && (
                                <ul className="mt-2">
                                    {formData.client_ids.map(id => {
                                        const client = clients.find(c => c.id === id);
                                        return client ? <li key={id}>{client.first_name} {client.last_name}</li> : null;
                                    })}
                                </ul>
                            )}
                            <Button style={{ backgroundColor: "#157934", color: "white", borderColor: "#157934" }}
                                onMouseEnter={(e) => { e.target.style.backgroundColor = "#157934"; }}
                                onMouseLeave={(e) => { e.target.style.backgroundColor = "#157934"; }} onClick={async () => {
                                    try {
                                        await createPromotionInstance({
                                            promotion_id: formData.promotion.id,
                                            client_ids: formData.client_ids || [],
                                        });
                                        setShowInstanceModal(false);
                                        fetchData();
                                    } catch (err) {
                                        console.error('Error al crear nueva instancia:', err);
                                    }
                                }}>Crear Asociación</Button>
                        </Form>
                    ) : (
                        <>
                            <p><strong>#Promo:</strong> {selectedInstance?.id}</p>
                            <p><strong>Promoción:</strong> {selectedInstance?.promotion?.name}</p>
                            <p><strong>Clientes:</strong></p>
                            <ul>
                                {(selectedInstance?.clients || []).map((c) => (
                                    <li key={c.id}>{c.first_name} {c.last_name} - {c.email}</li>
                                ))}
                            </ul>
                            {!allConfirmed && selectedInstance?.clients?.length > 0 && (
                                <Button style={{ backgroundColor: "#157934", color: "white", borderColor: "#157934" }}
                                    onMouseEnter={(e) => { e.target.style.backgroundColor = "#157934"; }}
                                    onMouseLeave={(e) => { e.target.style.backgroundColor = "#157934"; }} onClick={handleConfirmAllPayments}>
                                    <i className="fa fa-check" /> Confirmar Todos los Pagos
                                </Button>
                            )}
                        </>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button onClick={() => setShowInstanceModal(false)}>Cerrar</Button>
                </ModalFooter>
            </Modal>

            <div className="content">
                <Row>
                    <Col md="12">
                        <Card>
                            <CardHeader className="d-flex justify-content-between align-items-center">
                                <CardTitle tag="h4">Historial de Adquisiciones de Promociones</CardTitle>
                                <Button style={{ backgroundColor: "#7F6552", color: "white", borderColor: "#7F6552" }}
                                    onMouseEnter={(e) => { e.target.style.backgroundColor = "#7F6552"; }}
                                    onMouseLeave={(e) => { e.target.style.backgroundColor = "#7F6552"; }} onClick={handleNewInstance}>
                                    <i className="fa fa-plus" /> Nueva Asociación
                                </Button>
                            </CardHeader>
                            <CardBody>
                                <ReactTable
                                    data={instances}
                                    columns={[
                                        { Header: '#Promo', accessor: 'id' },
                                        { Header: 'Promoción', accessor: 'promotion.name' },
                                        {
                                            Header: 'Clientes',
                                            accessor: 'clients_display',
                                            Cell: ({ row }) => row.original.clients.map(c => `${c.first_name} ${c.last_name}`).join(', ')
                                        },
                                        {
                                            Header: 'Fecha',
                                            accessor: 'created_at',
                                            Cell: ({ value }) => format(new Date(value), 'dd/MM/yyyy HH:mm')
                                        },
                                        {
                                            Header: 'Acciones',
                                            accessor: 'actions',
                                            Cell: ({ row }) => (
                                                <div className="d-flex gap-2">
                                                    <Button color="info" size="sm" className="btn-icon btn-link" onClick={() => handleOpenInstance(row.original)}>
                                                        <i className="fa fa-search" />
                                                    </Button>
                                                    <Button color="warning" size="sm" className="btn-icon btn-link" onClick={() => handleEditInstance(row.original)}>
                                                        <i className="fa fa-edit" />
                                                    </Button>
                                                    <Button color="danger" size="sm" className="btn-icon btn-link remove" onClick={() => handleDeleteInstance(row.original.id)}>
                                                        <i className="fa fa-power-off" />
                                                    </Button>
                                                </div>
                                            )
                                        },
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

export default PromotionsPanel;
