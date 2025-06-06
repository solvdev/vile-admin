import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import logo from "assets/img/vile1.png";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Col,
  Row,
  Alert,
} from "reactstrap";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    document.body.classList.add("login-page");
    return () => document.body.classList.remove("login-page");
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Usuario o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Container>
        <Row>
          <Col className="ml-auto mr-auto" lg="4" md="6">
            <Form onSubmit={handleSubmit} className="form">
              <Card className="card-login">
                <CardHeader style={{textAlign:"center"}}>
                  <img
                    src={logo}
                    alt="Vilé Logo"
                    style={{
                      width: "140px",
                      height: "auto",
                      marginBottom:"3vh",
                      
                    }}
                  />
                  <h3 className="header text-center">Iniciar Sesión</h3>
                </CardHeader>
                <CardBody>
                  <InputGroup className="mb-3">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="nc-icon nc-single-02" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="Usuario"
                      required
                    />
                  </InputGroup>

                  <InputGroup className="mb-3">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="nc-icon nc-key-25" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Contraseña"
                      autoComplete="off"
                      required
                    />
                  </InputGroup>

                  {error && <Alert color="danger">{error}</Alert>}
                </CardBody>
                <CardFooter>
                  <Button
                    block
                    className="btn-round mb-3"
                    color="success"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Ingresando..." : "Iniciar Sesión"}
                  </Button>
                </CardFooter>
              </Card>
            </Form>
          </Col>
        </Row>
      </Container>
      <div className="full-page-background" />
    </div>
  );
}

export default Login;
