
import Dashboard from "views/Dashboard.js";
import Login from "views/pages/Login.js";
import Register from "views/pages/Register.js";
import Clients from "views/pages/Clients/Clients";
import MisClases from "views/pages/Bookings/MisClases";
import ResumenIngresos from "views/pages/Payments/ResumenIngresos";
import IntentosDePlanes from "views/pages/Clients/IntencionDePlanes";
import ClasePorDia from "views/pages/Bookings/ClasePorDia";
import CargaMasivaDesdeExcel from "views/pages/Clients/CargaMasivaDesdeExcel";
import ClientesEnRiesgo from "views/pages/Clients/ClientesEnRiesgo";
import ControlClientes from "views/pages/Clients/ControlClientes";
import Promotions from "views/pages/Clients/Promotions";
import PromotionsPanel from "views/pages/Clients/ComprasPromociones";
import PaymentsRegister from "views/pages/Payments/RegistroPagos";
import CierresSemanales from "views/pages/Payments/CierresSemanales";
import AllSchedulesByDay from "views/pages/Bookings/Horarios";
const routes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-bank",
    component: <Dashboard />,
    layout: "/admin",
    roles: ["admin"], // solo admin
  },
  {
    collapse: true,
    name: "Alumnos",
    icon: "nc-icon nc-single-02",
    state: "alumnosCollapse",
    roles: ["admin", "secretaria"],
    views: [
      // {
      //   path: "/migracion",
      //   name: "Migración de datos",
      //   mini: "MG",
      //   component: <CargaMasivaDesdeExcel />,
      //   layout: "/admin",
      //   roles: ["admin", "secretaria"],
      // },
      {
        path: "/control-alumnos",
        name: "Control de Alumnos",
        mini: "CA",
        component: <ControlClientes />,
        layout: "/admin",
        roles: ["admin", "secretaria"],
      },
      {
        path: "/alumnos",
        name: "Lista de Alumnos",
        mini: "A",
        component: <Clients />,
        layout: "/admin",
        roles: ["admin", "secretaria"],
      },
      // {
      //   path: "/riesgo",
      //   name: "Alumnos en Riesgo",
      //   mini: "AR",
      //   component: <ClientesEnRiesgo />,
      //   layout: "/admin",
      //   roles: ["admin", "secretaria"],
      // },
      // {
      //   path: "/prospectos",
      //   name: "Potenciales Suscripciones",
      //   mini: "PC",
      //   component: <IntentosDePlanes />,
      //   layout: "/admin",
      //   roles: ["admin", "secretaria"],
      // },
    ],
  },
  {
    collapse: true,
    name: "Promociones",
    icon: "nc-icon nc-tie-bow",
    state: "promosCollapse",
    roles: ["admin", "secretaria"],
    views: [
      {
        path: "/promociones",
        name: "Promociones",
        mini: "PR",
        component: <Promotions />,
        layout: "/admin",
        roles: ["admin", "secretaria"],
      },
      {
        path: "/clientes-promos",
        name: "Compras de Promociones",
        mini: "CPR",
        component: <PromotionsPanel />,
        layout: "/admin",
        roles: ["admin", "secretaria"],
      },
    ],
  },
  {
    collapse: true,
    name: "Clases",
    icon: "nc-icon nc-calendar-60",
    state: "clasesCollapse",
    roles: ["admin", "secretaria", "coach"], // todos ven clases
    views: [
      {
        path: "/horarios",
        name: "Horarios",
        mini: "H",
        component: <AllSchedulesByDay />,
        layout: "/admin",
        roles: ["admin"],
      },
      {
        path: "/clases/mis-clases",
        name: "Mis Clases del Día",
        mini: "MC",
        component: <MisClases />,
        layout: "/admin",
        roles: ["admin", "secretaria", "coach"],
      },
      {
        path: "/disponibilidad",
        name: "Clases Por Dia",
        mini: "CD",
        component: <ClasePorDia />,
        layout: "/admin",
        roles: ["admin", "secretaria", "coach"],
      },
    ],
  },
  {
    collapse: true,
    name: "Pagos e Ingresos",
    icon: "nc-icon nc-money-coins",
    state: "pagosCollapse",
    roles: ["admin", "secretaria"], // solo admin
    views: [
      {
        path: "/cierres-semanales",
        name: "Cierres Semanales",
        mini: "CS",
        component: <CierresSemanales />,
        layout: "/admin",
        roles: ["admin"],
      },
      {
        path: "/historico-ingresos",
        name: "Resumen de Ingresos",
        mini: "HA",
        component: <ResumenIngresos />,
        layout: "/admin",
        roles: ["admin"],
      },
      {
        path: "/registrar-pagos",
        name: "Registrar Pagos",
        mini: "RP",
        component: <PaymentsRegister />,
        layout: "/admin",
        roles: ["admin", "secretaria"],
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: <Login />,
    layout: "/auth",
    invisible: true,
  },
  {
    path: "/register",
    name: "Register",
    component: <Register />,
    layout: "/auth",
    invisible: true,
  },
];

export default routes;
