import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

if (import.meta.env.PROD) {
  setBaseUrl("https://aarbty-api.onrender.com");
}

createRoot(document.getElementById("root")!).render(<App />);
