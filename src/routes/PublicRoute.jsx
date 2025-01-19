import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ childrens }) => {
  if (localStorage.getItem("token")) {
    return <Navigate to="/playlists" />;
  }
  return childrens;
};

export default PublicRoute;
