import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, CardTitle } from "reactstrap";
import { Bar } from "react-chartjs-2";
import { getAttendanceSummary } from "../Bookings/service/bookingService";
import LoadingSpinner from "../LoadingSpinner";

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const weekDaysES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const AttendanceChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    getAttendanceSummary().then((data) => {
      const values = weekDays.map((day) => data[day] || 0);
      setChartData({
        labels: weekDaysES,
        datasets: [
          {
            label: "Asistencias por día",
            data: values,
            backgroundColor: "#2CA8FF",
          },
        ],
      });
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle tag="h4">Asistencias esta semana</CardTitle>
      </CardHeader>
      <CardBody>
        {chartData ? <Bar data={chartData} /> : <LoadingSpinner text="Asistencia semanal" />}
      </CardBody>
      <CardFooter>
        <hr />
        <div className="stats">Solo asistencias confirmadas</div>
      </CardFooter>
    </Card>
  );
};

export default AttendanceChart;
