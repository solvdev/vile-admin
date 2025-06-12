import React, { useEffect, useState } from "react";
import { Table, Card, CardBody, CardHeader, Row, Col, Form, FormGroup, Label, Input } from "reactstrap";
import { getFullClosureSummary } from "../Payments/service/paymentService";
import ReactLoading from "react-loading";
import { overlayStyles, loaderContainerStyles } from "styles/commonStyles";

function formatCurrency(q) {
  return `Q${parseFloat(q).toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;
}

const monthNames = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

const CierresSemanales = () => {
  const [meses, setMeses] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState("all");
  const [loading, setLoading] = useState(false);
  const [fullSummary, setFullSummary] = useState(null);

  // Construir lista: 'all' + meses desde marzo hasta hoy
  useEffect(() => {
    const now = new Date();
    const lista = ["all"];
    const inicio = new Date(now.getFullYear(), 2, 1);
    while (inicio <= now) {
      const y = inicio.getFullYear();
      const m = inicio.getMonth() + 1;
      lista.push(`${y}-${String(m).padStart(2,'0')}`);
      inicio.setMonth(inicio.getMonth() + 1);
    }
    setMeses(lista);
    setMesSeleccionado("all");
  }, []);

  // Cargar resumen global o por mes
  useEffect(() => {
    setLoading(true);
    const promise = mesSeleccionado === "all"
      ? getFullClosureSummary()
      : getFullClosureSummary(mesSeleccionado);

    promise
      .then(data => {
        const { daily, weekly, summary } = data;
        const weeks = weekly.map(w => {
          const [startStr, endStr] = w.rango.split(' - ');
          const [sd, sm, sy] = startStr.split('/').map(Number);
          const [ed, em, ey] = endStr.split('/').map(Number);
          const startDate = new Date(sy, sm - 1, sd);
          const endDate = new Date(ey, em - 1, ed);

          const days = daily
            .filter(d => {
              const dt = new Date(d.fecha);
              return dt >= startDate && dt <= endDate;
            })
            .map(d => ({
              date: d.fecha,
              attendances: d.asistencias,
              trials: d.pruebas,
              packages: d.paquetes_vendidos,
              individual: d.clases_individuales,
              card: d.tarjeta,
              cash: d.efectivo,
              visalink: d.visalink,
              total: d.total,
              purchaseRate: d.asistencias > 0 
                ? ((d.paquetes_vendidos / d.asistencias) * 100).toFixed(2) 
                : '0.00',
            }));

          return {
            number: w.week,
            range: w.rango,
            days,
            summary: {
              attendances: w.asistencias,
              trials: w.pruebas,
              packages: w.paquetes_vendidos,
              individual: w.clases_individuales,
              card: w.tarjeta,
              cash: w.efectivo,
              visalink: w.visalink,
              total: w.total,
            }
          };
        });

        const monthly = {
          card: summary.tarjeta,
          cash: summary.efectivo,
          visalink: summary.visalink,
          total: summary.total,
        };
        setFullSummary({ weeks, monthly });
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [mesSeleccionado]);

  if (loading || !fullSummary) {
    return (
      <div style={overlayStyles}>
        <div style={loaderContainerStyles}>
          <ReactLoading type="spin" color="white" height="40%" />
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <Row className="mb-3">
        <Col md="4">
          <Form>
            <FormGroup>
              <Label for="mesFiltro" style={{ fontWeight: 'bold' }}>Mes:</Label>
              <Input
                type="select"
                id="mesFiltro"
                value={mesSeleccionado}
                onChange={e => setMesSeleccionado(e.target.value)}
              >
                <option value="all">Todos</option>
                {meses.filter(m => m !== 'all').map(m => {
                  const [y, mo] = m.split('-');
                  return (
                    <option key={m} value={m}>
                      {`${monthNames[parseInt(mo) - 1]} ${y}`}
                    </option>
                  );
                })}
              </Input>
            </FormGroup>
          </Form>
        </Col>
      </Row>

      {/* Mostrar siempre los detalles semanales */}
      {fullSummary.weeks.map((semana, idx) => (
        <Card className="mb-4" key={idx}>
          <CardHeader>
            <strong>CIERRE SEMANA {semana.number} - {semana.range}</strong>
          </CardHeader>
          <CardBody>
            <Table responsive bordered hover>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Asistencias</th>
                  <th>Prueba</th>
                  <th>Paquete activo</th>
                  <th>Clase individual</th>
                  <th>Tarjeta</th>
                  <th>Efectivo</th>
                  <th>Visalink</th>
                  <th>Total</th>
                  <th>% que compró</th>
                </tr>
              </thead>
              <tbody>
                {semana.days.map((dia, i) => (
                  <tr key={i}>
                    <td>{new Date(dia.date).toLocaleDateString()}</td>
                    <td>{dia.attendances}</td>
                    <td>{dia.trials}</td>
                    <td>{dia.packages}</td>
                    <td>{dia.individual}</td>
                    <td>{formatCurrency(dia.card)}</td>
                    <td>{formatCurrency(dia.cash)}</td>
                    <td>{formatCurrency(dia.visalink)}</td>
                    <td>{formatCurrency(dia.total)}</td>
                    <td>{dia.purchaseRate}%</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                  <td>CIERRE SEMANA {idx + 1}</td>
                  <td>{semana.summary.attendances}</td>
                  <td>{semana.summary.trials}</td>
                  <td>{semana.summary.packages}</td>
                  <td>{semana.summary.individual}</td>
                  <td>{formatCurrency(semana.summary.card)}</td>
                  <td>{formatCurrency(semana.summary.cash)}</td>
                  <td>{formatCurrency(semana.summary.visalink)}</td>
                  <td>{formatCurrency(semana.summary.total)}</td>
                  <td>-</td>
                </tr>
              </tbody>
            </Table>
          </CardBody>
        </Card>
      ))}

      {/* Mostrar cierre mensual o global */}
      <Card>
        <CardHeader><strong>✨ {mesSeleccionado === 'all' ? 'CIERRE GLOBAL' : 'CIERRE MES'}</strong></CardHeader>
        <CardBody>
          <p><strong>Tarjeta:</strong> {formatCurrency(fullSummary.monthly.card)}</p>
          <p><strong>Efectivo:</strong> {formatCurrency(fullSummary.monthly.cash)}</p>
          <p><strong>Visalink:</strong> {formatCurrency(fullSummary.monthly.visalink)}</p>
          <p><strong>Total Recaudado:</strong> {formatCurrency(fullSummary.monthly.total)}</p>
        </CardBody>
      </Card>
    </div>
  );
};

export default CierresSemanales;
