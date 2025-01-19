import { LinearProgress } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";

const Loader = () => {
  const isLoading = useSelector((state) => state.loader.isLoading);
  if (!isLoading) return null;
  return <LinearProgress color="secondary" />;
};

export default Loader;
