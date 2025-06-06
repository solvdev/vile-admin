import React, { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardBody,
    CardTitle,
    Row,
    Col,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    Button,
    Input,
    Form,
    FormGroup,
    Label
} from "reactstrap";
import classnames from "classnames";
import { getMonthlyRevenue, recalculateAllRevenue, recalculateMonthlyRevenue } from "./service/paymentsService";
import { Toaster, toast } from "react-hot-toast";
import ReactTable from "components/ReactTable/ReactTable";
import { overlayStyles, loaderContainerStyles } from "styles/commonStyles";
import ReactLoading from "react-loading";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function ResumenIngresos() {
    const [activeTab, setActiveTab] = useState("grafica");
    const [revenueData, setRevenueData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [year, setYear] = useState(2024);
    const [month, setMonth] = useState(4);

    const toggle = (tab) => {
        if (activeTab !== tab) setActiveTab(tab);
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            await recalculateAllRevenue();
            const data = await getMonthlyRevenue();
            const formatted = data
                .map((item) => ({
                    ...item,
                    label: `${monthNames[item.month - 1]} ${item.year}`,
                    month_name: monthNames[item.month - 1]
                }))
                .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
            setRevenueData(formatted);
        } catch (err) {
            console.error(err);
            toast.error("Error al cargar ingresos mensuales");
        } finally {
            setLoading(false);
        }
    };

    const handleSingleRecalculation = async () => {
        try {
            await recalculateMonthlyRevenue(year, month);
            toast.success("Mes recalculado correctamente");
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Error al recalcular el mes");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="content">
            {loading && (
                <div style={overlayStyles}>
                    <div style={loaderContainerStyles}>
                        <ReactLoading type="spin" color="white" height="40%" />
                    </div>
                </div>
            )}
            <Toaster position="top-right" />
            <Row>
                <Col md="12">
                    <Card>
                        <CardHeader>
                            <CardTitle tag="h4" className="mb-3">Resumen de Ingresos</CardTitle>
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
                                <Nav tabs className="mb-2">
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === "grafica" })}
                                            onClick={() => toggle("grafica")}
                                            style={{ cursor: "pointer" }}
                                        >
                                            Gráfica
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === "tabla" })}
                                            onClick={() => toggle("tabla")}
                                            style={{ cursor: "pointer" }}
                                        >
                                            Tabla
                                        </NavLink>
                                    </NavItem>
                                </Nav>
                                <Form inline className="d-flex flex-wrap gap-2 align-items-end">
                                    <FormGroup className="mb-0">
                                        <Label for="year" className="me-1">Año</Label>
                                        <Input type="number" id="year" value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ width: "90px" }} />
                                    </FormGroup>
                                    <FormGroup className="mb-0">
                                        <Label for="month" className="me-1">Mes</Label>
                                        <Input type="number" id="month" min={1} max={12} value={month} onChange={(e) => setMonth(Number(e.target.value))} style={{ width: "70px" }} />
                                    </FormGroup>
                                    <Button color="success" size="sm">
                                        Recalcular mes
                                    </Button>
                                    <Button color="success" size="sm">
                                        Recalcular todos
                                    </Button>
                                </Form>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <TabContent activeTab={activeTab}>
                                <TabPane tabId="grafica">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="label" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="total_amount" fill="#2ea337" name="Q Ingresos" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </TabPane>
                                <TabPane tabId="tabla">
                                    <ReactTable
                                        data={revenueData}
                                        columns={[
                                            { Header: "Año", accessor: "year" },
                                            { Header: "Mes", accessor: "month_name" },
                                            { Header: "Total Recaudado (Q)", accessor: "total_amount" },
                                            { Header: "# Pagos", accessor: "payment_count" },
                                        ]}
                                        className="-striped -highlight primary-pagination"
                                    />
                                </TabPane>
                            </TabContent>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default ResumenIngresos;
