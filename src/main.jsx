import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App.jsx";                   // The assessment
import AdminDashboard from "./AdminDashboard.jsx"; // Admin page

import "./index.css"; // Tailwind or global styling if you use it

// ---------- MAIN ROUTER ---------- //

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

        {/* Main Assessment */}
        <Route path="/" element={<App />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Fallback for unknown paths */}
        <Route
          path="*"
          element={
            <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
              <h1>404 – Page Not Found</h1>
              <p>
                The page you’re looking for doesn’t exist.  
                <a href="/" style={{ color: "#0077cc" }}>Return to Assessment</a>
              </p>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
