
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import AuthLayout from "layouts/Auth.js";
import AdminLayout from "layouts/Admin.js";
import { AuthProvider } from "context/AuthContext";

import "bootstrap/dist/css/bootstrap.css";
import "assets/scss/paper-dashboard.scss?v=1.3.1";
import "assets/demo/demo.css";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import PrivateRoute from "routes/PrivateRoute";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/auth/*" element={<AuthLayout />} />
        <Route 
        path="/admin/*" 
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
