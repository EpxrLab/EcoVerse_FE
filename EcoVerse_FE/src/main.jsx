import { createRoot } from "react-dom/client";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router";
import { AppRouter } from "./routes/index.jsx";
import App from "./App.jsx";
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    {/* <AppRouter />
    <Toaster /> */}
    <App />
  </BrowserRouter>
);
