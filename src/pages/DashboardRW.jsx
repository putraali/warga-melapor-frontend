import React from 'react';
import { Link } from 'react-router-dom';

const DashboardRW = ({ stats, userRw }) => {
  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="alert alert-info shadow-sm border-0 d-flex justify-content-between align-items-center">
          <div>
            <h4 className="fw-bold mb-0 text-dark">
                <i className="bi bi-houses-fill me-2 text-info"></i>Dashboard Ketua {userRw || 'RW'}
            </h4>
            <small className="text-dark">Ringkasan data warga dan pengaduan di wilayah Anda.</small>
          </div>
          <Link to="/ValidasiWarga" className="btn btn-sm btn-primary rounded-pill shadow-sm px-3 fw-bold">
            <i className="bi bi-person-check-fill me-2"></i>Data & Validasi Warga
          </Link>
        </div>
      </div>

      {/* --- KELOMPOK CARD STATUS WARGA (3 KOLOM) --- */}
      
      {/* Card 1: Warga Terverifikasi */}
      <div className="col-md-4">
        <div className="card bg-white border-0 shadow-sm h-100">
          <div className="card-body">
            <h6 className="text-muted text-uppercase fw-bold">Warga Terverifikasi</h6>
            <h1 className="display-4 fw-bold text-success">{stats.warga_verified || 0}</h1>
            <p className="mb-0 text-muted">Akses laporan dibuka</p>
          </div>
        </div>
      </div>

      {/* Card 2: Menunggu Validasi (Pending) */}
      <div className="col-md-4">
        <div className="card bg-white border-0 shadow-sm h-100 border-bottom border-warning border-4">
          <div className="card-body">
            <h6 className="text-muted text-uppercase fw-bold">Menunggu Validasi</h6>
            <h1 className="display-4 fw-bold text-warning">{stats.warga_pending || 0}</h1>
            <p className="mb-0 text-muted">Perlu tindakan Anda</p>
          </div>
        </div>
      </div>

      {/* Card 3: Pendaftaran Ditolak */}
      <div className="col-md-4">
        <div className="card bg-white border-0 shadow-sm h-100 border-bottom border-danger border-4">
          <div className="card-body">
            <h6 className="text-muted text-uppercase fw-bold">Pendaftaran Ditolak</h6>
            <h1 className="display-4 fw-bold text-danger">{stats.warga_rejected || 0}</h1>
            <p className="mb-0 text-muted">Bukan warga RW Anda</p>
          </div>
        </div>
      </div>

      {/* --- KELOMPOK CARD STATISTIK LAPORAN --- */}
      <div className="col-12 mt-4">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white fw-bold">Status Laporan Pengaduan Warga</div>
          <div className="card-body">
            <div className="row text-center">
              <div className="col">
                <h3>{stats.total_laporan || 0}</h3>
                <small>Total Laporan Masuk</small>
              </div>
              
              <div className="col">
                <h3 className="text-warning">
                  {(stats.pending || 0) + (stats.proses || 0)}
                </h3>
                <small>Pending / Sedang Proses</small>
              </div>

              <div className="col">
                <h3 className="text-success">{stats.selesai || 0}</h3>
                <small>Selesai Ditangani</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardRW;