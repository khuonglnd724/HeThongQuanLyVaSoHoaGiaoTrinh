import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";   // ⬅️ QUAN TRỌNG
import "./App.css";     // ⬅️ QUAN TRỌNG

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
