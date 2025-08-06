import { StrictMode } from "react";
import { RouterProvider } from "react-router";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppProviders } from "./providers";
import { router } from "./routing";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>
);
