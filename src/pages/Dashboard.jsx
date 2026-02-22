import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../features/authSlice";

// Import Komponen Dashboard per Role
import DashboardAdmin from "./DashboardAdmin"; 
import DashboardWarga from "./DashboardWarga";
import DashboardPetugas from "./DashboardPetugas";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // 1. Ekstrak 'isLoading' bawaan dari Redux authSlice
  const { isError, user, isLoading } = useSelector((state) => state.auth);

  const [stats, setStats] = useState({
    warga: 0,
    penanggung_jawab: 0,
    admin: 0,
    total_laporan: 0,
    pending: 0,
    selesai: 0,
    proses: 0 
  });

  // 2. State lokal khusus untuk melacak proses pengambilan data statistik
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      navigate("/");
    }
  }, [isError, navigate]);

  useEffect(() => {
    const getStats = async () => {
        const token = localStorage.getItem('accessToken'); 

        if (token) {
            try {
                const response = await axios.get("https://warga-melapor-backend-production.up.railway.app/stats", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setStats(response.data);
            } catch (error) {
                console.log("Gagal ambil stats:", error);
            } finally {
                setIsStatsLoading(false); // Matikan loading stat setelah selesai/gagal
            }
        } else {
            setIsStatsLoading(false);
        }
    };

    if (user) {
        // Jika warga, tidak perlu fetch statistik global, langsung matikan loading
        if (user.role === 'warga') {
            setIsStatsLoading(false);
        } else {
            getStats();
        }
    }
  }, [user]);

  // 3. Kondisi Gabungan: Tampilkan loading jika Redux loading, Stats loading, atau User belum ter-load
  const isPageLoading = isLoading || isStatsLoading || (!user && !isError);

  return (
    <Layout>
      {/* --- OVERLAY LOADING ANIMASI LOGO --- */}
      {isPageLoading && (
        <div 
            className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center" 
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', zIndex: 9999, backdropFilter: 'blur(3px)' }}
        >
            <div className="position-relative d-flex justify-content-center align-items-center" style={{ width: '120px', height: '120px' }}>
                <img 
                    src="/Logolaporpak.png" 
                    alt="Memuat data..." 
                    className="position-absolute" 
                    style={{ width: '55px', height: 'auto', zIndex: 2 }} 
                />
                <div 
                    className="spinner-border text-primary position-absolute" 
                    style={{ width: '120px', height: '120px', borderWidth: '5px', zIndex: 1 }} 
                    role="status"
                >
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
            <h5 className="mt-4 fw-bold text-dark" style={{ letterSpacing: '0.5px' }}>
                Menyiapkan Dashboard...
            </h5>
        </div>
      )}

      {/* --- LOGIKA TAMPILAN DASHBOARD (Hanya render jika loading selesai) --- */}
      
      {!isPageLoading && user && user.role === "admin" && (
         <DashboardAdmin stats={stats} />
      )}

      {!isPageLoading && user && user.role === "warga" && (
         <DashboardWarga user={user} />
      )}

      {!isPageLoading && user && user.role === "penanggung_jawab" && (
         <DashboardPetugas user={user} stats={stats} />
      )}

    </Layout>
  );
};

export default Dashboard;