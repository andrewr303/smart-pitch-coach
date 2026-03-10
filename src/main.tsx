import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const VITE_PRELOAD_RELOAD_KEY = "vite-preload-reloaded";

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();

  if (sessionStorage.getItem(VITE_PRELOAD_RELOAD_KEY) === "true") {
    sessionStorage.removeItem(VITE_PRELOAD_RELOAD_KEY);
    return;
  }

  sessionStorage.setItem(VITE_PRELOAD_RELOAD_KEY, "true");
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(<App />);
