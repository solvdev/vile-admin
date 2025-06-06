// components/LoadingSpinner.jsx
import React from "react";
import { Spinner } from "reactstrap";

const LoadingSpinner = ({ text = "Cargando..." }) => (
  <div className="text-center my-4">
    <Spinner color="primary" />
    <p className="mt-2">{text}</p>
  </div>
);

export default LoadingSpinner;
