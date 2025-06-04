import { createRoot } from "react-dom/client";
import { Buffer } from "buffer";
import "./index.css";
import App from "./App.jsx";
import process from "process";
import { UserProvider } from "./context/userContextApi.jsx";

window.Buffer = Buffer;
window.process = process;
window.global = window;

createRoot(document.getElementById("root")).render(

    <UserProvider>
      <App />
    </UserProvider>

);
