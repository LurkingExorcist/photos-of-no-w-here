import { createBrowserRouter } from "react-router-dom";
import { MainPage } from "./pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
  },
]);
