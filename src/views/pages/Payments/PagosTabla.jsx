// PagosTabla.jsx
import React, { useEffect, useState } from "react";
import {
    Card, CardHeader, CardBody, CardTitle,
    Button, Row, Col, Form, FormGroup, Label, Input
} from "reactstrap";
import { Toaster, toast } from "react-hot-toast";
import ReactTable from "components/ReactTable/ReactTable";
import { getPaymentsByMonth } from "./service/paymentService";
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
    const [isLoadedSuccess, setIsLoadedSuccess] = useState(false);
    const [error, setError] = useState(null);

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

    const fetchPagos = async (mes) => {
        if (!mes) return;
        try {
            setLoading(true);
            setError(null);
            const data = await getPaymentsByMonth(mes);
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

    const handleVer = (row) => {
        toast(`Pago #${row.id} — Q${row.amount}`, { icon: "💳" });
    };

    const handleEditar = (row) => {
        setSelectedPayment(row);
        setEditModalOpen(true);
    };

    const handleChangeMes = (value) => {
        setFiltroMes(value);
        if (value) {
            fetchPagos(value);
        } else {
            setPagos([]); // limpia la tabla si no hay filtro
        }
    };

    const columns = [
        { Header: "ID", accessor: "id" },
        {
            Header: "Cliente",
            accessor: (row) => `${row.client}`,
            id: "cliente"
        },
        { Header: "Plan", accessor: "membership.name" },
        { Header: "Monto (Q)", accessor: "amount" },
        { Header: "Metodo de Pago", accessor: "payment_method" },
        {
            Header: "Fecha de Pago",
            accessor: (row) => row.date_paid?.split("T")[0]
        },
        { Header: "Válido Hasta", accessor: "valid_until" },
        {
            Header: "Acciones",
            accessor: "actions",
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <Button color="info" size="sm" className="btn-icon btn-link" onClick={() => handleEditar(row.original)}><i className="fa fa-edit" /></Button>
                </>
            )
        }
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
                        <Row className="mb-3">
                            <Col md="6">
                                <Form inline>
                                    <FormGroup className="d-flex align-items-center">
                                        <Col>
                                            <Label for="mesFiltro" className="me-2" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Filtrar por mes:</Label>
                                            <Input
                                                type="select"
                                                id="mesFiltro"
                                                value={filtroMes}
                                                onChange={(e) => handleChangeMes(e.target.value)}
                                            >
                                                {mesesDisponibles.map(mes => (
                                                    <option key={mes} value={mes}>{formatMes(mes)}</option>
                                                ))}
                                            </Input>
                                        </Col>
                                    </FormGroup>
                                </Form>
                            </Col>
                        </Row>

                        {pagos.length > 0 ? (
                            <ReactTable
                                data={pagos}
                                columns={columns}
                                className="-striped -highlight primary-pagination"
                                loading={loading}
                            />
                        ) : !loading && filtroMes ? (
                            <div className="text-center text-muted p-4 border border-2 rounded">
                                <i className="nc-icon nc-money-coins" style={{ fontSize: '2rem' }}></i>
                                <p className="mt-2 mb-0">No hay pagos registrados para este mes.</p>
                            </div>
                        ) : null}
                    </CardBody>
                </Card>
                <EditPaymentModal
                    isOpen={editModalOpen}
                    toggle={() => setEditModalOpen(false)}
                    payment={selectedPayment}
                    onUpdated={() => fetchPagos(filtroMes)}
                />
            </div>
        </>
    );
}
