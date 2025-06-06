import React, { useState, useEffect } from "react";
import {
    Modal, ModalHeader, ModalBody, ModalFooter,
    Form, FormGroup, Label, Input, Button
} from "reactstrap";
import Select from "react-select";
import { fetchAllClients } from "../../Clients/service/clientsService";
import { registerBooking } from "../service/bookingService";
import '../../Bookings/app.css';
import dayjs from "dayjs";
import ReactLoading from "react-loading";
import { overlayStyles, loaderContainerStyles } from "styles/commonStyles";
import toast, { Toaster } from "react-hot-toast";

function RegistrarAsistenciaModal({ isOpen, toggle, clase, fecha, onRegisterSuccess, bookings }) {
    const [clientsOptions, setClientsOptions] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [loading, setLoading] = useState(false);
    const [attendanceStatus, setAttendanceStatus] = useState("pending");

    useEffect(() => {
        if (isOpen) {
            loadClients();
            setAttendanceDefaultByDate(fecha);
        }
    }, [isOpen, fecha]);

    const setAttendanceDefaultByDate = (selectedDate) => {
        const hoyStr = dayjs().format("YYYY-MM-DD");
        const fechaStr = dayjs(selectedDate).format("YYYY-MM-DD");
        setAttendanceStatus(hoyStr === fechaStr ? "attended" : "pending");
    };

    const loadClients = async () => {
        try {
            setLoading(true);
            const data = await fetchAllClients();
            const options = data.map(client => ({
                value: client.id,
                label: `${client.first_name} ${client.last_name} (${client.email})`
            }));
            setClientsOptions(options);
            setLoading(false);
        } catch (error) {
            toast.error("Error al cargar clientes");
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedClient || !clase) {
            toast.error("Completa todos los campos");
            return;
        }

        const selectedDate = dayjs(fecha).format("YYYY-MM-DD");
        const existing = bookings.find(
            b => b.client_id === selectedClient.value &&
                b.class_date === selectedDate &&
                b.schedule_id === clase.schedule_id
        );

        const payload = {
            client_id: selectedClient.value,
            schedule_id: clase.schedule_id,
            class_date: selectedDate,
            attendance_status: attendanceStatus
        };

        try {
            setLoading(true);

            if (existing) {
                toast.error("El alumno ya tiene una reserva para esta clase.");
                setLoading(false);
                return;
            }

            await registerBooking(payload);
            toast.success("Alumno registrado exitosamente");
            toggle();
            onRegisterSuccess();

        } catch (error) {
            toast.error(error?.response?.data?.detail || "Error al registrar asistencia");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setSelectedClient(null);
            setAttendanceStatus("pending");
        }
    }, [isOpen]);

    return (

        <>
            {loading && (
                <div style={overlayStyles}>
                    <div style={loaderContainerStyles}>
                        <ReactLoading type="spin" color="white" height="40%" />
                    </div>
                </div>
            )}
            <Toaster position="top-right" />
            <Modal isOpen={isOpen} toggle={toggle} centered>
                <ModalHeader toggle={toggle}>Registrar alumno en clase</ModalHeader>
                <ModalBody>
                    <Form>
                        <FormGroup>
                            <Label for="client">Seleccionar alumno</Label>
                            <Select
                                options={clientsOptions}
                                value={selectedClient}
                                onChange={setSelectedClient}
                                placeholder="Busca por nombre o correo..."
                                isDisabled={loading}
                                isClearable />
                        </FormGroup>
                        <FormGroup>
                            <Label>Fecha</Label>
                            <Input type="text" value={dayjs(fecha).format("DD/MM/YYYY")} disabled />
                        </FormGroup>
                        <FormGroup>
                            <Label>Hora</Label>
                            <Input type="text" value={dayjs(clase?.start).format("HH:mm")} disabled />
                        </FormGroup>
                        <FormGroup>
                            <Label>Estado de asistencia</Label>
                            <Input
                                type="select"
                                value={attendanceStatus}
                                onChange={(e) => setAttendanceStatus(e.target.value)}
                                disabled={loading}
                            >
                                <option value="attended">Asistió</option>
                                <option value="pending">Pendiente</option>
                            </Input>
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter className="justify-content-center">
                    <Button
                        className="btn-registrar"
                        onClick={handleSubmit}
                        disabled={loading || !selectedClient}
                    >
                        Registrar alumno
                    </Button>
                    <Button
                        className="btn-cerrar"
                        onClick={toggle}
                        disabled={loading}
                    >
                        Cerrar
                    </Button>
                </ModalFooter>
            </Modal></>
    );
}

export default RegistrarAsistenciaModal;
