import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/guards/AuthGuard";
import { AppShell } from "@/shell/AppShell";

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    {/*
      Provider hierarchy:
        AuthProvider  — initialises the auth service for the build target
          AuthGuard   — on web: blocks until signed in; on Tauri: passthrough
            AppShell  — full editor shell (editor, sidebar, preview, statusbar)
    */}
    <AuthProvider>
      <AuthGuard>
        <AppShell />
      </AuthGuard>
    </AuthProvider>
  </React.StrictMode>,
);
