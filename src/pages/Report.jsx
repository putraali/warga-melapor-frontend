import React, { useState, useEffect, useCallback } from "react";
import Layout from "./Layout";
import axios from "axios";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getMe } from "../features/authSlice";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- IMPORT SWEETALERT2 ---
import Swal from "sweetalert2";

const Report = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]); 
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const dispatch = useDispatch();
  const { user, isError, isLoading } = useSelector((state) => state.auth);
  const [isReportsLoading, setIsReportsLoading] = useState(true);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  const getReports = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken') || user?.accessToken;
      if (token) {
          const response = await axios.get("https://warga-melapor-backend-production.up.railway.app/reports", {
              headers: { Authorization: `Bearer ${token}` }
          });
          setReports(response.data);
          setFilteredReports(response.data); 
      }
    } catch (error) {
      console.log("Error fetch reports:", error);
    } finally {
      setIsReportsLoading(false);
    }
  }, [user?.accessToken]);

  useEffect(() => {
    if (user) {
        getReports();
    }
  }, [user, getReports]);

  const handleFilter = () => {
    if (!startDate && !endDate) {
        setFilteredReports(reports); 
        return;
    }

    const filtered = reports.filter((report) => {
        const reportDate = new Date(report.tanggal_kejadian); 
        const start = startDate ? new Date(startDate) : new Date('1970-01-01');
        const end = endDate ? new Date(endDate) : new Date();
        
        end.setHours(23, 59, 59);

        return reportDate >= start && reportDate <= end;
    });

    setFilteredReports(filtered);
  };

  const handleResetFilter = () => {
      setStartDate("");
      setEndDate("");
      setFilteredReports(reports);
  };

  const handleValidasiRW = async (uuid, setPriority) => {
      try {
          const token = localStorage.getItem('accessToken') || user?.accessToken;
          await axios.patch(`https://warga-melapor-backend-production.up.railway.app/reports/${uuid}`, {
              status: "pending",
              is_priority: setPriority
          }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          Swal.fire({
              title: 'Berhasil!',
              text: 'Laporan telah divalidasi dan diteruskan ke petugas.',
              icon: 'success',
              confirmButtonColor: '#0d6efd',
              timer: 2500
          });
          getReports(); 
      } catch (error) {
          console.log(error); 
          Swal.fire('Error', 'Gagal memvalidasi laporan', 'error');
      }
  };

  const confirmValidasiRW = (uuid, title) => {
      Swal.fire({
          title: 'Validasi Laporan',
          text: `Validasi laporan "${title}" agar diteruskan ke petugas?`,
          icon: 'question',
          showCancelButton: true,
          showDenyButton: true,
          confirmButtonText: 'Teruskan (Biasa)',
          denyButtonText: 'Teruskan (Prioritas!)',
          cancelButtonText: 'Batal',
          confirmButtonColor: '#0d6efd',
          denyButtonColor: '#dc3545'
      }).then((result) => {
          if (result.isConfirmed) {
              handleValidasiRW(uuid, false); 
          } else if (result.isDenied) {
              handleValidasiRW(uuid, true);  
          }
      });
  };

  const tolakLaporanRW = async (uuid) => {
      const { value: text } = await Swal.fire({
          title: 'Tolak Laporan',
          input: 'textarea',
          inputLabel: 'Alasan penolakan',
          inputPlaceholder: 'Misal: Kejadian ini di luar wilayah RW kita...',
          showCancelButton: true,
          confirmButtonColor: '#dc3545',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Tolak Laporan',
          inputValidator: (value) => {
              if (!value) return 'Anda harus mengisi alasan!'
          }
      });

      if (text) {
          try {
              const token = localStorage.getItem('accessToken') || user?.accessToken;
              await axios.patch(`https://warga-melapor-backend-production.up.railway.app/reports/${uuid}`, {
                  status: "ditolak_rw"
              }, {
                  headers: { Authorization: `Bearer ${token}` }
              });
              Swal.fire({
                  title: 'Ditolak',
                  text: 'Laporan berhasil dikembalikan ke warga.',
                  icon: 'success',
                  confirmButtonColor: '#0d6efd',
                  timer: 2500
              });
              getReports();
          } catch (error) {
              console.log(error); 
              Swal.fire('Error', 'Gagal menolak laporan', 'error');
          }
      }
  };

  // --- FUNGSI DELETE DENGAN SWEETALERT2 ---
  const deleteReport = async (uuid) => {
    // Popup Konfirmasi Hapus
    const confirmResult = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Data laporan yang dihapus tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545', // Warna merah untuk aksi hapus
        cancelButtonColor: '#6c757d',  // Warna abu-abu untuk batal
        confirmButtonText: '<i class="bi bi-trash-fill me-2"></i>Ya, Hapus!',
        cancelButtonText: 'Batal',
        reverseButtons: true 
    });

    if (!confirmResult.isConfirmed) return;

    try {
        const token = localStorage.getItem('accessToken') || user?.accessToken;
        await axios.delete(`https://warga-melapor-backend-production.up.railway.app/reports/${uuid}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // Notifikasi Sukses
        Swal.fire({
            title: 'Terhapus!',
            text: 'Data laporan berhasil dihapus secara permanen.',
            icon: 'success',
            confirmButtonColor: '#0d6efd',
            timer: 2500
        });
        
        getReports(); // Refresh data
    } catch (error) {
        console.log("Error delete report:", error);
        
        // Notifikasi Gagal
        Swal.fire({
            title: 'Gagal!',
            text: 'Terjadi kesalahan saat menghapus laporan.',
            icon: 'error',
            confirmButtonColor: '#0d6efd'
        });
    }
  };

  const getStatusBadge = (status) => {
      if(status === 'selesai') return 'bg-success text-white';
      if(status === 'proses') return 'bg-warning text-dark';
      if(status === 'menunggu_rw') return 'bg-secondary text-white';
      if(status === 'ditolak_rw') return 'bg-danger text-white';
      return 'bg-secondary text-white'; 
  };

  const formatStatus = (status) => {
      if(status === 'menunggu_rw') return 'Menunggu RW';
      if(status === 'ditolak_rw') return 'Ditolak RW';
      return status;
  };

  const formatDate = (dateString) => {
      if(!dateString) return "-"; 
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
          day: 'numeric', month: 'long', year: 'numeric'
      });
  };

  const exportAllToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Rekapitulasi Laporan Masyarakat", 14, 15);
    
    doc.setFontSize(10);
    doc.text(`Dicetak Oleh: ${user?.name || 'Sistem'}`, 14, 22);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 27);
    
    let periodText = "Semua Periode";
    if (startDate || endDate) {
        const startStr = startDate ? formatDate(startDate) : "Awal";
        const endStr = endDate ? formatDate(endDate) : "Sekarang";
        periodText = `${startStr} s/d ${endStr}`;
    }
    doc.text(`Periode Laporan: ${periodText}`, 14, 32);

    const tableColumn = ["No", "Tanggal", "Judul", "Lokasi", "Status", "Pelapor"];
    const tableRows = [];

    filteredReports.forEach((report, index) => {
        const reportData = [
            index + 1,
            formatDate(report.tanggal_kejadian),
            report.title,
            report.location || "-",
            formatStatus(report.status).toUpperCase(),
            report.user?.name || "Anonim"
        ];
        tableRows.push(reportData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
        styles: { fontSize: 9 }
    });

    doc.save(`Rekap_Laporan_${startDate || 'All'}_to_${endDate || 'All'}.pdf`);
  };

  const hasRecentActivity = (updatedAt, createdAt) => {
      if (!updatedAt) return false;
      const lastUpdate = new Date(updatedAt);
      const created = new Date(createdAt);
      const now = new Date();
      const diffTime = Math.abs(now - lastUpdate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return lastUpdate > created && diffDays <= 3;
  };

  const isPageLoading = isLoading || isReportsLoading || (!user && !isError);

  return (
    <Layout>
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
                Memuat Data Laporan...
            </h5>
        </div>
      )}

      {!isPageLoading && (
        <>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
            <div>
                <h3 className="fw-bold mb-0">
                    {user?.role === 'warga' ? 'Riwayat Laporan Saya' : 'Daftar Laporan'}
                </h3>
                {user && user.role !== 'warga' && (
                    <small className="text-muted">Menampilkan: {filteredReports.length} dari {reports.length} Laporan</small>
                )}
            </div>
            
            <div className="d-flex gap-2 mt-3 mt-md-0">
                {user?.role === "warga" && (
                <Link to="/reports/add" className="btn btn-primary shadow-sm rounded-pill px-4 fw-bold">
                    <i className="bi bi-plus-lg me-2"></i>Buat Laporan Baru
                </Link>
                )}
            </div>
          </div>

          {user && user.role !== "warga" && (
              <div className="card mb-4 border-0 shadow-sm bg-white rounded-4">
                  <div className="card-body py-4 px-4">
                      <div className="row g-3 align-items-end">
                          <div className="col-md-3">
                              <label className="form-label small fw-bold text-secondary">Dari Tanggal</label>
                              <input 
                                  type="date" 
                                  className="form-control" 
                                  value={startDate}
                                  onChange={(e) => setStartDate(e.target.value)}
                              />
                          </div>
                          <div className="col-md-3">
                              <label className="form-label small fw-bold text-secondary">Sampai Tanggal</label>
                              <input 
                                  type="date" 
                                  className="form-control" 
                                  value={endDate}
                                  onChange={(e) => setEndDate(e.target.value)}
                              />
                          </div>
                          <div className="col-md-6 d-flex gap-2">
                              <button onClick={handleFilter} className="btn btn-primary px-3 rounded-3 shadow-sm">
                                  <i className="bi bi-filter"></i> Terapkan
                              </button>
                              <button onClick={handleResetFilter} className="btn btn-light border px-3 rounded-3 shadow-sm text-secondary">
                                  <i className="bi bi-arrow-counterclockwise"></i> Reset
                              </button>
                              <button onClick={exportAllToPDF} className="btn btn-danger ms-auto px-4 rounded-3 shadow-sm">
                                  <i className="bi bi-file-earmark-pdf-fill me-2"></i>Export PDF
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {user?.role !== "warga" && (
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="text-secondary ps-4 py-3">No</th>
                                    <th className="text-secondary py-3">Tanggal</th>
                                    <th className="text-secondary py-3">Judul & Lokasi</th>
                                    <th className="text-secondary py-3">Pelapor</th>
                                    <th className="text-secondary py-3">Status</th>
                                    <th className="text-secondary py-3 pe-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="border-top-0">
                                {filteredReports.map((report, index) => (
                                    <tr key={report.uuid} className={report.is_priority ? "table-danger" : ""}>
                                        <td className="ps-4 fw-bold text-secondary">{index + 1}</td>
                                        <td className="text-nowrap">{formatDate(report.tanggal_kejadian)}</td>
                                        <td>
                                            <div className="fw-bold text-dark">{report.title}</div>
                                            <small className="text-muted"><i className="bi bi-geo-alt me-1"></i>{report.location}</small>
                                            {report.is_priority && <span className="badge bg-danger ms-2 shadow-sm"><i className="bi bi-exclamation-circle-fill me-1"></i>PRIORITAS</span>}
                                        </td>
                                        <td>
                                            <span className="fw-semibold text-dark">{report.user ? report.user.name : "Anonim"}</span>
                                            <div className="small text-muted">{report.user?.rw || '-'}</div>
                                        </td>
                                        <td>
                                            <span className={`badge text-uppercase ${getStatusBadge(report.status)} px-3 py-2 rounded-pill shadow-sm`}>
                                                {formatStatus(report.status)}
                                            </span>
                                        </td>
                                        <td className="pe-4 text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                {user.role === 'ketua_rw' && report.status === 'menunggu_rw' && (
                                                    <>
                                                        <button onClick={() => confirmValidasiRW(report.uuid, report.title)} className="btn btn-sm btn-success rounded-3 shadow-sm" title="Teruskan ke Petugas">
                                                            <i className="bi bi-check-lg"></i>
                                                        </button>
                                                        <button onClick={() => tolakLaporanRW(report.uuid)} className="btn btn-sm btn-outline-danger rounded-3" title="Tolak Laporan">
                                                            <i className="bi bi-x-lg"></i>
                                                        </button>
                                                    </>
                                                )}

                                                <Link to={`/reports/detail/${report.uuid}`} className="btn btn-sm btn-info text-white rounded-3 shadow-sm" title="Lihat Detail">
                                                    <i className="bi bi-eye"></i>
                                                </Link>

                                                {(user.role === 'admin' || user.role === 'penanggung_jawab') && (report.status !== 'menunggu_rw' && report.status !== 'ditolak_rw') && (
                                                    <Link to={`/reports/action/${report.uuid}`} className="btn btn-sm btn-primary rounded-3 shadow-sm" title="Update Progress">
                                                        <i className="bi bi-pencil-square"></i>
                                                    </Link>
                                                )}
                                                
                                                {user.role === 'admin' && (
                                                    <button onClick={() => deleteReport(report.uuid)} className="btn btn-sm btn-danger rounded-3 shadow-sm" title="Hapus Laporan">
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
          )}

          {user?.role === "warga" && (
            <div className="row g-4">
                {filteredReports.map((report) => {
                    const isUpdated = hasRecentActivity(report.updatedAt, report.createdAt);
                    return (
                    <div className="col-md-6 col-lg-4" key={report.uuid}>
                        <div className="card h-100 shadow-sm border-0 position-relative hover-effect overflow-hidden rounded-4">
                            
                            {isUpdated && (
                                <span className="position-absolute top-0 end-0 m-3 badge bg-danger border border-2 border-white shadow px-3 py-2 rounded-pill" style={{ zIndex: 10 }}>
                                    <i className="bi bi-bell-fill me-1"></i> Update Baru
                                </span>
                            )}

                            <div className="bg-light position-relative" style={{ height: '220px', width: '100%' }}>
                                {report.url ? (
                                    <img 
                                        src={report.url} 
                                        alt="Bukti Laporan" 
                                        className="w-100 h-100 object-fit-cover" 
                                    />
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                                        <div className="text-center opacity-50">
                                            <i className="bi bi-image fs-1 d-block mb-2"></i>
                                            <span className="fw-semibold">Tanpa Foto</span>
                                        </div>
                                    </div>
                                )}
                                <div className="position-absolute bottom-0 start-0 w-100" style={{ height: '70px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}></div>
                                
                                <span className={`position-absolute bottom-0 start-0 m-3 badge text-uppercase shadow ${getStatusBadge(report.status)} px-3 py-2 rounded-pill`}>
                                    {formatStatus(report.status)}
                                </span>
                            </div>

                            <div className="card-body d-flex flex-column p-4">
                                <div className="mb-3 d-flex justify-content-between align-items-center">
                                    <span className="text-primary fw-bold small bg-primary bg-opacity-10 px-2 py-1 rounded">
                                        <i className="bi bi-calendar-event me-2"></i>{formatDate(report.tanggal_kejadian)}
                                    </span>
                                </div>
                                
                                <h5 className="card-title fw-bold mb-2 line-clamp-2 text-dark" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {report.title}
                                </h5>
                                
                                <div className="mb-2 text-muted small d-flex align-items-center">
                                    <i className="bi bi-geo-alt-fill text-danger me-2"></i>
                                    <span className="text-truncate">{report.location || "Lokasi tidak dicantumkan"}</span>
                                </div>

                                {report.is_priority && (
                                    <span className="badge bg-danger mb-3 px-3 py-2 align-self-start rounded-pill shadow-sm">
                                        <i className="bi bi-exclamation-circle-fill me-1"></i>PRIORITAS
                                    </span>
                                )}
                                
                                <p className="card-text text-secondary mt-1 mb-4" style={{ fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {report.description}
                                </p>
                                
                                <div className="mt-auto border-top pt-3">
                                    <Link to={`/reports/detail/${report.uuid}`} className={`btn w-100 fw-bold d-flex justify-content-center align-items-center gap-2 rounded-pill ${isUpdated ? 'btn-outline-success border-2' : 'btn-light text-primary bg-primary bg-opacity-10 hover-primary'}`}>
                                        <span>Lihat Detail Laporan</span>
                                        <i className="bi bi-arrow-right-short fs-5"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    )
                })}
            </div>
          )}
          
          {filteredReports.length === 0 && (
             <div className="text-center py-5 my-5 bg-white rounded-4 shadow-sm border border-light">
                <div className="text-muted opacity-50 mb-3">
                    <i className="bi bi-folder-x" style={{ fontSize: '4rem' }}></i>
                </div>
                <h4 className="fw-bold text-dark">Belum Ada Laporan</h4>
                <p className="text-secondary">Tidak ada data laporan yang sesuai dengan pencarian Anda.</p>
             </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default Report;