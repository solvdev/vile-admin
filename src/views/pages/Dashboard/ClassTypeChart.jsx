import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, CardTitle } from "reactstrap";
import { Bar } from "react-chartjs-2";
import { getClassTypeSummary } from "../Bookings/service/bookingService";
import LoadingSpinner from "../LoadingSpinner";

const ClassTypeChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    getClassTypeSummary().then((data) => {
      const labels = data.map((d) => d.class_type);
      const values = data.map((d) => d.count);

      setChartData({
        labels,
        datasets: [
          {
            label: "Reservas por clase",
            data: values,
            backgroundColor: "#f96332",
          },
        ],
      });
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle tag="h4">Clases más reservadas</CardTitle>
      </CardHeader>
      <CardBody>
        {chartData ? <Bar data={chartData} /> : <LoadingSpinner text="Clases más reservadas" />}
      </CardBody>
      <CardFooter>
        <hr />
        <div className="stats">Total histórico</div>
      </CardFooter>
    </Card>
  );
};

export default ClassTypeChart;
