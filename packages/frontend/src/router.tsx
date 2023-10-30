import { Navigate, createBrowserRouter } from "react-router-dom";
import { MainPage } from "./pages";

const BASE_URL = "/photos-of-no-w-here/";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to={BASE_URL} />,
  },
  {
    path: BASE_URL,
    element: <MainPage />,
  },
]);
