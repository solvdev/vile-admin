import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, CardTitle } from "reactstrap";
import { Line } from "react-chartjs-2";
import { getMonthlyRevenue } from "../Payments/service/paymentsService";
import LoadingSpinner from "../LoadingSpinner";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

const RevenueChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchRevenue = async () => {
      const data = await getMonthlyRevenue();
      const currentYear = dayjs().year();
      const filtered = data
        .filter((item) => item.year === currentYear)
        .sort((a, b) => a.month - b.month)
        .slice(-6);

      const labels = filtered.map((item) =>
        dayjs(`${item.year}-${item.month}-01`).format("MMMM")
      );
      const values = filtered.map((item) => parseFloat(item.total));

      setChartData({
        labels,
        datasets: [
          {
            label: "Ingresos por mes",
            data: values,
            fill: false,
            borderColor: "#00c09d",
            tension: 0.4,
          },
        ],
      });
    };

    fetchRevenue();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle tag="h4">Ingresos últimos 6 meses</CardTitle>
        <p className="card-category">Membresías cobradas</p>
      </CardHeader>
      <CardBody>
        {chartData ? <Line data={chartData} /> : <LoadingSpinner text="Ingresos mensuales" />}
      </CardBody>
      <CardFooter>
        <hr />
        <div className="stats">Datos actualizados automáticamente</div>
      </CardFooter>
    </Card>
  );
};

export default RevenueChart;
