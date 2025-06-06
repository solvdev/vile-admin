import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
  Table,
  Button,
} from "reactstrap";
import { useAuth } from "context/AuthContext";
import {
  getTodayBookingsForCoach,
  updateAttendance,
} from "./service/bookingService";
import DetailModal from "../Clients/modals/DetailModal";
import { fetchClientById } from "../Clients/service/clientsService";
import toast, { Toaster } from "react-hot-toast";
import { handleApiError } from "utils/ErrorHandler";
import { overlayStyles, loaderContainerStyles } from "styles/commonStyles";
import ReactLoading from "react-loading";
import ClientDetailCoach from "../Clients/Details/ClientDetailCoach";

function MisClases() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const toggleClientModal = () => setClientModalOpen(!clientModalOpen);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getTodayBookingsForCoach(user.id);
      // Ordenar alumnos con comentarios (condición médica) primero
      const updated = data.map((schedule) => {
        const bookingsWithPriority = [...schedule.bookings].sort((a, b) => {
          const aCond = !!a.client?.notes;
          const bCond = !!b.client?.notes;
          return bCond - aCond;
        });
        return { ...schedule, bookings: bookingsWithPriority };
      });
      setSchedules(updated);
    } catch (err) {
      handleApiError("Error al obtener clases del día");
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = async (bookingId, status) => {
    try {
      await updateAttendance(bookingId, status);
      toast.success("Asistencia actualizada");
      fetchBookings();
    } catch (error) {
      toast.error("Error al actualizar asistencia");
    }
  };

  const handleClick = async (id) => {
    try {
      const updatedClient = await fetchClientById(id);
      setSelectedClient(updatedClient);
      setClientModalOpen(true);
    } catch (error) {
      console.error("Error al obtener el cliente:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
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
      <DetailModal
        isOpen={clientModalOpen}
        toggle={toggleClientModal}
        title={
          selectedClient
            ? `Alumno: ${selectedClient.first_name} ${selectedClient.last_name}`
            : "Detalles del alumno"
        }
        content={
          <ClientDetailCoach
            client={selectedClient}
            onClose={() => setClientModalOpen(false)}
          />
        }
        showPrimaryAction={false}
      />
      <Row>
        <Col md="12">
          <Card>
            <CardHeader>
              <CardTitle tag="h4">
                Hola, {user.first_name} estas son tus clases del día de hoy!
              </CardTitle>
            </CardHeader>
            <CardBody>
              {schedules.length === 0 ? (
                <p>No tienes clases programadas hoy.</p>
              ) : (
                schedules.map((schedule, index) => {
                  const tieneAlumnos = schedule.bookings.length > 0;
                  const alumnosTexto = `${schedule.bookings.length} alumno${schedule.bookings.length !== 1 ? "s" : ""}`;
                  const cuposDisponibles = schedule.capacity - schedule.bookings.length;

                  return (
                    <Card key={index} className="mb-4">
                      <CardHeader
                        className={`text-white ${tieneAlumnos ? "bg-success" : "bg-secondary"}`}
                      >
                        <CardTitle tag="h5">
                          {schedule.time_slot} - {schedule.class_type?.name ?? "Sin tipo definido"}
                        </CardTitle>
                        <small>
                          {alumnosTexto} {schedule.is_individual ? "· Clase individual" : ""} · {cuposDisponibles} cupos disponibles
                        </small>
                      </CardHeader>
                      <CardBody>
                        {tieneAlumnos ? (
                          <Table bordered responsive hover>
                            <thead className="thead-light">
                              <tr>
                                <th>#</th>
                                <th>Alumno</th>
                                <th>Fecha</th>
                                <th>Estado</th>
                                <th>Acción</th>
                              </tr>
                            </thead>
                            <tbody>
                              {schedule.bookings.map((booking, idx) => {
                                const tieneCondicion = booking.client?.notes;

                                return (
                                  <tr key={booking.id} style={tieneCondicion ? { backgroundColor: "#fff3cd" } : {}}>
                                    <td>{idx + 1}</td>
                                    <td>
                                      {booking.client ? (
                                        <>
                                          {tieneCondicion && <span title="Condición médica" style={{ color: "#dc3545", marginRight: 5 }}>⚕️</span>}
                                          {`${booking.client.first_name ?? ""} ${booking.client.last_name ?? ""}`}
                                        </>
                                      ) : "Alumno desconocido"}
                                    </td>
                                    <td>
                                      {booking.class_date ? (() => {
                                        const [year, month, day] = booking.class_date.split("-");
                                        const localDate = new Date(year, month - 1, day);
                                        return localDate.toLocaleDateString("es-GT", {
                                          day: "numeric",
                                          month: "long",
                                          year: "numeric"
                                        });
                                      })() : "-"}
                                    </td>
                                    <td>
                                      {booking.attendance_status === "attended" && "Asistió"}
                                      {booking.attendance_status === "no_show" && "No asistió"}
                                      {booking.attendance_status === "pending" && "Pendiente"}
                                    </td>
                                    <td>
                                      <Button
                                        size="sm"
                                        style={{
                                          backgroundColor: booking.attendance_status === "attended" ? "green" : "white",
                                          color: booking.attendance_status === "attended" ? "white" : "green",
                                          borderColor: "green",
                                        }}
                                        onMouseEnter={(e) => {
                                          e.target.style.backgroundColor = "green";
                                          e.target.style.color = "white";
                                        }}
                                        onMouseLeave={(e) => {
                                          if (booking.attendance_status !== "attended") {
                                            e.target.style.backgroundColor = "white";
                                            e.target.style.color = "green";
                                          }
                                        }}
                                        onClick={() => handleAttendanceChange(booking.id, "attended")}
                                      >
                                        Asistió
                                      </Button>{" "}

                                      <Button
                                        size="sm"
                                        style={{
                                          backgroundColor: booking.attendance_status === "no_show" ? "red" : "white",
                                          color: booking.attendance_status === "no_show" ? "white" : "red",
                                          borderColor: "red",
                                        }}
                                        onMouseEnter={(e) => {
                                          e.target.style.backgroundColor = "red";
                                          e.target.style.color = "white";
                                        }}
                                        onMouseLeave={(e) => {
                                          if (booking.attendance_status !== "no_show") {
                                            e.target.style.backgroundColor = "white";
                                            e.target.style.color = "red";
                                          }
                                        }}
                                        onClick={() => handleAttendanceChange(booking.id, "no_show")}
                                      >
                                        No asistió
                                      </Button>

                                      <Button
                                        onClick={() => handleClick(booking.client.id)}
                                        color="info"
                                        size="sm"
                                        className="btn-icon btn-link"
                                      >
                                        <i className="fa fa-search" />
                                      </Button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </Table>
                        ) : (
                          <p className="text-muted">Sin alumnos inscritos para esta clase.</p>
                        )}
                      </CardBody>
                    </Card>
                  );
                })
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default MisClases;
