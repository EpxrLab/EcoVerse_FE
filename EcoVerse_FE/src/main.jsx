import { createRoot } from "react-dom/client";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router";
import App from "./App.jsx";
createRoot(document.getElementById("root")).render(
  <>
    {/* <AppRouter />*/}
    <Toaster />
    <App />
  </>,
);
