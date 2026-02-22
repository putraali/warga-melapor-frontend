import React from 'react';

const DashboardAdmin = ({ stats }) => {
  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="alert alert-primary shadow-sm border-0">
          <h4 className="fw-bold mb-0"><i className="bi bi-speedometer2 me-2"></i>Admin Dashboard</h4>
          <small>Ringkasan data sistem Warga Melapor.</small>
        </div>
      </div>

      {/* Card 1: Warga */}
      <div className="col-md-4">
        <div className="card bg-white border-0 shadow-sm h-100">
          <div className="card-body">
            <h6 className="text-muted text-uppercase fw-bold">Total Warga</h6>
            <h1 className="display-4 fw-bold text-primary">{stats.warga || 0}</h1>
            <p className="mb-0 text-muted">Terdaftar dalam sistem</p>
          </div>
        </div>
      </div>

      {/* Card 2: Petugas */}
      <div className="col-md-4">
        <div className="card bg-white border-0 shadow-sm h-100">
          <div className="card-body">
            <h6 className="text-muted text-uppercase fw-bold">Petugas (PJ)</h6>
            <h1 className="display-4 fw-bold text-warning">{stats.penanggung_jawab || 0}</h1>
            <p className="mb-0 text-muted">Siap menangani laporan</p>
          </div>
        </div>
      </div>

      {/* Card 3: Admin */}
      <div className="col-md-4">
        <div className="card bg-white border-0 shadow-sm h-100">
          <div className="card-body">
            <h6 className="text-muted text-uppercase fw-bold">Admin</h6>
            <h1 className="display-4 fw-bold text-success">{stats.admin || 0}</h1>
            <p className="mb-0 text-muted">Pengelola sistem</p>
          </div>
        </div>
      </div>
      
      {/* Tambahan: Statistik Laporan */}
       <div className="col-12 mt-4">
          <div className="card border-0 shadow-sm">
             <div className="card-header bg-white fw-bold">Status Laporan</div>
             <div className="card-body">
                <div className="row text-center">
                    <div className="col">
                        <h3>{stats.total_laporan || 0}</h3>
                        <small>Total Laporan Masuk</small>
                    </div>
                    
                    {/* ✅ PERBAIKAN: JUMLAHKAN PENDING DAN PROSES */}
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

export default DashboardAdmin;