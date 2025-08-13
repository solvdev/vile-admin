    import React, { useState, useEffect } from 'react';
    import {
        Button, Card, CardHeader, CardBody, CardTitle,
        Row, Col, FormGroup, Label, Input, Nav, NavItem, NavLink, TabContent, TabPane
    } from 'reactstrap';
    import ReactTable from 'components/ReactTable/ReactTable.js';
    import ReactLoading from "react-loading";
    import classnames from 'classnames';
    import { overlayStyles, loaderContainerStyles } from "styles/commonStyles";
    import api from 'api/api';
    import { applyPenalty } from './service/paymentsService';
    import { fetchAllClients } from './service/clientsService';
    import { getBookingsByClient } from './service/clientsService';
    import toast, { Toaster } from "react-hot-toast";
    import Select from "react-select";
    import '../Clients/style.css'

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const normalize = (text) =>
        text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const ControlClientes = () => {
        const [activeTab, setActiveTab] = useState("1");

        const toggleTab = tab => {
            if (activeTab !== tab) setActiveTab(tab);
        };

        const [data, setData] = useState([]);
        const [year, setYear] = useState(new Date().getFullYear());
        const [month, setMonth] = useState(new Date().getMonth() + 1);
        const [loading, setLoading] = useState(false);
        const [clients, setClients] = useState([]);
        const [selectedClientId, setSelectedClientId] = useState(null);
        const [bookings, setBookings] = useState([]);

        const customFilterOption = (option, inputValue) => {
            return normalize(option.label).includes(normalize(inputValue));
        };

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/studio/clases-por-mes/?year=${year}&month=${month}`);
                const formatted = response.data.map(item => ({
                    alumno: item.client_name,
                    membership: item.membership,
                    expected_classes: item.expected_classes,
                    valid_classes: item.valid_classes,
                    no_show_classes: item.no_show_classes,
                    penalty: item.penalty,
                    client_id: item.client_id,
                    actions: item.penalty > 0 ? (
                        <Button
                            style={{ backgroundColor: "#e62525", color: "white", borderColor: "#e62525" }}
                            size="sm"
                            onClick={() => handlePenalty(item.client_id, item.penalty)}
                        >
                            Aplicar Penalización
                        </Button>
                    ) : '-'
                }));
                setData(formatted);
            } catch (err) {
                toast.error('Error al cargar clases');
            } finally {
                setLoading(false);
            }
        };

        const handlePenalty = async (clientId, amount) => {
            if (!window.confirm(`¿Deseas asignar una penalización de Q${amount}?`)) return;
            try {
                await applyPenalty({ client_id: clientId, amount });
                toast.success('Penalización aplicada correctamente.');
                fetchData();
            } catch (err) {
                toast.error('Error al aplicar penalización.');
            }
        };

        const loadClients = async () => {
            try {
                const clientData = await fetchAllClients();
                setClients(clientData);
            } catch (err) {
                toast.error("Error al cargar clientes");
            }
        };

        const loadBookings = async () => {
            if (!selectedClientId) return;
            setLoading(true);
            try {
                const clientBookings = await getBookingsByClient(selectedClientId);
                setBookings(clientBookings);
            } catch (err) {
                toast.error("Error al cargar reservas");
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            const init = async () => {
                setLoading(true);
                await Promise.all([loadClients(), fetchData()]);
                setLoading(false);
            };
            init();
        }, []);

        useEffect(() => {
            if (activeTab === "1") fetchData();
        }, [month, year, activeTab]);

        useEffect(() => {
            loadBookings();
        }, [selectedClientId]);

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

                <div className="content">
                    <Nav tabs className="custom-tabs">
                        <NavItem>
                            <NavLink
                                className={classnames("custom-tab", { active: activeTab === "1" })}
                                onClick={() => toggleTab("1")}
                            >
                                Control por Mes
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames("custom-tab", { active: activeTab === "2" })}
                                onClick={() => toggleTab("2")}
                            >
                                Historial por Cliente
                            </NavLink>
                        </NavItem>
                    </Nav>

                    <TabContent activeTab={activeTab}>
                        <TabPane tabId="1">
                            <h3 className="mt-4 mb-3">Control de Clases por Mes</h3>
                            <Row className="mb-3">
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Mes</Label>
                                        <Input type="select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                                            {monthNames.map((name, i) => (
                                                <option key={i} value={i + 1}>{name}</option>
                                            ))}
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Año</Label>
                                        <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
                                    </FormGroup>
                                </Col>
                                <Col md={3} className="d-flex align-items-end">
                                    <Button
                                        style={{ backgroundColor: "#7F6552", color: "white", borderColor: "#7F6552" }}
                                        onClick={fetchData}
                                    >
                                        Buscar
                                    </Button>
                                </Col>
                            </Row>
                            <Card>
                                <CardHeader>
                                    <CardTitle tag="h4">Clases ({monthNames[month - 1]} {year})</CardTitle>
                                </CardHeader>
                                <CardBody>
                                    <ReactTable
                                        data={data}
                                        columns={[
                                            { Header: 'Alumno', accessor: 'alumno' },
                                            { Header: 'Tipo de paquete', accessor: 'membership' },
                                            { Header: 'No. Clases', accessor: 'expected_classes' },
                                            { Header: 'Clases Tomadas', accessor: 'valid_classes' },
                                            { Header: 'Inasistencias', accessor: 'no_show_classes' },
                                            {
                                                Header: 'Penalización',
                                                accessor: 'penalty',
                                                Cell: ({ value }) => `Q${parseFloat(value).toFixed(2)}`
                                            },
                                            { Header: 'Acción', accessor: 'actions', sortable: false, filterable: false },
                                        ]}
                                        showPagination={false}
                                        className="-striped -highlight"
                                    />
                                </CardBody>
                            </Card>
                        </TabPane>

                        <TabPane tabId="2">
                            <h3 className="mt-4 mb-3">Historial de Reservas por Cliente</h3>
                            <Row>
                                <Col md={4}>
                                    <FormGroup>
                                        <Label>Selecciona un cliente</Label>
                                        <Select
                                            options={clients.map(c => ({
                                                value: c.id,
                                                label: `${c.first_name} ${c.last_name}`,
                                            }))}
                                            value={clients.find(c => c.id === parseInt(selectedClientId)) ? {
                                                value: parseInt(selectedClientId),
                                                label: `${clients.find(c => c.id === parseInt(selectedClientId)).first_name} ${clients.find(c => c.id === parseInt(selectedClientId)).last_name}`
                                            } : null}
                                            onChange={(selected) => setSelectedClientId(selected ? selected.value : "")}
                                            placeholder="Buscar alumno..."
                                            isClearable
                                            filterOption={customFilterOption}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            {selectedClientId && (
                                <Card>
                                    <CardBody>
                                        <ReactTable
                                            data={bookings.map(item => ({
                                                fecha: item.class_date,
                                                horario: item.schedule || "—",
                                                estado: item.attendance_status === 'attended' ? 'Asistió' :
                                                    item.attendance_status === 'no_show' ? 'Inasistencia' :
                                                        item.attendance_status === 'cancelled' ? 'Cancelada' : 'Pendiente',
                                            }))}
                                            columns={[
                                                { Header: "FECHA DE CLASE", accessor: "fecha" },
                                                { Header: "HORARIO", accessor: "horario" },
                                                {
                                                    Header: "ESTADO",
                                                    accessor: "estado",
                                                    Cell: ({ value }) => {
                                                        const iconMap = {
                                                            "Asistió": <i className="fa fa-check text-success" />,
                                                            "Inasistencia": <i className="fa fa-times text-danger" />,
                                                            "Cancelada": <i className="fa fa-ban text-warning" />,
                                                            "Pendiente": <i className="fa fa-clock text-secondary" />
                                                        };
                                                        return (
                                                            <span className="d-flex align-items-center gap-2">
                                                                {iconMap[value]} {value}
                                                            </span>
                                                        );
                                                    }
                                                }
                                            ]}
                                            className="-striped -highlight"
                                        />
                                    </CardBody>
                                </Card>
                            )}
                        </TabPane>
                    </TabContent>
                </div>
            </>
        );
    };

    export default ControlClientes;