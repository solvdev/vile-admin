// PagosTabla.jsx
import React, { useEffect, useState } from "react";
import {
    Card, CardHeader, CardBody, CardTitle,
    Button, Row, Col, Form, FormGroup, Label, Input
} from "reactstrap";
import { Toaster, toast } from "react-hot-toast";
import ReactTable from "components/ReactTable/ReactTable";
import { getPaymentsByMonth, getPaymentsByDate } from "./service/paymentService";
import EditPaymentModal from "./modal/EditPaymentModal";

const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

import ReactLoading from "react-loading";
import { overlayStyles, loaderContainerStyles } from "styles/commonStyles";
import { useNotifications } from "hooks/useNotifications";

export default function PagosTabla() {
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [mesesDisponibles, setMesesDisponibles] = useState([]);
    const [filtroMes, setFiltroMes] = useState("");
    const [filtroDia, setFiltroDia] = useState("");
    const [modoFiltro, setModoFiltro] = useState("mes");
    const [isLoadedSuccess, setIsLoadedSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [mostrarAuditoria, setMostrarAuditoria] = useState(false);

    const fetchMeses = () => {
        const now = new Date();
        const meses = [];
        const inicio = new Date(now.getFullYear(), 2); // marzo fijo

        while (inicio <= now) {
            const year = inicio.getFullYear();
            const month = String(inicio.getMonth() + 1).padStart(2, '0');
            meses.unshift(`${year}-${month}`);
            inicio.setMonth(inicio.getMonth() + 1);
        }

        setMesesDisponibles(meses);
    };

    const fetchPagos = async (valor, modo = "mes") => {
        if (!valor) return;
        try {
            setLoading(true);
            setError(null);
            const data = modo === "mes"
                ? await getPaymentsByMonth(valor)
                : await getPaymentsByDate(valor);
            setPagos(data);
            setIsLoadedSuccess(true);
        } catch (err) {
            setError(err);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeses();
        const now = new Date();
        const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        setFiltroMes(defaultMonth);
        fetchPagos(defaultMonth);
    }, []);

    const handleEditar = (row) => {
        setSelectedPayment(row);
        setEditModalOpen(true);
    };

    const columns = [
        { Header: "ID", accessor: "id" },
        {
            Header: "Cliente",
            accessor: (row) => `${row.client}`,
            id: "cliente",
        },
        { Header: "Plan", accessor: "membership.name" },
        { Header: "Monto (Q)", accessor: "amount" },
        { Header: "Metodo de Pago", accessor: "payment_method" },
        {
            Header: "Fecha de Pago",
            accessor: (row) => row.date_paid?.split("T")[0] || "—",
            id: "date_paid",
        },
        {
            Header: "Válido Hasta",
            accessor: (row) => row.valid_until || "—",
            id: "valid_until",
        },
        ...(mostrarAuditoria
            ? [
                {
                    Header: "Creado por",
                    accessor: (row) => row.created_by || "admin",
                    id: "created_by",
                },
                {
                    Header: "Fecha de creación",
                    accessor: (row) =>
                        row.created_at?.split("T")[0] ||
                        row.date_paid?.split("T")[0] ||
                        "—",
                    id: "created_at",
                },
                {
                    Header: "Modificado por",
                    accessor: (row) => row.modified_by || "—",
                    id: "modified_by",
                },
                {
                    Header: "Fecha modif",
                    accessor: (row) =>
                        row.updated_at && row.updated_at !== row.created_at
                            ? row.updated_at.split("T")[0]
                            : "—",
                    id: "updated_at",
                },
            ]
            : []),
        {
            Header: "Acciones",
            accessor: "actions",
            disableSortBy: true,
            Cell: ({ row }) => (
                <Button
                    color="info"
                    size="sm"
                    className="btn-icon btn-link"
                    onClick={() => handleEditar(row.original)}
                >
                    <i className="fa fa-edit" />
                </Button>
            ),
        },
    ];

    const formatMes = (isoStr) => {
        const [year, month] = isoStr.split("-");
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    };

    useNotifications(isLoadedSuccess, error, {
        success: 'Pagos cargados exitosamente.',
        error: (e) => e.message || 'Error al cargar pagos.',
    });

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
                <Card>
                    <CardHeader>
                        <CardTitle tag="h4">Historial de Pagos</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <Row className="mb-4">
                            <Col md="6">
                                <Form>
                                    <FormGroup className="d-flex flex-column gap-2">
                                        <Label style={{ fontSize: '1rem', fontWeight: '600' }}>
                                            Filtro de búsqueda
                                        </Label>
                                        <div className="d-flex gap-2 align-items-center">
                                            <Input
                                                type="select"
                                                value={modoFiltro}
                                                onChange={(e) => {
                                                    setModoFiltro(e.target.value);
                                                    setPagos([]);
                                                }}
                                                style={{ maxWidth: "140px" }}
                                            >
                                                <option value="mes">Por mes</option>
                                                <option value="dia">Por día</option>
                                            </Input>

                                            {modoFiltro === "mes" ? (
                                                <Input
                                                    type="select"
                                                    value={filtroMes}
                                                    onChange={(e) => {
                                                        setFiltroMes(e.target.value);
                                                        fetchPagos(e.target.value, "mes");
                                                    }}
                                                    className="flex-grow-1"
                                                >
                                                    {mesesDisponibles.map(mes => (
                                                        <option key={mes} value={mes}>
                                                            {formatMes(mes)}
                                                        </option>
                                                    ))}
                                                </Input>
                                            ) : (
                                                <Input
                                                    type="date"
                                                    value={filtroDia}
                                                    onChange={(e) => {
                                                        setFiltroDia(e.target.value);
                                                        fetchPagos(e.target.value, "dia");
                                                    }}
                                                    className="flex-grow-1"
                                                />
                                            )}
                                        </div>
                                    </FormGroup>
                                </Form>
                            </Col>

                            <Button
                                color="info"
                                outline
                                size="sm"
                                onClick={() => setMostrarAuditoria(!mostrarAuditoria)}
                            >
                                {mostrarAuditoria ? "Ocultar detalles" : "Mostrar detalles"}
                            </Button>

                        </Row>

                        {pagos.length > 0 ? (
                            <>
                                <ReactTable
                                    data={pagos}
                                    columns={columns}
                                    className="-striped -highlight primary-pagination"
                                    loading={loading} /></>
                        ) : !loading && (filtroMes || filtroDia) ? (
                            <div className="text-center text-muted p-4 border border-2 rounded">
                                <i className="nc-icon nc-money-coins" style={{ fontSize: '2rem' }}></i>
                                <p className="mt-2 mb-0">
                                    No hay pagos registrados para este {modoFiltro === 'mes' ? 'mes' : 'día'}.
                                </p>
                            </div>
                        ) : null}
                    </CardBody>
                </Card>
                <EditPaymentModal
                    isOpen={editModalOpen}
                    toggle={() => setEditModalOpen(false)}
                    payment={selectedPayment}
                    onUpdated={() => fetchPagos(modoFiltro === "mes" ? filtroMes : filtroDia, modoFiltro)}
                />
            </div>
        </>
    );
}
