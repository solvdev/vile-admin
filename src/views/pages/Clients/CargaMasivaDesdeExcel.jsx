// CargaMasivaDesdeExcel.jsx con Reactstrap
import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  Container,
  Button,
  Table,
  Spinner,
  Alert,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Label,
  Input,
  Row,
  Col
} from "reactstrap";
import { toast } from "react-hot-toast";
import { importBookingsExcel } from "views/pages/Clients/service/clientsService"; // cambio aquí
import '../Bookings/app.css';

const CargaMasivaDesdeExcel = () => {
  const [excelData, setExcelData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { defval: "" });

      const formattedData = data.map(row => {
        const formattedRow = { ...row };

        if (formattedRow.class_date instanceof Date) {
          formattedRow.class_date = formattedRow.class_date.toISOString().split("T")[0];
        } else if (!isNaN(formattedRow.class_date)) {
          const excelEpoch = new Date((formattedRow.class_date - 25569) * 86400 * 1000);
          formattedRow.class_date = excelEpoch.toISOString().split("T")[0];
        } else if (typeof formattedRow.class_date === 'string') {
          const parsedDate = new Date(formattedRow.class_date);
          if (!isNaN(parsedDate)) {
            formattedRow.class_date = parsedDate.toISOString().split("T")[0];
          }
        }

        if (!isNaN(formattedRow.time_slot)) {
          const totalSeconds = Math.round(formattedRow.time_slot * 86400);
          const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
          const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
          formattedRow.time_slot = `${hours}:${minutes}:00`;
        } else if (typeof formattedRow.time_slot === 'string' && formattedRow.time_slot.includes("T")) {
          formattedRow.time_slot = new Date(formattedRow.time_slot).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        }

        return formattedRow;
      });

      setExcelData(formattedData);
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (excelData.length === 0) return toast.error("No hay datos para importar");
    const formData = new FormData();
    const file = document.getElementById("fileInput").files[0];
    formData.append("file", file);

    try {
      setIsLoading(true);
      const response = await importBookingsExcel(formData);
      setResult(response);
      toast.success("Importación completada");
    } catch (err) {
      toast.error("Error al importar: " + err?.response?.data?.error);
    } finally {
      setIsLoading(false);
    }
  };

  const columnasInfo = [
    { col: "first_name", desc: "Nombre del cliente", required: true },
    { col: "last_name", desc: "Apellido del cliente", required: true },
    { col: "email", desc: "Correo electrónico del cliente (único)", required: true },
    { col: "phone", desc: "Número de teléfono", required: true },
    { col: "dpi", desc: "DPI del cliente", required: false },
    { col: "notes", desc: "Notas médicas o condiciones", required: false },
    { col: "source", desc: "Origen del cliente (Instagram, Recomendación, etc)", required: false },
    { col: "class_date", desc: "Fecha de la clase (YYYY-MM-DD)", required: true },
    { col: "time_slot", desc: "Hora exacta (formato 24h: HH:MM)", required: true },
    { col: "day", desc: "Día de la semana (Ej: MON, TUE, WED)", required: true },
    { col: "attendance_status", desc: "Asistencia (attended, pending, no_show)", required: false },
    { col: "membership", desc: "Nombre de la membresía adquirida", required: false },
    { col: "valid_until", desc: "Fin de membresía (YYYY-MM-DD)", required: false },
    { col: "payment_date", desc: "Fecha de pago (YYYY-MM-DD)", required: false },
    { col: "amount", desc: "Monto pagado por la membresía", required: false }
  ];

  const handleDownloadTemplate = () => {
    const headers = columnasInfo.map(c => c.col);
    const exampleRow = {
      first_name: "Juan",
      last_name: "Pérez",
      email: "juan@example.com",
      phone: "55555555",
      dpi: "1234567890101",
      notes: "Lesión en rodilla",
      source: "Instagram",
      class_date: "2025-04-20",
      time_slot: "16:00",
      day: "MON",
      attendance_status: "attended",
      membership: "2 clases por semana",
      valid_until: "2025-05-15",
      payment_date: "2025-04-14",
      amount: 600
    };
    const ws = XLSX.utils.json_to_sheet([exampleRow], { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, "plantilla_reservas_vile.xlsx");
  };

  return (
    <div className="content">
      <Container fluid className="py-4 px-3 d-flex flex-column min-vh-100 justify-content-start">
        <Row className="justify-content-center flex-grow-1">
          <Col xs="12" lg="11" xl="10">
            <Card className="shadow-sm">
              <CardHeader className="bg-white border-0 text-center">
                <h4 className="mb-0">Carga masiva de reservas desde Excel</h4>
              </CardHeader>
              <CardBody>
                <Button
                  color="primary"
                  outline
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="mb-4"
                >
                  Descargar plantilla de Excel
                </Button>

                <h5 className="mb-2">Guía de columnas:</h5>
                <div className="table-responsive">
                  <Table size="sm" bordered>
                    <thead className="thead-light">
                      <tr>
                        <th>Columna</th>
                        <th>Descripción</th>
                        <th>¿Requerida?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {columnasInfo.map((c, idx) => (
                        <tr key={idx}>
                          <td>{c.col}</td>
                          <td>{c.desc}</td>
                          <td>{c.required ? "Sí" : "No"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                <FormGroup className="mt-4">
                  <Label for="fileInput">Seleccionar archivo Excel (.xlsx)</Label>
                  <Input
                    type="file"
                    id="fileInput"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                  />
                </FormGroup>

                {excelData.length > 0 && (
                  <>
                    <h5 className="mt-4">Vista previa:</h5>
                    <div className="table-wrapper-scroll-y my-custom-scrollbar mb-3" style={{ maxHeight: "320px", overflowY: "auto" }}>
                      <div className="table-responsive">
                        <Table bordered size="sm" className="table-hover">
                          <thead className="thead-light">
                            <tr>
                              {Object.keys(excelData[0]).map((col) => (
                                <th key={col}>{col.toUpperCase()}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {excelData.slice(0, 10).map((row, i) => (
                              <tr key={i}>
                                {Object.values(row).map((val, j) => (
                                  <td key={j}>{val}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </div>
                    <div className="d-grid">
                      <Button className="btn-importar" onClick={handleImport} disabled={isLoading}>
                        Importar reservas
                      </Button>
                    </div>
                  </>
                )}

                {isLoading && <Spinner color="primary" className="mt-3" />}

                {result && (
                  <div className="mt-4">
                    <Alert color="success">{result.message}</Alert>
                    {result.errors?.length > 0 && (
                      <>
                        <h6>Errores:</h6>
                        <div className="table-responsive">
                          <Table size="sm" bordered>
                            <thead className="thead-light">
                              <tr>
                                <th>Fila</th>
                                <th>Error</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.errors.map((err, i) => (
                                <tr key={i}>
                                  <td>{err.row}</td>
                                  <td>{err.error}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CargaMasivaDesdeExcel;