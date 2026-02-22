import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import axios from "axios";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getMe } from "../features/authSlice";

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

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
        }
      } catch (error) {
        console.log("Gagal ambil data:", error);
      }
    };

    getReports();
  }, [user]);

  const deleteReport = async (uuid) => {
    if (!window.confirm("Hapus laporan ini secara permanen?")) return;

    try {
        const token = localStorage.getItem('accessToken') || user?.accessToken;
        await axios.delete(`https://warga-melapor-backend-production.up.railway.app/reports/${uuid}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        setReports((prev) => prev.filter((report) => report.uuid !== uuid));
    } catch (error) {
        console.log(error);
        alert("Gagal menghapus: " + (error.response?.data?.msg || "Terjadi kesalahan"));
    }
  };

  // Helper untuk badge status
  const getStatusBadge = (status) => {
      if (status === 'selesai') return 'bg-success';
      if (status === 'proses') return 'bg-warning text-dark';
      return 'bg-danger';
  };

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Semua Laporan Masuk</h3>
      </div>

      {/* --- TAMPILAN DESKTOP (TABLE) --- */}
      {/* Hanya muncul di layar medium ke atas (md, lg, xl) */}
      <div className="card shadow-sm border-0 d-none d-md-block">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>No</th>
                  <th>Pelapor</th>
                  <th>Judul & Lokasi</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                  <th className="text-center">Opsi</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => (
                  <tr key={report.uuid}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div
                          className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-2"
                          style={{ width: "35px", height: "35px", fontSize: "14px" }}
                        >
                          {report.user?.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <span className="fw-bold d-block" style={{ fontSize: "14px" }}>
                            {report.user?.name || "Anonim"}
                          </span>
                          <small className="text-muted" style={{ fontSize: "12px" }}>
                            {report.user?.email || "-"}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="d-block fw-semibold">{report.title}</span>
                      <small className="text-muted">
                        <i className="bi bi-geo-alt me-1"></i>
                        {report.location || "Lokasi tidak ada"}
                      </small>
                    </td>
                    <td>
                      <span className={`badge rounded-pill ${getStatusBadge(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td>{new Date(report.createdAt).toLocaleDateString("id-ID")}</td>
                    <td className="text-center">
                      <Link
                        to={
                            user && (user.role === 'admin' || user.role === 'penanggung_jawab')
                            ? `/reports/action/${report.uuid}`
                            : `/reports/detail/${report.uuid}`
                        }
                        className="btn btn-sm btn-outline-primary me-1"
                      >
                        Detail
                      </Link>
                      {user && user.role === 'admin' && (
                          <button
                            onClick={() => deleteReport(report.uuid)}
                            className="btn btn-sm btn-outline-danger"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- TAMPILAN MOBILE (CARD) --- */}
      {/* Hanya muncul di layar kecil (hp) */}
      <div className="d-block d-md-none">
          {reports.map((report) => (
              <div className="card shadow-sm border-0 mb-3" key={report.uuid}>
                  <div className="card-body">
                      {/* Header Card: Pelapor & Status */}
                      <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="d-flex align-items-center">
                              <div
                                  className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-2"
                                  style={{ width: "35px", height: "35px", fontSize: "12px" }}
                              >
                                  {report.user?.name?.charAt(0).toUpperCase() || "?"}
                              </div>
                              <div>
                                  <span className="fw-bold d-block" style={{ fontSize: "14px" }}>
                                      {report.user?.name || "Anonim"}
                                  </span>
                                  <small className="text-muted" style={{ fontSize: "11px" }}>
                                      {new Date(report.createdAt).toLocaleDateString("id-ID")}
                                  </small>
                              </div>
                          </div>
                          <span className={`badge rounded-pill ${getStatusBadge(report.status)}`} style={{fontSize:'10px'}}>
                              {report.status}
                          </span>
                      </div>

                      {/* Content Card: Judul & Lokasi */}
                      <h6 className="fw-bold mb-1">{report.title}</h6>
                      <p className="text-muted small mb-3">
                          <i className="bi bi-geo-alt me-1"></i>{report.location || "Lokasi tidak ada"}
                      </p>

                      {/* Footer Card: Tombol Aksi */}
                      <div className="d-grid gap-2 d-flex justify-content-end">
                          <Link
                              to={
                                  user && (user.role === 'admin' || user.role === 'penanggung_jawab')
                                  ? `/reports/action/${report.uuid}`
                                  : `/reports/detail/${report.uuid}`
                              }
                              className="btn btn-sm btn-outline-primary flex-grow-1"
                          >
                              Lihat Detail
                          </Link>
                          {user && user.role === 'admin' && (
                              <button
                                  onClick={() => deleteReport(report.uuid)}
                                  className="btn btn-sm btn-outline-danger"
                              >
                                  <i className="bi bi-trash"></i>
                              </button>
                          )}
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {reports.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted">Belum ada laporan yang masuk.</p>
        </div>
      )}
    </Layout>
  );
};

export default ReportList;