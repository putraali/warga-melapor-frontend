import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const DashboardWarga = ({ user }) => {
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk mengontrol peringatan profil secara real-time
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  
  const [stats, setStats] = useState({
    pending: 0,
    proses: 0,
    selesai: 0,
    total: 0
  });

  // Fungsi helper ketat untuk mengecek kekosongan data
  const isDataEmpty = (val) => {
    if (val === null || val === undefined) return true;
    const str = String(val).trim().toLowerCase();
    if (str === '' || str === 'null' || str === 'undefined' || str === '-') return true;
    return false;
  };

  useEffect(() => {
    // Fungsi untuk mengecek langsung ke database, mengabaikan data 'user' dari props yang mungkin basi
    const checkRealtimeProfile = async (token) => {
        try {
            // Gunakan timestamp untuk memecah cache browser secara paksa
            const timestamp = new Date().getTime();
            
            // Asumsi rute /me atau rute spesifik user ID Anda
            const userId = user?.uuid || user?.id;
            
            if(!userId) return;

            const res = await axios.get(`https://warga-melapor-backend-production.up.railway.app/users/${userId}?t=${timestamp}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const dbUser = res.data.data || res.data;
            
            // Cek data asli dari Database
            const emptyNik = isDataEmpty(dbUser.nik) && isDataEmpty(dbUser.no_ktp);
            const emptyAlamat = isDataEmpty(dbUser.alamat) && isDataEmpty(dbUser.address);
            
            // Jika salah satu kosong, nyalakan peringatan
            if (emptyNik || emptyAlamat) {
                setIsProfileIncomplete(true);
            } else {
                setIsProfileIncomplete(false); // Matikan peringatan
            }
        } catch (error) {
            console.error("Gagal verifikasi profil ke DB:", error);
            // Fallback: Jika API gagal, gunakan data 'user' dari props
            const fallbackEmpty = isDataEmpty(user?.nik) || isDataEmpty(user?.alamat);
            setIsProfileIncomplete(fallbackEmpty);
        } finally {
            setIsCheckingProfile(false);
        }
    };

    const fetchMyReports = async () => {
      try {
        setLoading(true);
        
        let rawToken = sessionStorage.getItem('authToken') || 
                       localStorage.getItem('token') || 
                       sessionStorage.getItem('token') ||
                       localStorage.getItem('accessToken');

        if (!rawToken) {
            console.error("❌ Token tidak ditemukan di browser!");
            setLoading(false);
            setIsCheckingProfile(false);
            return;
        }

        const cleanToken = rawToken.replace(/^"(.*)"$/, '$1');

        // 1. CEK PROFIL KE DB SECARA PARALEL
        checkRealtimeProfile(cleanToken);

        // 2. AMBIL DATA LAPORAN
        const response = await axios.get('https://warga-melapor-backend-production.up.railway.app/reports/me', {
          headers: { Authorization: `Bearer ${cleanToken}` },
          withCredentials: true 
        }); 
        
        const allReports = response.data.data || response.data.laporan || response.data || [];
        
        if (Array.isArray(allReports)) {
            setRecentReports(allReports.slice(0, 3)); 

            let countPending = 0;
            let countProses = 0;
            let countSelesai = 0;

            allReports.forEach(report => {
              const status = String(report.status || 'pending').toLowerCase();
              if (status.includes('selesai') || status.includes('done')) countSelesai++;
              else if (status.includes('proses') || status.includes('progress')) countProses++;
              else countPending++; 
            });

            setStats({
              pending: countPending,
              proses: countProses,
              selesai: countSelesai,
              total: allReports.length
            });
        }

      } catch (error) {
        console.error("❌ Gagal mengambil laporan:", error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyReports();
    }
  }, [user]);

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('selesai') || s.includes('done')) return 'bg-success';
    if (s.includes('proses') || s.includes('progress')) return 'bg-warning text-dark';
    if (s.includes('tolak') || s.includes('reject')) return 'bg-danger';
    return 'bg-secondary'; 
  };

  return (
    <div className="container mt-4 mb-5 font-sans">
      <style>
        {`
          .hover-effect { transition: transform 0.3s ease, box-shadow 0.3s ease; cursor: pointer; }
          .hover-effect:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
          .report-card { transition: all 0.2s ease; border-left: 4px solid transparent; }
          .report-card:hover { background-color: #f8f9fa; border-left-color: #0d6efd; }
        `}
      </style>

      <div className="row justify-content-center">
        <div className="col-md-10">
          
          {/* BANNER PERINGATAN (Akan muncul jika pengecekan DB selesai & data kosong) */}
          {!isCheckingProfile && isProfileIncomplete && (
            <div className="alert alert-warning border-warning border-2 d-flex align-items-center shadow-sm mb-4 rounded-4" role="alert">
              <i className="bi bi-exclamation-triangle-fill fs-3 text-warning me-3"></i>
              <div>
                <h6 className="alert-heading fw-bold mb-1">Identitas Belum Lengkap!</h6>
                <p className="mb-0 text-dark" style={{ fontSize: '0.9rem' }}>
                  Mohon lengkapi data diri Anda (NIK dan Alamat) di menu <Link to="/profile" className="fw-bold text-dark text-decoration-underline position-relative">Profil Saya</Link> agar laporan Anda dapat diproses.
                </p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-5 mt-3">
            <img src="https://cdn-icons-png.flaticon.com/512/6073/6073873.png" alt="Welcome" width="90" className="mb-3"/>
            <h2 className="fw-bold text-dark">Halo, {user?.name || user?.full_name || 'Warga'}!</h2>
            <p className="text-secondary fs-6">Selamat datang di Layanan Warga Melapor. <br/>Mari bersama menjaga lingkungan kita.</p>
          </div>

          {/* STATISTIK */}
          <div className="card border-0 shadow-sm rounded-4 mb-5 bg-white">
            <div className="card-header bg-white border-0 pt-4 pb-0 text-center">
              <h5 className="fw-bold text-dark mb-0">Statistik Laporan Anda</h5>
              <p className="text-muted small mb-0">Total: {stats.total} Pengaduan</p>
            </div>
            <div className="card-body p-4">
               <div className="row text-center">
                   <div className="col">
                       <h2 className="text-warning fw-bold mb-1">{stats.pending}</h2>
                       <small className="text-muted fw-bold text-uppercase" style={{fontSize:'0.75rem'}}>Menunggu</small>
                   </div>
                   <div className="col border-start">
                       <h2 className="text-info fw-bold mb-1">{stats.proses}</h2>
                       <small className="text-muted fw-bold text-uppercase" style={{fontSize:'0.75rem'}}>Diproses</small>
                   </div>
                   <div className="col border-start">
                       <h2 className="text-success fw-bold mb-1">{stats.selesai}</h2>
                       <small className="text-muted fw-bold text-uppercase" style={{fontSize:'0.75rem'}}>Selesai</small>
                   </div>
               </div>
            </div>
          </div>

          {/* ACTION CARDS */}
          <div className="row g-4 justify-content-center mb-5">
            <div className="col-md-6 col-lg-5">
              <div className="card h-100 border-primary border-2 shadow-sm hover-effect rounded-4 position-relative">
                <div className="card-body py-4 d-flex flex-column align-items-center text-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle mb-3 mt-2"><i className="bi bi-megaphone-fill fs-2 text-primary"></i></div>
                  <h5 className="fw-bold">Ada Masalah?</h5>
                  <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>Laporkan kerusakan fasilitas atau kejadian penting di sekitar Anda.</p>
                  <Link to="/reports/add" className="btn btn-primary w-100 rounded-pill fw-bold mt-auto py-2 stretched-link"><i className="bi bi-plus-circle me-2"></i>Buat Laporan Baru</Link>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-5">
              <div className="card h-100 border-success border-2 shadow-sm hover-effect rounded-4 position-relative">
                <div className="card-body py-4 d-flex flex-column align-items-center text-center">
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle mb-3 mt-2"><i className="bi bi-clipboard-check-fill fs-2 text-success"></i></div>
                  <h5 className="fw-bold">Riwayat Laporan</h5>
                  <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>Pantau status tindak lanjut laporan yang sudah Anda kirim sebelumnya.</p>
                  <Link to="/reports/me" className="btn btn-outline-success w-100 rounded-pill fw-bold mt-auto py-2 stretched-link"><i className="bi bi-clock-history me-2"></i>Lihat Semua Riwayat</Link>
                </div>
              </div>
            </div>
          </div>

          <hr className="text-muted opacity-25 mb-5" />

          {/* RECENT REPORTS */}
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0"><i className="bi bi-journal-text me-2 text-primary"></i>Aktivitas Terbaru</h5>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden border border-light">
              {loading ? (
                <div className="p-5 text-center text-secondary">
                  <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>Memuat data laporan...
                </div>
              ) : recentReports.length === 0 ? (
                <div className="p-5 text-center text-secondary bg-light">
                  <i className="bi bi-inbox fs-1 text-muted mb-2 d-block"></i>
                  <span className="fw-semibold">Belum ada aktivitas</span>
                  <p className="mb-0 mt-1" style={{ fontSize: '0.85rem' }}>Data laporan tidak ditemukan atau Anda belum pernah melapor.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentReports.map((report, index) => (
                    <Link key={index} to={`/reports/detail/${report.uuid || report.id}`} className="list-group-item list-group-item-action p-4 report-card text-decoration-none">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex flex-wrap gap-2">
                          <span className={`badge ${getStatusBadge(report.status)} px-3 py-2 rounded-pill fw-bold text-white`} style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.4rem' }}></i>
                            {report.status ? report.status.replace(/_/g, ' ').toUpperCase() : 'PENDING'}
                          </span>
                          
                          {report.is_priority && (
                            <span className="badge bg-danger px-3 py-2 rounded-pill fw-bold text-white" style={{ fontSize: '0.75rem' }}>
                              <i className="bi bi-exclamation-circle-fill me-1"></i> PRIORITAS
                            </span>
                          )}
                        </div>

                        <small className="text-muted fw-semibold" style={{ fontSize: '0.8rem' }}>
                          {report.createdAt || report.created_at ? new Date(report.createdAt || report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                        </small>
                      </div>
                      <h6 className="fw-bold text-dark mb-1 text-truncate mt-2">{report.title || 'Laporan Tanpa Judul'}</h6>
                      <p className="text-secondary mb-0 text-truncate" style={{ fontSize: '0.85rem', maxWidth: '85%' }}>{report.description || 'Tidak ada deskripsi'}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardWarga;