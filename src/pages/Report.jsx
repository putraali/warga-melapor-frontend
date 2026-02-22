import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import axios from "axios";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getMe } from "../features/authSlice";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Report = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]); 
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const dispatch = useDispatch();
  // 1. Ekstrak isLoading dari Redux
  const { user, isError, isLoading } = useSelector((state) => state.auth);
  
  // 2. State untuk loading fetch laporan
  const [isReportsLoading, setIsReportsLoading] = useState(true);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const getReports = async () => {
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
        setIsReportsLoading(false); // Matikan loading setelah selesai
      }
    };

    if (user) {
        getReports();
    }
  }, [user]);

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

  const deleteReport = async (uuid) => {
    const confirmDelete = window.confirm("Hapus laporan ini permanen?");
    if (!confirmDelete) return;

    try {
        const token = localStorage.getItem('accessToken') || user?.accessToken;
        await axios.delete(`https://warga-melapor-backend-production.up.railway.app/reports/${uuid}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const updatedReports = reports.filter((report) => report.uuid !== uuid);
        setReports(updatedReports);
        setFilteredReports(prev => prev.filter((report) => report.uuid !== uuid));
    } catch (error) {
        alert("Gagal menghapus: " + error.message);
    }
  };

  const getStatusBadge = (status) => {
      if(status === 'selesai') return 'bg-success';
      if(status === 'proses') return 'bg-warning text-dark';
      return 'bg-danger';
  };

  const formatDate = (dateString) => {
      if(!dateString) return "-"; 
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long', 
          year: 'numeric'
      });
  };

  const exportAllToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Rekapitulasi Laporan Masyarakat - Warga Melapor", 14, 15);
    
    doc.setFontSize(10);
    doc.text(`Dicetak Oleh: ${user?.name || 'Admin'}`, 14, 22);
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
            report.status.toUpperCase(),
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

  // 3. Status loading gabungan
  const isPageLoading = isLoading || isReportsLoading || (!user && !isError);

  return (
    <Layout>
      {/* --- OVERLAY LOADING ANIMASI LOGO --- */}
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

      {/* --- KONTEN HALAMAN (Hanya tampil jika loading selesai) --- */}
      {!isPageLoading && (
        <>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
            <div>
                <h3 className="fw-bold mb-0">
                    {user && user.role === 'warga' ? 'Riwayat Laporan Saya' : 'Daftar Semua Laporan'}
                </h3>
                {user && user.role !== 'warga' && (
                    <small className="text-muted">Menampilkan: {filteredReports.length} dari {reports.length} Laporan</small>
                )}
            </div>
            
            <div className="d-flex gap-2 mt-3 mt-md-0">
                {user && user.role === "warga" && (
                <Link to="/reports/add" className="btn btn-primary">
                    <i className="bi bi-plus-lg me-2"></i>Buat Laporan
                </Link>
                )}
            </div>
          </div>

          {user && user.role !== "warga" && (
              <div className="card mb-4 border-0 shadow-sm bg-light">
                  <div className="card-body py-3">
                      <div className="row g-2 align-items-end">
                          <div className="col-md-3">
                              <label className="form-label small fw-bold text-muted">Dari Tanggal</label>
                              <input 
                                  type="date" 
                                  className="form-control form-control-sm" 
                                  value={startDate}
                                  onChange={(e) => setStartDate(e.target.value)}
                              />
                          </div>
                          <div className="col-md-3">
                              <label className="form-label small fw-bold text-muted">Sampai Tanggal</label>
                              <input 
                                  type="date" 
                                  className="form-control form-control-sm" 
                                  value={endDate}
                                  onChange={(e) => setEndDate(e.target.value)}
                              />
                          </div>
                          <div className="col-md-6 d-flex gap-2">
                              <button onClick={handleFilter} className="btn btn-sm btn-primary px-3">
                                  <i className="bi bi-filter"></i> Terapkan Filter
                              </button>
                              <button onClick={handleResetFilter} className="btn btn-sm btn-outline-secondary px-3">
                                  <i className="bi bi-arrow-counterclockwise"></i> Reset
                              </button>
                              <button onClick={exportAllToPDF} className="btn btn-sm btn-danger ms-auto">
                                  <i className="bi bi-file-earmark-pdf-fill me-2"></i>Export PDF
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {user && user.role === "warga" ? (
            <div className="row g-4">
                {filteredReports.map((report) => {
                    const isUpdated = hasRecentActivity(report.updatedAt, report.createdAt);
                    
                    return (
                        <div className="col-md-6 col-lg-4" key={report.uuid}>
                            <div className="card h-100 shadow-sm border-0 hover-effect position-relative">
                                {isUpdated && (
                                    <span 
                                        className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger border border-2 border-white shadow-sm d-flex justify-content-center align-items-center"
                                        style={{ width: '28px', height: '28px', fontSize: '12px', zIndex: 10, transform: 'translate(-50%, -50%)' }}
                                    >
                                        1
                                    </span>
                                )}

                                <div className="card-body d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <small className="text-primary d-block mb-1 fw-bold">
                                                <i className="bi bi-calendar-event me-1"></i>{formatDate(report.tanggal_kejadian)}
                                            </small>
                                            <small className="text-muted d-block">
                                                <i className="bi bi-geo-alt me-1"></i>{report.location || "Lokasi tidak ada"}
                                            </small>
                                        </div>
                                        <span className={`badge ${getStatusBadge(report.status)}`}>
                                            {report.status}
                                        </span>
                                    </div>
                                    
                                    <h5 className="card-title fw-bold text-truncate mt-2">{report.title}</h5>
                                    <p className="card-text text-muted small">
                                        {report.description.substring(0, 80)}...
                                    </p>
                                    
                                    <div className="rounded overflow-hidden bg-light mb-3 mt-auto position-relative" style={{height: '180px'}}>
                                        {report.url ? (
                                            <img src={report.url} alt="Bukti" className="w-100 h-100 object-fit-cover" />
                                        ) : (
                                            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                                                <i className="bi bi-image-off fs-1"></i>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="d-grid">
                                        <Link 
                                            to={`/reports/detail/${report.uuid}`} 
                                            className={`btn btn-sm fw-bold d-flex justify-content-between align-items-center px-3 ${isUpdated ? 'btn-outline-success border-2' : 'btn-primary'}`}
                                        >
                                            <span>Lihat Detail</span>
                                            <div className="position-relative">
                                                <i className={`bi ${isUpdated ? 'bi-chat-dots-fill text-success' : 'bi-arrow-right'} fs-5`}></i>
                                            </div>
                                        </Link>
                                        {isUpdated && <small className="text-success text-center mt-1 fw-bold" style={{fontSize: '0.75rem'}}>Pesan baru dari petugas</small>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
          ) : (
            <div className="card shadow-sm border-0">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle" id="report-table">
                            <thead className="table-dark">
                                <tr>
                                    <th>No</th>
                                    <th>Tanggal Kejadian</th>
                                    <th>Lokasi</th>
                                    <th>Judul</th>
                                    <th>Bukti</th>
                                    <th>Status</th>
                                    <th>Pelapor</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.map((report, index) => (
                                    <tr key={report.uuid}>
                                        <td>{index + 1}</td>
                                        <td className="text-nowrap fw-bold text-primary">
                                            {formatDate(report.tanggal_kejadian)}
                                        </td>
                                        <td>{report.location || '-'}</td>
                                        <td className="fw-bold">{report.title}</td>
                                        <td>
                                            {report.url ? (
                                                <a href={report.url} target="_blank" rel="noreferrer">
                                                    <img src={report.url} alt="Bukti" width="50" height="50" className="rounded object-fit-cover border" />
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(report.status)}`}>{report.status}</span>
                                        </td>
                                        <td>{report.user ? report.user.name : "Anonim"}</td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                {(user.role === 'penanggung_jawab' || user.role === 'admin') && (
                                                    <Link to={`/reports/action/${report.uuid}`} className="btn btn-sm btn-primary">
                                                        <i className="bi bi-pencil-square"></i> Proses
                                                    </Link>
                                                )}
                                                {user.role === 'admin' && (
                                                    <button onClick={() => deleteReport(report.uuid)} className="btn btn-sm btn-danger">
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

          {filteredReports.length === 0 && (
             <div className="text-center py-5">
                <h4 className="text-muted">Tidak ada laporan yang ditemukan.</h4>
                {(startDate || endDate) && <p className="text-muted">Coba ubah filter tanggal.</p>}
             </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default Report;