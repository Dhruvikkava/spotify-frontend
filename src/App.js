import "./App.css";
import "./styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import { routerList } from "./routes/routeList";
import { ToastContainer } from "react-toastify";
import Loader from "./components/Loader";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Header />
      <Loader />
      <Routes>
        <Route path="/" element={<Navigate to="/playlists" />} />
        {routerList?.map((el) => {
          return (
            <Route
              path={el.path}
              element={
                el?.isAuth ? (
                  <PrivateRoute childrens={el?.element}></PrivateRoute>
                ) : (
                  <PublicRoute childrens={el?.element}></PublicRoute>
                )
              }
            />
          );
        })}
      </Routes>
    </Router>
  );
}

export default App;
