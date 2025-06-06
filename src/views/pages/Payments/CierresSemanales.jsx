// src/pages/Cierres/CierresSemanales.jsx
import React, { useEffect, useState } from "react";
import { Table, Card, CardBody, CardHeader, Row, Col } from "reactstrap";
import { getCierresSemanales } from "../Payments/service/paymentsService";
import ReactLoading from "react-loading";
import { overlayStyles, loaderContainerStyles } from "styles/commonStyles";

function formatCurrency(q) {
  return `Q${parseFloat(q).toLocaleString("es-GT", {
    minimumFractionDigits: 2,
  })}`;
}

const CierresSemanales = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumenMes, setResumenMes] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await getCierresSemanales();
        setData(response);

        // Calcular resumen mensual
        let resumen = {
          tarjeta: 0,
          efectivo: 0,
          visalink: 0,
          total: 0,
        };
        response.forEach((semana) => {
          semana.dias.forEach((dia) => {
            resumen.tarjeta += dia.tarjeta;
            resumen.efectivo += dia.efectivo;
            resumen.visalink += dia.visalink;
            resumen.total += dia.total;
          });
        });
        setResumenMes(resumen);
      } catch (err) {
        console.error("Error cargando cierres semanales:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
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
      <Row>
        <Col md="12">
          <h3 className="mb-4">Cierres Contables</h3>
          {data.map((semana, idx) => (
            <Card className="mb-4" key={idx}>
              <CardHeader>
                <strong>CIERRE SEMANA {idx + 1} - {semana.rango}</strong>
              </CardHeader>
              <CardBody>
                <Table responsive bordered hover>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Personas que asistieron</th>
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
                    {semana.dias.map((dia, i) => (
                      <tr key={i}>
                        <td>{new Date(dia.fecha).toLocaleDateString()}</td>
                        <td>{dia.asistencias}</td>
                        <td>{dia.pruebas}</td>
                        <td>{dia.paquetes_vendidos}</td>
                        <td>{dia.clases_individuales}</td>
                        <td>{formatCurrency(dia.tarjeta)}</td>
                        <td>{formatCurrency(dia.efectivo)}</td>
                        <td>{formatCurrency(dia.visalink)}</td>
                        <td>{formatCurrency(dia.total)}</td>
                        <td>{dia.porcentaje_compra}%</td>
                      </tr>
                    ))}
                    {/* Totales de la semana */}
                    <tr style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
                      <td>CIERRE SEMANA {idx + 1}</td>
                      <td>
                        {semana.dias.reduce((a, b) => a + b.asistencias, 0)}
                      </td>
                      <td>
                        {semana.dias.reduce((a, b) => a + b.pruebas, 0)}
                      </td>
                      <td>
                        {semana.dias.reduce((a, b) => a + b.paquetes_vendidos, 0)}
                      </td>
                      <td>
                        {semana.dias.reduce((a, b) => a + b.clases_individuales, 0)}
                      </td>
                      <td>
                        {formatCurrency(
                          semana.dias.reduce((a, b) => a + b.tarjeta, 0)
                        )}
                      </td>
                      <td>
                        {formatCurrency(
                          semana.dias.reduce((a, b) => a + b.efectivo, 0)
                        )}
                      </td>
                      <td>
                        {formatCurrency(
                          semana.dias.reduce((a, b) => a + b.visalink, 0)
                        )}
                      </td>
                      <td>{formatCurrency(semana.total_semana)}</td>
                      <td>-</td>
                    </tr>
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          ))}

          {/* Cierre del mes */}
          {resumenMes && (
            <Card>
              <CardHeader>
                <strong>✨ CIERRE MES</strong>
              </CardHeader>
              <CardBody>
                <p><strong>Tarjeta:</strong> {formatCurrency(resumenMes.tarjeta)}</p>
                <p><strong>Efectivo:</strong> {formatCurrency(resumenMes.efectivo)}</p>
                <p><strong>Visalink:</strong> {formatCurrency(resumenMes.visalink)}</p>
                <p><strong>Total Recaudado:</strong> {formatCurrency(resumenMes.total)}</p>
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default CierresSemanales;
