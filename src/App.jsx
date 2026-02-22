import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./components/ForgotPassword";
// --- IMPORT HALAMAN USER ---
import UserList from "./pages/UserList"; 
import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser"; 
import EditProfile from "./pages/EditProfile";
// --- IMPORT HALAMAN REPORT ---
import Report from "./pages/Report";    
import AddReport from "./pages/AddReport"; 
import ReportAction from "./pages/ReportAction";
import ReportDetail from "./pages/ReportDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- ROUTE AUTH --- */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* --- ROUTE DASHBOARD --- */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* --- KELOLA USERS (KHUSUS ADMIN) --- */}
        <Route path="/users" element={<UserList />} />
        <Route path="/users/add" element={<AddUser />} />
        <Route path="/users/edit/:id" element={<EditUser />} />

        {/* --- KELOLA REPORTS --- */}
        {/* 1. Admin & PJ melihat semua laporan */}
        <Route path="/reports" element={<Report />} />      
        
        {/* 2. Warga melihat laporan sendiri (Sesuai link di Sidebar) */}
        <Route path="/reports/me" element={<Report />} />     
        
        {/* 3. Form Buat Laporan Baru */}
        <Route path="/reports/add" element={<AddReport />} /> 

        {/* 4. Tugas Proyek (PJ) - Diarahkan ke list report */}
        <Route path="/reports/tasks" element={<Report />} /> 

        {/* --- DETAIL & ACTION --- */}
        
        {/* Route Khusus Admin & Petugas (Bisa Update Status/Progress) */}
        {/* PENTING: Gunakan :uuid bukan :id agar match dengan useParams() */}
        <Route path="/reports/action/:uuid" element={<ReportAction />} />
        
        {/* Route Khusus Warga (Hanya Lihat Progress & Feedback) */}
        <Route path="/reports/detail/:uuid" element={<ReportDetail />} />
        
        {/* Route Profil (Bisa diakses semua user login) */}
        <Route path="/profile" element={<EditProfile />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;