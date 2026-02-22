import React from 'react';
import { useSelector } from "react-redux"; 

const Navbar = ({ toggleSidebar }) => { 
  const { user } = useSelector((state) => state.auth);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4 sticky-top">
      <div className="container-fluid">
        
        {/* Tombol Burger Mobile */}
        <button 
            className="btn btn-light border d-md-none me-3" 
            type="button" 
            onClick={toggleSidebar}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menu Kanan (Profil) */}
        <div className="ms-auto d-flex align-items-center">
            <div className="d-none d-md-block text-end me-3">
                <h6 className="mb-0 fw-bold text-dark small">
                    Halo, {user?.name}
                </h6>
                <small className="text-muted text-uppercase" style={{fontSize: '0.65rem', letterSpacing: '1px'}}>
                    {user?.role ? user.role.replace('_', ' ') : ''}
                </small>
            </div>

            {/* --- LOGIKA MENAMPILKAN FOTO DARI DATABASE --- */}
            {user?.url ? (
                <img 
                    src={user.url} 
                    alt="profile" 
                    className="rounded-circle border border-2 border-light shadow-sm"
                    style={{ 
                        width: '40px', 
                        height: '40px', 
                        objectFit: 'cover' // Agar foto bulat sempurna
                    }} 
                />
            ) : (
                // Fallback: Tampilkan Inisial jika tidak ada foto
                <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center text-primary fw-bold" 
                     style={{width: '40px', height: '40px'}}>
                    {user?.name?.charAt(0).toUpperCase() || <i className="bi bi-person"></i>}
                </div>
            )}
            {/* ------------------------------------------- */}
            
        </div>
      </div>
    </nav>
  );
};

export default Navbar;