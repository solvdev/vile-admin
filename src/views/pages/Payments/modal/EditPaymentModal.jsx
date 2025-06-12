import React, { useEffect, useState } from "react";
import {
    Modal, ModalHeader, ModalBody, ModalFooter,
    Button, Form, FormGroup, Label, Input
} from "reactstrap";
import { toast } from "react-hot-toast";
import { updatePayment } from "../service/paymentService";

const EditPaymentModal = ({ isOpen, toggle, payment, onUpdated }) => {
    const [form, setForm] = useState({});

    useEffect(() => {
        if (payment) {
            setForm({
                amount: payment.amount,
                date_paid: payment.date_paid?.slice(0, 10),
                valid_until: payment.valid_until,
                payment_method: payment.payment_method || '',
                membership_id: payment.membership?.id,
                client_id: payment.client_id,
            });
        }
    }, [payment]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (id) => {
        try {
            await updatePayment(payment.id, form);
            toast.success("Pago actualizado correctamente");
            onUpdated?.(); // recargar tabla si es necesario
            toggle();
        } catch (err) {
            console.error(err);
            toast.error("Error al actualizar pago");
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Editar Pago</ModalHeader>
            <ModalBody>
                <Form>
                    <FormGroup>
                        <Label>Monto (Q)</Label>
                        <Input type="number" name="amount" value={form.amount} onChange={handleChange} />
                    </FormGroup>
                    <FormGroup>
                        <Label>Fecha de Pago</Label>
                        <Input type="date" name="date_paid" value={form.date_paid} onChange={handleChange} />
                    </FormGroup>
                    <FormGroup>
                        <Label>Válido Hasta</Label>
                        <Input type="date" name="valid_until" value={form.valid_until} onChange={handleChange} />
                    </FormGroup>
                    <FormGroup>
                        <Label>Método de Pago</Label>
                        <Input
                            type="select"
                            name="payment_method"
                            value={form.payment_method}
                            onChange={handleChange}
                        >
                            <option value="">-- Selecciona método de pago --</option>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Tarjeta">Tarjeta</option>
                        </Input>
                    </FormGroup>
                </Form>
            </ModalBody>
            <ModalFooter>
                <Button style={{ backgroundColor: "#418c44", color: "white", borderColor: "#418c44" }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = "#418c44"; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = "#418c44"; }} onClick={handleSubmit}>Guardar</Button>
                <Button style={{ backgroundColor: "#7F6552", color: "white", borderColor: "#7F6552" }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = "#7F6552"; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = "#7F6552"; }} onClick={toggle}>Cancelar</Button>
            </ModalFooter>
        </Modal>
    );
};

export default EditPaymentModal;
