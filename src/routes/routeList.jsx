import Playlist from "../pages/Playlist";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Songs from "../pages/Songs";

export const routerList = [
  {
    path: "/playlists",
    element: <Playlist />,
    isAuth: true,
  },
  {
    path: "/songs",
    element: <Songs />,
    isAuth: true,
  },
  {
    path: "/login",
    element: <Login />,
    isAuth: false,
  },
  {
    path: "/register",
    element: <Register />,
    isAuth: false,
  },
];
