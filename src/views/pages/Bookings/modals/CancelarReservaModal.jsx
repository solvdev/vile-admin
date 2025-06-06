import React, { useState, useEffect } from "react";
import {
    Modal, ModalHeader, ModalBody, ModalFooter,
    Form, FormGroup, Label, Input, Button
} from "reactstrap";
import { Toaster, toast } from "react-hot-toast";
import { cancelBooking } from "../service/bookingService";
import '../../Bookings/app.css';

function CancelarReservaModal({ isOpen, toggle, booking, onCancelSuccess }) {
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState("");

    if (!booking) return null;

    const handleCancel = async () => {
        if (!reason.trim()) {
            toast.error("Debes ingresar una razón para cancelar.");
            return;
        }
        try {
            setLoading(true);
            await cancelBooking(booking.id, "admin", reason);
            toast.success("Reserva cancelada correctamente");
            onCancelSuccess();
        } catch (error) {
            toast.error("Error al cancelar la reserva");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Toaster position="top-right" />
            <Modal isOpen={isOpen} toggle={toggle} centered>
                <ModalHeader toggle={toggle}>Cancelar reserva</ModalHeader>
                <ModalBody>
                    <p><strong>Alumno:</strong> {booking.client || "Desconocido"}</p>
                    <p><strong>Clase:</strong> {booking.schedule || "-"}</p>
                    <p><strong>Fecha:</strong> {booking.class_date}</p>
                    <FormGroup>
                        <Label for="reason">Motivo de cancelación</Label>
                        <Input
                            id="reason"
                            type="textarea"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={loading}
                        />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button className="btn-registrar" onClick={handleCancel} disabled={loading}>
                        Confirmar cancelación
                    </Button>
                    <Button className="btn-cerrar" onClick={toggle} disabled={loading}>
                        Cerrar
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
}

export default CancelarReservaModal;