import React from 'react';
import { Link } from 'react-router-dom';

const DashboardPetugas = ({ user, stats }) => {
  return (
    <div className="row g-4">
      {/* 1. WELCOME ALERT */}
      <div className="col-12">
        <div className="alert alert-warning border-start border-warning border-4 shadow-sm">
          <div className="d-flex align-items-center">
             <div className="me-3">
                <i className="bi bi-tools fs-1"></i>
             </div>
             <div>
                <h4 className="fw-bold mb-1">Selamat Bertugas, {user && user.name}</h4>
                <p className="mb-0">
                    Semangat! Ada <strong className="fs-5">{stats.pending || 0}</strong> laporan baru yang belum disentuh.
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* 2. KARTU STATISTIK (Agar Petugas tau performa tim) */}
      <div className="col-md-6">
        <div className="row g-3">
            {/* Card Pending */}
            <div className="col-6">
                <div className="card border-0 shadow-sm text-center h-100 py-3">
                    <div className="card-body">
                        <h2 className="text-danger fw-bold">{stats.pending || 0}</h2>
                        <span className="text-muted small">Belum Ditangani</span>
                    </div>
                </div>
            </div>
            {/* Card Proses */}
            <div className="col-6">
                <div className="card border-0 shadow-sm text-center h-100 py-3">
                    <div className="card-body">
                        <h2 className="text-warning fw-bold">{stats.proses || 0}</h2>
                        <span className="text-muted small">Sedang Dikerjakan</span>
                    </div>
                </div>
            </div>
             {/* Card Selesai */}
             <div className="col-12">
                <div className="card border-0 shadow-sm text-center h-100 py-3">
                    <div className="card-body">
                        <h2 className="text-success fw-bold">{stats.selesai || 0}</h2>
                        <span className="text-muted small">Berhasil Diselesaikan</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 3. MENU AKSI CEPAT */}
      <div className="col-md-6">
        <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white fw-bold py-3">
                <i className="bi bi-list-task me-2 text-primary"></i>
                Menu Petugas
            </div>
            <div className="card-body d-flex flex-column justify-content-center">
                <div className="d-grid gap-3">
                    <Link to="/reports" className="btn btn-primary p-4 text-start d-flex justify-content-between align-items-center shadow-sm">
                        <span className="fs-5"><i className="bi bi-clipboard-data me-3"></i> Mulai Kerjakan Laporan</span>
                        <i className="bi bi-chevron-right"></i>
                    </Link>

                    {/* Tombol Logout atau lainnya jika perlu */}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPetugas;