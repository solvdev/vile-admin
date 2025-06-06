import React from "react";
import { useEffect, useState } from "react";
import { Row, Col, Card, CardBody, Modal, ModalBody, ModalHeader, Button } from "reactstrap";
import DashboardStats from "./pages/Dashboard/DashboardStats";
import MostUsedMembershipsChart from "./pages/Dashboard/MostUsedMembershipsChart";
import AttendanceChart from "./pages/Dashboard/AttendanceChart";
import { useAuth } from "context/AuthContext";
import { Spinner } from "reactstrap";
import logo from "assets/img/vile1.png"; // Asegúrate de que la ruta sea correcta

function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    if (user?.groups?.includes("admin")) {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const lastShown = localStorage.getItem("lastWelcomeDate");
      const lastUpdate = localStorage.getItem("lastUpdateDate");

      if (lastShown !== today) {
        setShowWelcomeModal(true);
        localStorage.setItem("lastWelcomeDate", today);
      }

      if (lastUpdate !== today) {
        setShowUpdateModal(true);
        localStorage.setItem("lastUpdateDate", today);
      }
    }
  }, [user]);

  if (!isAuthenticated) return <p>Inicia sesión para continuar.</p>;
  if (!user) return <Spinner color="primary" />;

  const isAdmin = user?.groups?.includes("admin");

  return (
    <div className="content">
      {/* Modal de bienvenida para admins */}
      <Modal isOpen={showWelcomeModal} toggle={() => setShowWelcomeModal(false)} centered>
        <ModalHeader toggle={() => setShowWelcomeModal(false)}>
          ¡Hola, {user.first_name || user.username}!
        </ModalHeader>
        <ModalBody className="text-center">
          <img src={logo} alt="Vilé Pilates" style={{ width: "120px", marginBottom: "1rem" }} />
          <p>
            Gracias por liderar con energía, compromiso y amor cada día ✨.
          </p>
          <p className="text-muted">
            Tu dedicación hace posible este espacio de transformación y bienestar.
          </p>
          <Button style={{ backgroundColor: "#dfe5bf", color: "black", borderColor: "#dfe5bf" }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = "#dfe5bf"; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = "#dfe5bf"; }} onClick={() => setShowWelcomeModal(false)}>
            Comenzar el día
          </Button>
        </ModalBody>
      </Modal>

      {/* <Modal isOpen={showUpdateModal} toggle={() => setShowUpdateModal(false)} centered>
        <ModalHeader toggle={() => setShowUpdateModal(false)}>
          <i className="fa fa-exclamation-triangle text-warning me-2" aria-hidden="true" />
          ¡Aviso de actualización!
        </ModalHeader>
        <ModalBody className="text-center">
          <img src={logo} alt="Vilé Pilates" style={{ width: "120px", marginBottom: "1rem" }} />
          <p>
            Hemos realizado una actualización importante en el sistema para mejorar tu experiencia.
          </p>
          <hr />

          <p className="text-start" style={{ fontWeight: 'bold' }}>🆕 Novedades en esta versión:</p>
          <ul className="text-start" style={{ paddingLeft: "1.5rem", fontSize: "0.95rem" }}>
            <li>Nuevo módulo de <strong>cierres semanales</strong> para llevar el control diario y total por semana. - Pagos e Ingresos</li>
            <li>Resumen mensual al final del mes con ingresos detallados. - Pagos e Ingresos</li>
            <li>Modulo de registro de pagos y ventas nuevo y optimizado - Pagos e Ingresos</li>
            <li>Mejora en dashboard para visualizacion de datos</li>
          </ul>

          <Button
            style={{ backgroundColor: "#dfe5bf", color: "black", borderColor: "#dfe5bf" }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = "#dfe5bf"; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = "#dfe5bf"; }}
            onClick={() => setShowUpdateModal(false)}
          >
            Continuar
          </Button>
        </ModalBody>
      </Modal> */}


      {/* Contenido del dashboard */}
      {isAdmin ? (
        <>
          <DashboardStats />
          <Row className="mt-4">
            <Col lg="4" md="6" sm="12">
              <MostUsedMembershipsChart />
            </Col>
            <Col lg="4" md="12" sm="12">
              <AttendanceChart />
            </Col>
          </Row>
        </>
      ) : (
        <Row className="justify-content-center mt-5">
          <Col lg="6" md="8" sm="12">
            <Card className="text-center shadow p-4">
              <CardBody>
                <img src={logo} alt="Vilé Pilates" style={{ width: "180px" }} />
                <h4 className="mb-3">¡Hola, {user.first_name || user.username}!</h4>
                <p className="card-text">
                  Bienvenida a un nuevo día en Vilé ✨. Cada momento que brindas con dedicación construye una experiencia única para nuestros alumnos.
                </p>
                <p className="card-text text-muted">
                  Respira profundo, conéctate contigo misma y sigue moviéndote. Estamos felices de acompañarte en este camino 🌿
                </p>
                <p className="card-text text-muted">
                  Gracias por ser parte de este camino de bienestar y consciencia.
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
export default Dashboard;
