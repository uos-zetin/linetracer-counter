import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div>
      <h1>Welcome to the React App</h1>
      <p>This is a simple React application.</p>
    </div>
  </StrictMode>,
);
