import React from 'react';
// --- IMPORT RECHARTS UNTUK GRAFIK ---
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DashboardAdmin = ({ stats }) => {
  // Data untuk grafik laporan
  const chartData = [
    { name: 'Pending', jumlah: stats.pending || 0, color: '#ffc107' }, // Kuning
    { name: 'Proses', jumlah: stats.proses || 0, color: '#0dcaf0' },  // Biru Muda
    { name: 'Selesai', jumlah: stats.selesai || 0, color: '#198754' } // Hijau
  ];

  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="alert alert-primary shadow-sm border-0">
          <h4 className="fw-bold mb-0"><i className="bi bi-speedometer2 me-2"></i>Admin Dashboard</h4>
          <small>Ringkasan data sistem Warga Melapor.</small>
        </div>
      </div>

      {/* --- KELOMPOK CARD PENGGUNA (DIBUAT JADI 4 KOLOM / col-md-3) --- */}
      
      {/* Card 1: Warga */}
      <div className="col-md-3">
        <div className="card bg-white border-0 shadow-sm h-100">
          <div className="card-body">
            <h6 className="text-muted text-uppercase fw-bold">Total Warga</h6>
            <h1 className="display-4 fw-bold text-primary">{stats.warga || 0}</h1>
            <p className="mb-0 text-muted">Terdaftar dalam sistem</p>
          </div>
        </div>
      </div>

      {/* Card 2: Ketua RW */}
      <div className="col-md-3">
        <div className="card bg-white border-0 shadow-sm h-100">
          <div className="card-body">
            <h6 className="text-muted text-uppercase fw-bold">Ketua RW</h6>
            <h1 className="display-4 fw-bold text-info">{stats.ketua_rw || 0}</h1>
            <p className="mb-0 text-muted">Pemimpin wilayah</p>
          </div>
        </div>
      </div>

      {/* Card 3: Petugas */}
      <div className="col-md-3">
        <div className="card bg-white border-0 shadow-sm h-100">
          <div className="card-body">
            <h6 className="text-muted text-uppercase fw-bold">Petugas (PJ)</h6>
            <h1 className="display-4 fw-bold text-warning">{stats.penanggung_jawab || 0}</h1>
            <p className="mb-0 text-muted">Siap menangani laporan</p>
          </div>
        </div>
      </div>

      {/* Card 4: Admin */}
      <div className="col-md-3">
        <div className="card bg-white border-0 shadow-sm h-100">
          <div className="card-body">
            <h6 className="text-muted text-uppercase fw-bold">Admin</h6>
            <h1 className="display-4 fw-bold text-success">{stats.admin || 0}</h1>
            <p className="mb-0 text-muted">Pengelola sistem</p>
          </div>
        </div>
      </div>
      
      {/* --- STATISTIK & GRAFIK LAPORAN --- */}
      <div className="col-12 mt-4">
         <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
                <span>Statistik Pengaduan</span>
                <span className="badge bg-primary rounded-pill">Total: {stats.total_laporan || 0} Laporan</span>
            </div>
            <div className="card-body">
               {/* Angka Status Laporan (DIPISAH) */}
               <div className="row text-center mb-5">
                   <div className="col">
                       <h2 className="text-warning fw-bold">{stats.pending || 0}</h2>
                       <small className="text-muted fw-semibold text-uppercase">Pending</small>
                   </div>
                   <div className="col border-start">
                       <h2 className="text-info fw-bold">{stats.proses || 0}</h2>
                       <small className="text-muted fw-semibold text-uppercase">Sedang Proses</small>
                   </div>
                   <div className="col border-start">
                       <h2 className="text-success fw-bold">{stats.selesai || 0}</h2>
                       <small className="text-muted fw-semibold text-uppercase">Selesai</small>
                   </div>
               </div>

               {/* Grafik Status Laporan */}
               <h6 className="fw-bold text-muted mb-3 text-center">Grafik Penyelesaian Laporan</h6>
               <div style={{ width: '100%', height: 300 }}>
                   <ResponsiveContainer>
                       <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} />
                           <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                           <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                           <Bar dataKey="jumlah" radius={[5, 5, 0, 0]} barSize={60}>
                               {chartData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.color} />
                               ))}
                           </Bar>
                       </BarChart>
                   </ResponsiveContainer>
               </div>

            </div>
         </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;