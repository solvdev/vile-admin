import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, CardTitle } from "reactstrap";
import { Doughnut } from "react-chartjs-2";
import { fetchAllPayments } from "../Clients/service/paymentsService";
import LoadingSpinner from "../LoadingSpinner";

const MostUsedMembershipsChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchAllPayments().then((payments) => {
      const membershipCounts = {};
      payments.forEach((p) => {
        const name = p.membership.name;
        membershipCounts[name] = (membershipCounts[name] || 0) + 1;
      });

      const labels = Object.keys(membershipCounts);
      const data = Object.values(membershipCounts);

      setChartData({
        labels,
        datasets: [
          {
            data,
            backgroundColor: [
              "#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40",
            ],
          },
        ],
      });
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle tag="h4">Planes más vendidos</CardTitle>
        <p className="card-category">Top membresías por número de pagos</p>
      </CardHeader>
      <CardBody>
        {chartData ? <Doughnut data={chartData} /> : <LoadingSpinner text="Membresías más usadas" />}
      </CardBody>
      <CardFooter>
        <hr />
        <div className="stats">Basado en todos los pagos registrados</div>
      </CardFooter>
    </Card>
  );
};

export default MostUsedMembershipsChart;
