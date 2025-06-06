import React, { useEffect, useState, useCallback } from "react";
import { Card, CardBody, CardFooter, CardTitle, Row, Col, Table, Button } from "reactstrap";
import { getMonthlyRevenue, getTotalRevenue, getTodayRevenue, recalculateAllRevenue } from "../Payments/service/paymentsService";
import { getClientsCount } from "../Clients/service/clientsService";
import { fetchAllBookings } from "../Bookings/service/bookingService";
import dayjs from "dayjs";

const DashboardStats = () => {
  const [monthlyRevenueTable, setMonthlyRevenueTable] = useState([]);
  const [totalRevenueAllTime, setTotalRevenueAllTime] = useState(0);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeClients: 0,
    todayBookings: 0,
    newClients: 0,
    todayRevenue: 0,
  });

  const fetchStats = useCallback(async () => {
    const [revenues, totalRevenue, clientCounts, bookings, todayRevenueData] = await Promise.all([
      getMonthlyRevenue(),
      getTotalRevenue(),
      getClientsCount(),
      fetchAllBookings(),
      getTodayRevenue(),
    ]);

    const currentMonth = dayjs().month();
    const currentYear = dayjs().year();
    const today = dayjs().format("YYYY-MM-DD");

    const monthlyRevenue = revenues.reduce((sum, r) => {
      return r.year === currentYear && r.month === currentMonth + 1
        ? sum + parseFloat(r.total_amount || 0)
        : sum;
    }, 0);

    const filtered = revenues.filter(
      r => r.year >= 2025 && r.month >= 1 && r.month <= 12
    ).sort((a, b) => (b.year - a.year) || (b.month - a.month));

    setMonthlyRevenueTable(filtered);
    setTotalRevenueAllTime(totalRevenue);
    setStats({
      totalRevenue: monthlyRevenue,
      activeClients: clientCounts.active,
      todayBookings: bookings.filter(b => b.class_date === today).length,
      newClients: clientCounts.new_this_month,
      todayRevenue: todayRevenueData.total || 0
    });
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      fetchStats();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleRecalculate = async () => {
    await recalculateAllRevenue();
    fetchStats();
  };

  return (
    <>
      <Row className="mb-3">
        <Col>
          <Button style={{ backgroundColor: "#7F6552", color: "white", borderColor: "#7F6552" }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = "#7F6552"; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = "#7F6552"; }} onClick={handleRecalculate}>
            Refrescar Datos
          </Button>
        </Col>
      </Row>
      <Row>
        <Col lg="3" md="6" sm="6">
          <Card className="card-stats">
            <CardBody>
              <div className="numbers text-center">
                <p className="card-category">Ingresos totales</p>
                <CardTitle tag="p">
                  Q {Number(totalRevenueAllTime) > 0 ? Number(totalRevenueAllTime).toFixed(2) : "0.00"}
                </CardTitle>
              </div>
            </CardBody>
            <CardFooter>
              <div className="stats">Histórico</div>
            </CardFooter>
          </Card>
        </Col>
        <Col lg="3" md="6" sm="6">
          <Card className="card-stats">
            <CardBody>
              <div className="numbers text-center">
                <p className="card-category">Clientes activos</p>
                <CardTitle tag="p">{stats.activeClients}</CardTitle>
              </div>
            </CardBody>
            <CardFooter>
              <div className="stats">Con membresía</div>
            </CardFooter>
          </Card>
        </Col>
        <Col lg="3" md="6" sm="6">
          <Card className="card-stats">
            <CardBody>
              <div className="numbers text-center">
                <p className="card-category">Reservas de hoy</p>
                <CardTitle tag="p">{stats.todayBookings}</CardTitle>
              </div>
            </CardBody>
            <CardFooter>
              <div className="stats">Reservas de hoy</div>
            </CardFooter>
          </Card>
        </Col>
        <Col lg="3" md="6" sm="6">
          <Card className="card-stats">
            <CardBody>
              <div className="numbers text-center">
                <p className="card-category">Nuevos este mes</p>
                <CardTitle tag="p">{stats.newClients}</CardTitle>
              </div>
            </CardBody>
            <CardFooter>
              <div className="stats">Clientes nuevos</div>
            </CardFooter>
          </Card>
        </Col>
        <Col lg="3" md="6" sm="6">
          <Card className="card-stats">
            <CardBody>
              <div className="numbers text-center">
                <p className="card-category">Ingresos del mes</p>
                <CardTitle tag="p">Q {isNaN(stats.totalRevenue) ? "0.00" : stats.totalRevenue.toFixed(2)}</CardTitle>
              </div>
            </CardBody>
            <CardFooter>
              <div className="stats">Actualizado</div>
            </CardFooter>
          </Card>
        </Col>
        <Col lg="3" md="6" sm="6">
          <Card className="card-stats">
            <CardBody>
              <div className="numbers text-center">
                <p className="card-category">Ingresos del día</p>
                <CardTitle tag="p">Q {isNaN(stats.todayRevenue) ? "0.00" : stats.todayRevenue.toFixed(2)}</CardTitle>
              </div>
            </CardBody>
            <CardFooter>
              <div className="stats">Actualizado</div>
            </CardFooter>
          </Card>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col lg="12">
          <Card>
            <CardBody>
              <h5 className="card-title">Ingresos por mes</h5>
              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Año</th>
                    <th>Mes</th>
                    <th># Pagos</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyRevenueTable.map((item, index) => (
                    <tr key={index}>
                      <td>{item.year}</td>
                      <td>{dayjs(`${item.year}-${item.month}-01`).format("MMMM")}</td>
                      <td>{item.payment_count}</td>
                      <td>Q {parseFloat(item.total_amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default DashboardStats;