import React, { useState, useEffect } from "react";
import {
    Card, CardHeader, CardBody, Row, Col, Button, Table, Badge, Label, Modal, ModalHeader, ModalBody, ModalFooter
} from "reactstrap";
import DatePicker from "react-datepicker";
import { Calendar } from "react-feather";
import { getAvailabilityByDate, getBookingsByDate, updateAttendance } from "./service/bookingService";
import { fetchClientById, getBookingsByClient } from "../Clients/service/clientsService";
import RegistrarAsistenciaModal from "./modals/RegistrarAsistenciaModal";
import CancelarReservaModal from "./modals/CancelarReservaModal";
import { overlayStyles, loaderContainerStyles } from "styles/commonStyles";
import ReactLoading from "react-loading";
import "react-datepicker/dist/react-datepicker.css";
import "./app.css";
import dayjs from "dayjs";
import ClientDetail from "./Details/ClientDetail";

function ClasePorDia() {
    const [date, setDate] = useState(() => dayjs().startOf("day").toDate());
    const [slots, setSlots] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingClients, setLoadingClients] = useState(false); // nuevo estado
    const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
    const [historialCliente, setHistorialCliente] = useState([]);
    const [asistenciaModalOpen, setAsistenciaModalOpen] = useState(false);
    const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

    const storedUser = localStorage.getItem("user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const isAdmin = currentUser?.groups?.includes("admin");

    const asistenciaDisplay = {
        attended: { label: "Asistió", color: "success" },
        no_show: { label: "No asistió", color: "danger" },
        pending: { label: "Pendiente", color: "warning" }
    };

    const openAsistenciaModal = (booking) => {
        setReservaSeleccionada(booking);
        setAsistenciaModalOpen(true);
    };

    const handleConfirmarAsistencia = async (estado) => {
        try {
            setLoading(true);
            await updateAttendance(reservaSeleccionada.id, estado);
            window.toast?.success("Asistencia actualizada.");
            setAsistenciaModalOpen(false);
            fetchAll();
        } catch (err) {
            console.error("Error al actualizar asistencia", err);
            window.toast?.error("No se pudo actualizar la asistencia.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAll = async () => {
        setLoading(true);
        const formatted = date.toLocaleDateString('sv-SE');
        const disponibilidad = await getAvailabilityByDate(formatted);
        const reservas = await getBookingsByDate(formatted);
        setSlots(disponibilidad.slots);
        setBookings(reservas);
        setLoading(false);
    };

    const openDetalleModal = async (booking) => {
        if (!booking.client_id) return;

        try {
            setLoading(true);
            const fullClient = await fetchClientById(booking.client_id);
            const historial = await getBookingsByClient(booking.client_id);
            setAlumnoSeleccionado(fullClient);
            setHistorialCliente(historial);
            setModalDetalleOpen(true);
        } catch (err) {
            console.error("Error al obtener datos del cliente:", err);
            window.toast?.error("No se pudo cargar la información del alumno.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [date]);

    const openModal = (clase) => {
        setSelectedClass(clase);
        setLoadingClients(true);
        setModalOpen(true);
    };

    const openCancelModal = (booking) => {
        setSelectedBooking(booking);
        setCancelModalOpen(true);
    };

    const getAlumnos = (schedule_id) =>
        bookings.filter(b => b.schedule_id === schedule_id);

    return (
        <>
            {loading && (
                <div style={overlayStyles}>
                    <div style={loaderContainerStyles}>
                        <ReactLoading type="spin" color="white" height="40%" />
                    </div>
                </div>
            )}
            <div className="content">
                <Row className="mb-4 align-items-center">
                    <Col md="5">
                        <h4 className="mb-0">Agenda y asistencia por día</h4>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                            Selecciona una fecha y revisa quién está inscrito.
                        </p>
                    </Col>
                    <Col md="4">
                        <Label className="d-flex align-items-center">
                            <Calendar size={18} className="mr-2" />
                            <DatePicker
                                selected={date}
                                onChange={(d) => setDate(d)}
                                dateFormat="yyyy-MM-dd"
                                className="form-control ml-2"
                            />
                        </Label>
                    </Col>
                </Row>

                {slots.length === 0 ? (
                    <p className="text-muted">No hay clases programadas para esta fecha.</p>
                ) : (
                    slots.map((slot, idx) => {
                        const cupoLleno = slot.booked >= slot.capacity;
                        const hora = new Date(slot.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                        const alumnos = getAlumnos(slot.schedule_id);

                        return (
                            <Card key={idx} className="mb-4 shadow-sm">
                                <CardHeader className="bg-light">
                                    <Row>
                                        <Col md="6">
                                            <h5 className="mb-0">{slot.class_type || "Clase"}</h5>
                                            <small className="text-muted">Horario: {hora}</small>
                                        </Col>
                                        <Col md="6" className="text-right">
                                            <Badge color={cupoLleno ? "danger" : "success"}>
                                                {cupoLleno ? "Clase llena" : `Reservas: ${slot.booked}/${slot.capacity}`}
                                            </Badge>{" "}
                                            <span className="ml-3" style={{ fontSize: "0.8rem" }}>
                                                {slot.capacity - slot.booked} cupos disponibles
                                            </span>
                                            <span className="ml-3">Coach: {slot.coach}</span>
                                        </Col>
                                    </Row>
                                </CardHeader>
                                <CardBody>
                                    <Table hover responsive className="mb-3">
                                        <thead className="thead-light">
                                            <tr>
                                                <th>Alumno</th>
                                                <th>Membresia</th>
                                                <th>Asistencia</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {alumnos.length > 0 ? (
                                                alumnos.map((b) => (
                                                    <tr key={b.id}>
                                                        <td>
                                                            <span
                                                                style={{ cursor: "pointer", color: "#007bff", textDecoration: "underline" }}
                                                                onClick={() => openDetalleModal(b)}
                                                            >
                                                                {b.client}
                                                            </span>
                                                        </td>
                                                        <td>{b.membership === "-" ? "Sin Membresia Activa" : b.membership}</td>
                                                        <td>
                                                            <Badge color={asistenciaDisplay[b.attendance_status?.toLowerCase()?.trim()]?.color || "secondary"}>
                                                                {asistenciaDisplay[b.attendance_status?.toLowerCase()?.trim()]?.label || "Desconocido"}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <Button
                                                                color="danger"
                                                                size="sm"
                                                                onClick={() => openCancelModal(b)}
                                                                className="btn-cerrar"
                                                            >
                                                                Cancelar
                                                            </Button>
                                                            {isAdmin && (

                                                                <Button
                                                                    size="sm"
                                                                    style={{ marginLeft: "10px" }}
                                                                    onClick={() => openAsistenciaModal(b)}
                                                                    className="btn-importar"
                                                                >
                                                                    Editar asistencia
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="3" className="text-muted">No hay reservas aún.</td></tr>
                                            )}
                                        </tbody>
                                    </Table>
                                    <Button
                                        color={cupoLleno ? "secondary" : "primary"}
                                        size="sm"
                                        onClick={() => openModal(slot)}
                                        disabled={cupoLleno}
                                        className="btn-anadir"
                                    >
                                        Añadir alumno
                                    </Button>
                                </CardBody>
                            </Card>
                        );
                    })
                )}

                {alumnoSeleccionado && (
                    <Modal isOpen={modalDetalleOpen} toggle={() => setModalDetalleOpen(false)} size="lg">
                        <ModalHeader toggle={() => setModalDetalleOpen(false)}>
                            Detalle del Alumno
                        </ModalHeader>
                        <ModalBody>
                            <ClientDetail client={alumnoSeleccionado} mode="view" classHistory={historialCliente} />
                        </ModalBody>
                    </Modal>
                )}

                <RegistrarAsistenciaModal
                    isOpen={modalOpen}
                    toggle={() => setModalOpen(!modalOpen)}
                    clase={selectedClass}
                    fecha={date}
                    bookings={bookings}
                    loadingClients={loadingClients} // nuevo prop
                    setLoadingClients={setLoadingClients} // nuevo setter
                    onRegisterSuccess={() => {
                        setModalOpen(false);
                        fetchAll();
                    }}
                />

                <CancelarReservaModal
                    isOpen={cancelModalOpen}
                    toggle={() => setCancelModalOpen(!cancelModalOpen)}
                    booking={selectedBooking}
                    onCancelSuccess={() => {
                        setCancelModalOpen(false);
                        fetchAll();
                    }}
                />
            </div>

            <Modal isOpen={asistenciaModalOpen} toggle={() => setAsistenciaModalOpen(false)}>
                <ModalHeader toggle={() => setAsistenciaModalOpen(false)}>
                    Marcar asistencia
                </ModalHeader>
                <ModalBody>
                    <p>¿Qué estado deseas asignar al alumno <strong>{reservaSeleccionada?.client}</strong>?</p>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="success"
                        onClick={() => handleConfirmarAsistencia("attended")}
                        className="btn-anadir"
                        style={{ marginRight: "1vh" }}
                    >
                        Asistió
                    </Button>
                    <Button
                        color="warning"
                        onClick={() => handleConfirmarAsistencia("pending")}
                        className="btn-no"
                        style={{ marginRight: "1vh" }}
                    >
                        Pendiente
                    </Button>
                    <Button
                        color="warning"
                        onClick={() => handleConfirmarAsistencia("no_show")}
                        className="btn-cerrar"
                        style={{ marginRight: "1vh" }}
                    >
                        No asistió
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
}

export default ClasePorDia;