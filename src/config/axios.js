import axios from "axios";

const api = axios.create({
    // Mengambil URL Railway dari file .env
    baseURL: import.meta.env.VITE_API_URL, 
    withCredentials: true 
});

export default api;