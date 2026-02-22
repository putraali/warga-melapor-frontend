import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // CSS Khusus untuk animasi sidebar di Mobile
  // Anda bisa memindahkannya ke App.css, tapi disini juga jalan
  const styles = `
    @media (max-width: 767.98px) {
        .translate-negative { transform: translateX(-100%); }
        .translate-0 { transform: translateX(0); }
        .sidebar-transition { transition: transform 0.3s ease-in-out; }
    }
    @media (min-width: 768px) {
        .translate-negative { transform: translateX(0) !important; } /* Di Desktop selalu muncul */
        .main-content { margin-left: 260px; } /* Geser konten ke kanan */
    }
    /* Styling NavLink Active Bawaan React Router */
    .nav-link.active {
        background-color: #0d6efd;
        color: white !important;
        font-weight: bold;
    }
    .nav-link { color: #555; }
    .nav-link:hover { background-color: #f8f9fa; color: #0d6efd; }
  `;

  return (
    <React.Fragment>
      <style>{styles}</style>
      <div className="d-flex flex-column min-vh-100 bg-light">
        
        {/* SIDEBAR */}
        <Sidebar 
            isOpen={isSidebarOpen} 
            closeSidebar={() => setIsSidebarOpen(false)} 
        />
        
        {/* KONTEN UTAMA */}
        <div className="main-content d-flex flex-column min-vh-100 transition-all">
          
          {/* Navbar menerima fungsi toggle */}
          <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          
          <main className="flex-grow-1 p-4">
             <div className="container-fluid fade-in">
                {children}
             </div>
          </main>

          <Footer />
        </div>
      </div>
    </React.Fragment>
  );
};

export default Layout;