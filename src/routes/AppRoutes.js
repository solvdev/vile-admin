import { Routes, Route } from "react-router-dom";
import ProtectedRouteByRole from "./ProtectedRouteByRole";
import MisClases from "views/Clases/MisClases";
import Horarios from "views/Clases/Horarios";

// 👇 Dentro del componente principal de rutas (AppRoutes o donde lo tengas)
function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin/clases/mis-clases" element={
        <ProtectedRouteByRole allowedRoles={['Coach', 'Administrador']}>
          <MisClases />
        </ProtectedRouteByRole>
      } />

      <Route path="/admin/clases/horarios" element={
        <ProtectedRouteByRole allowedRoles={['Administrador']}>
          <Horarios />
        </ProtectedRouteByRole>
      } />

      {/* Aquí irán tus demás rutas */}
    </Routes>
  );
}

export default AppRoutes;
