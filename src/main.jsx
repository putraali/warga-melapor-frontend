import React from 'react';
import ReactDOM from 'react-dom/client';
// 1. IMPORT PROVIDER & STORE
import { Provider } from "react-redux";
// --- PERBAIKAN DI SINI (Tambahkan titik di depan) ---
import { store } from "./app/store"; 
// ----------------------------------------------------
import App from "./App";
// Import Bootstrap CSS
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css"; 
import axios from "axios";

axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);