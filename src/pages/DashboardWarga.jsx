import React from 'react';
import { Link } from 'react-router-dom';

const DashboardWarga = ({ user }) => {
  return (
    <div className="container mt-5">
      {/* Tambahkan CSS Inline untuk Hover Effect */}
      <style>
        {`
          .hover-effect {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            cursor: pointer;
          }
          .hover-effect:hover {
            transform: translateY(-5px); /* Kartu naik sedikit saat di-hover */
            box-shadow: 0 10px 20px rgba(0,0,0,0.15) !important; /* Bayangan makin tebal */
          }
          /* Agar seluruh kartu bisa diklik (opsional, tapi bagus untuk UX) */
          .stretched-link::after {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 1;
            content: "";
          }
          /* Pastikan tombol tetap di atas layer link */
          .position-relative {
            position: relative;
            z-index: 2; 
          }
        `}
      </style>

      <div className="row justify-content-center">
        <div className="col-md-10 text-center">
          
          {/* Header */}
          <div className="mb-5">
            <img 
                src="https://cdn-icons-png.flaticon.com/512/6073/6073873.png" 
                alt="Welcome" 
                width="100" 
                className="mb-3"
            />
            <h2 className="fw-bold text-dark">Halo, {user && user.name}!</h2>
            <p className="text-secondary fs-5">
                Selamat datang di Layanan Warga Melapor. <br/>
                Mari bersama menjaga lingkungan kita.
            </p>
          </div>

          <div className="row g-4 justify-content-center">
            
            {/* --- CARD 1: BUAT LAPORAN (TEMA BIRU) --- */}
            <div className="col-md-5">
              <div className="card h-100 border-primary border-2 shadow-sm hover-effect">
                <div className="card-body py-5 d-flex flex-column align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle mb-3">
                    <i className="bi bi-megaphone-fill fs-1 text-primary"></i>
                  </div>
                  <h4 className="fw-bold">Ada Masalah?</h4>
                  <p className="text-muted mb-4">Laporkan kerusakan fasilitas atau kejadian penting di sekitar Anda.</p>
                  
                  {/* Tombol Full Width */}
                  <Link to="/reports/add" className="btn btn-primary btn-lg w-75 rounded-pill position-relative fw-bold mt-auto">
                    <i className="bi bi-plus-circle me-2"></i>Buat Laporan
                  </Link>
                </div>
              </div>
            </div>

            {/* --- CARD 2: RIWAYAT SAYA (TEMA HIJAU) --- */}
            {/* PERBAIKAN: Ditambahkan border-success agar sesuai dengan tombolnya */}
            <div className="col-md-5">
              <div className="card h-100 border-success border-2 shadow-sm hover-effect">
                <div className="card-body py-5 d-flex flex-column align-items-center">
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle mb-3">
                    <i className="bi bi-clipboard-check-fill fs-1 text-success"></i>
                  </div>
                  <h4 className="fw-bold">Laporan Saya</h4>
                  <p className="text-muted mb-4">Pantau status tindak lanjut laporan yang sudah Anda kirim.</p>
                  
                  {/* Tombol Full Width */}
                  <Link to="/reports/me" className="btn btn-outline-success btn-lg w-75 rounded-pill position-relative fw-bold mt-auto">
                    <i className="bi bi-clock-history me-2"></i>Lihat Riwayat
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardWarga;