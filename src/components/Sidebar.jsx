import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from "react-router-dom"; // TAMBAHKAN useLocation
import { useDispatch, useSelector } from "react-redux";
import { LogOut, reset } from "../features/authSlice";

const Sidebar = ({ isOpen, closeSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // EKSTRAK URL SAAT INI
  const { user } = useSelector((state) => state.auth);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = () => {
    setIsLoggingOut(true); 
    
    setTimeout(async () => {
        await dispatch(LogOut());
        dispatch(reset());
        navigate("/");
    }, 1500); 
  };

  let roleDisplay = "";
  if (user && user.role) roleDisplay = user.role.replace('_', ' ');

  // FUNGSI UNTUK MENU STANDAR
  const getNavLinkClass = ({ isActive }) => 
    `nav-link d-flex align-items-center gap-3 rounded mb-1 ${isActive ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`;

  // FUNGSI KHUSUS UNTUK MENU "RIWAYAT SAYA" (WARGA)
  const isWargaHistoryActive = () => {
    // Akan aktif jika URL persis '/reports/me' ATAU sedang membuka '/reports/detail/...'
    if (location.pathname === '/reports/me' || location.pathname.startsWith('/reports/detail/')) {
        return true;
    }
    return false;
  };

  // FUNGSI KHUSUS UNTUK MENU "DATA LAPORAN" / "TUGAS LAPANGAN" (ADMIN/PJ)
  const isStandardReportActive = () => {
      // Akan aktif jika URL persis '/reports' ATAU sedang membuka '/reports/action/...'
      if (location.pathname === '/reports' || location.pathname.startsWith('/reports/action/')) {
          return true;
      }
      return false;
  };

  return (
    <>
      {isOpen && (
        <div 
            className="d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
            style={{zIndex: 1040}}
            onClick={closeSidebar}
        ></div>
      )}

      <div className={`d-flex flex-column p-3 bg-white shadow h-100 sidebar-transition ${isOpen ? 'translate-0' : 'translate-negative'}`}
           style={{
               width: '260px',
               position: 'fixed',
               top: 0,
               left: 0, 
               zIndex: 1050,
               overflowY: 'auto'
           }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
            <div className="text-start ps-2">
                <img 
                    src="/Logolaporpakland.png" 
                    alt="Logo Lapor Pak" 
                    className="img-fluid mb-1" 
                    style={{ maxHeight: '50px', width: 'auto' }} 
                />
                {roleDisplay && (
                    <div className="mt-1">
                        <span className="badge bg-primary bg-opacity-10 text-primary" style={{fontSize:'0.7rem'}}>
                            {roleDisplay.toUpperCase()}
                        </span>
                    </div>
                )}
            </div>
            <button className="btn btn-sm btn-light d-md-none text-danger" onClick={closeSidebar}>
                <i className="bi bi-x-lg"></i>
            </button>
        </div>
        
        <hr className="text-muted mt-0" />
        
        <ul className="nav nav-pills flex-column mb-auto gap-1">
            <li className="nav-item">
                <NavLink to="/dashboard" className={getNavLinkClass} onClick={closeSidebar}>
                    <i className="bi bi-grid-fill"></i> <span className="fw-semibold">Dashboard</span>
                </NavLink>
            </li>

            {user?.role === "admin" && (
                <div className="mt-4">
                    <small className="text-secondary fw-bold px-3" style={{fontSize:'0.75rem'}}>ADMINISTRASI</small>
                    <li className="nav-item mt-2">
                        {/* UPDATE: Gunakan class statis berdasarkan fungsi pengecekan */}
                        <NavLink to="/reports" className={`nav-link d-flex align-items-center gap-3 rounded mb-1 ${isStandardReportActive() ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`} onClick={closeSidebar}>
                            <i className="bi bi-files"></i> <span className="fw-semibold">Data Laporan</span>
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/users" className={getNavLinkClass} onClick={closeSidebar}>
                            <i className="bi bi-people-fill"></i> <span className="fw-semibold">Kelola User</span>
                        </NavLink>
                    </li>
                </div>
            )}

            {user?.role === "warga" && (
                <div className="mt-4">
                    <small className="text-secondary fw-bold px-3" style={{fontSize:'0.75rem'}}>MENU WARGA</small>
                    
                   <li className="nav-item mt-2">
                        <NavLink to="/reports/add" className={getNavLinkClass} onClick={closeSidebar}>
                            <i className="bi bi-pencil-square me-2"></i> 
                            <span className="fw-semibold">Buat Laporan</span>
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        {/* UPDATE: Gunakan class statis berdasarkan fungsi pengecekan khusus warga */}
                        <NavLink to="/reports/me" className={`nav-link d-flex align-items-center gap-3 rounded mb-1 ${isWargaHistoryActive() ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`} onClick={closeSidebar}>
                            <i className="bi bi-journal-text me-2"></i> 
                            <span className="fw-semibold">Riwayat Saya</span>
                        </NavLink>
                    </li>
                </div>
            )}

            {user?.role === "penanggung_jawab" && (
                <div className="mt-4">
                    <small className="text-secondary fw-bold px-3" style={{fontSize:'0.75rem'}}>TUGAS</small>
                    <li className="nav-item mt-2">
                        {/* UPDATE: Gunakan class statis berdasarkan fungsi pengecekan */}
                        <NavLink to="/reports" className={`nav-link d-flex align-items-center gap-3 rounded mb-1 ${isStandardReportActive() ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`} onClick={closeSidebar}>
                            <i className="bi bi-hammer"></i> <span className="fw-semibold">Tugas Lapangan</span>
                        </NavLink>
                    </li>
                </div>
            )}

            <div className="mt-4">
                <small className="text-secondary fw-bold px-3" style={{fontSize:'0.75rem'}}>PENGATURAN</small>
                <li className="nav-item mt-2">
                    <NavLink to="/profile" className={getNavLinkClass} onClick={closeSidebar}>
                        <i className="bi bi-person-circle"></i> <span className="fw-semibold">Profil Saya</span>
                    </NavLink>
                </li>
            </div>

        </ul>

        <div className="mt-auto pt-4">
            <hr className="text-muted" />
            <button onClick={logout} className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-bold" disabled={isLoggingOut}>
                {isLoggingOut ? (
                    <span><span className="spinner-border spinner-border-sm me-2"></span>Keluar...</span>
                ) : (
                    <><i className="bi bi-box-arrow-left"></i> Keluar Aplikasi</>
                )}
            </button>
        </div>
      </div>

      {/* --- OVERLAY LOADING DENGAN BACKGROUND LEBIH PUTIH --- */}
      {isLoggingOut && (
        <div 
            className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center" 
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', zIndex: 9999, backdropFilter: 'blur(5px)' }}
        >
            <div className="position-relative d-flex justify-content-center align-items-center" style={{ width: '120px', height: '120px' }}>
                <img 
                    src="/Logolaporpak.png" 
                    alt="Meninggalkan aplikasi..." 
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
                Mengamankan sesi Anda...
            </h5>
        </div>
      )}
    </>
  );
};

export default Sidebar;