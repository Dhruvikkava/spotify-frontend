import { configureStore } from "@reduxjs/toolkit";
import loaderReducer from "../slices/loaderSlice";
import userReducer from "../slices/userSlice";

const store = configureStore({
  reducer: {
    loader: loaderReducer,
    user: userReducer,
  },
});

export default store;
