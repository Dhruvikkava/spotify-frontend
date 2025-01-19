import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ childrens }) => {
  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" />;
  }
  return childrens;
};

export default PrivateRoute;
