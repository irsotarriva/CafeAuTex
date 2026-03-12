import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/guards/AuthGuard";

// TODO(phase-1): Replace with the full App component once the shell is scaffolded.
function App() {
  return (
    <div
      style={{
        fontFamily: "Lato, -apple-system, sans-serif",
        background: "#faf8f5",
        color: "#2c2520",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <h1 style={{ fontSize: "24px", fontWeight: 600, margin: 0 }}>Café AuTex</h1>
      <p style={{ color: "#8c8078", margin: 0, fontSize: "14px" }}>
        Editor scaffold coming in Phase 1
      </p>
    </div>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    {/*
      Provider hierarchy:
        AuthProvider  — initialises the auth service for the build target
          AuthGuard   — on web: blocks until signed in; on Tauri: passthrough
            App       — editor shell; add LLMProvider / FileProvider here in Phase 1
    */}
    <AuthProvider>
      <AuthGuard>
        <App />
      </AuthGuard>
    </AuthProvider>
  </React.StrictMode>,
);
