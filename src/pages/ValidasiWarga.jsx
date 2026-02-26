import React, { useState, useEffect, useCallback } from "react";
import Layout from "./Layout";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../features/authSlice";

const ValidasiWarga = () => {
  const [wargaList, setWargaList] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isError, isLoading } = useSelector((state) => state.auth);

  // URL API Backend
  const API_URL = "https://warga-melapor-backend-production.up.railway.app";

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
        navigate("/");
    }
    if (user && user.role !== "ketua_rw") {
        navigate("/dashboard");
    }
  }, [isError, user, navigate]);

  const getWargaList = useCallback(async () => {
    try {
      const token = user?.accessToken || localStorage.getItem('accessToken');
      if (!token) return;

      const response = await axios.get(`${API_URL}/warga/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWargaList(response.data);
    } catch (error) {
      console.log(error);
      Swal.fire({
          icon: 'error',
          title: 'Gagal mengambil data',
          text: 'Terjadi kesalahan saat memuat daftar warga.'
      });
    } finally {
      setIsDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role === "ketua_rw") {
        getWargaList();
    }
  }, [user, getWargaList]);

  const handleValidasi = async (id, nama, status) => {
    const actionText = status === 'verified' ? 'menyetujui' : 'menolak';
    const confirmColor = status === 'verified' ? '#198754' : '#dc3545';
    const iconType = status === 'verified' ? 'question' : 'warning';

    Swal.fire({
      title: 'Konfirmasi Validasi',
      text: `Apakah Anda yakin ingin ${actionText} pendaftaran warga atas nama ${nama}?`,
      icon: iconType,
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Ya, ${status === 'verified' ? 'Setujui' : 'Tolak'}!`,
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
            title: 'Memproses...',
            text: 'Mohon tunggu sebentar',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
          const token = user?.accessToken || localStorage.getItem('accessToken');
          await axios.patch(`${API_URL}/warga/validasi/${id}`, 
            { status_warga: status },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          Swal.fire(
            'Berhasil!',
            `Pendaftaran warga telah berhasil di${status === 'verified' ? 'setujui' : 'tolak'}.`,
            'success'
          );
          
          getWargaList(); 

        } catch {
          Swal.fire('Error!', 'Terjadi kesalahan saat menyimpan validasi.', 'error');
        }
      }
    });
  };

  const isPageLoading = isLoading || isDataLoading || (!user && !isError);

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
                Menyiapkan Data...
            </h5>
        </div>
      )}

      {!isPageLoading && (
        <>
          <h2 className="mb-2 fw-bold">Data & Validasi Warga</h2>
          <p className="text-muted mb-4">
            Daftar seluruh warga di wilayah <span className="fw-bold text-primary">{user?.rw}</span>. Anda dapat memvalidasi warga yang statusnya masih pending.
          </p>

          <div className="card shadow-sm border-0">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3">No</th>
                      <th className="py-3">Nama Lengkap</th>
                      <th className="py-3">NIK</th>
                      <th className="py-3">Alamat Lengkap</th>
                      <th className="text-center py-3">Aksi / Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wargaList.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-5 text-muted">
                          <div className="d-flex flex-column align-items-center">
                            <i className="bi bi-inbox fs-1 text-secondary mb-2 opacity-50"></i>
                            <p className="mb-0 fw-semibold">Tidak ada data warga.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      wargaList.map((warga, index) => (
                        <tr key={warga.uuid}>
                          <td className="px-4 fw-bold text-secondary">{index + 1}</td>
                          <td className="fw-bold text-dark">
                            {warga.name}
                            <div className="small fw-normal mt-1">
                                {/* --- PERUBAHAN LOGIKA BADGE STATUS --- */}
                                {warga.status_warga === 'pending' && <span className="badge bg-warning text-dark"><i className="bi bi-hourglass-split me-1"></i>Pending</span>}
                                {warga.status_warga === 'verified' && <span className="badge bg-success"><i className="bi bi-check-circle-fill me-1"></i>Terverifikasi</span>}
                                {warga.status_warga === 'rejected' && <span className="badge bg-danger"><i className="bi bi-x-circle-fill me-1"></i>Ditolak</span>}
                            </div>
                          </td>
                          <td className="font-monospace text-muted">{warga.nik || '-'}</td>
                          <td>
                            <div style={{ maxWidth: "250px", whiteSpace: "normal" }} className="small text-muted">
                                {warga.alamat || '-'}
                            </div>
                          </td>
                          <td className="text-center">
                            {/* --- PERUBAHAN LOGIKA TOMBOL AKSI --- */}
                            {warga.status_warga === 'pending' ? (
                                <div className="d-flex justify-content-center gap-2">
                                    <button 
                                      onClick={() => handleValidasi(warga.uuid, warga.name, 'verified')}
                                      className="btn btn-sm btn-success rounded-pill px-3 fw-bold shadow-sm"
                                    >
                                      Setujui
                                    </button>
                                    <button 
                                      onClick={() => handleValidasi(warga.uuid, warga.name, 'rejected')}
                                      className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold"
                                    >
                                      Tolak
                                    </button>
                                </div>
                            ) : (
                                <span className="text-muted small fw-bold">
                                    {warga.status_warga === 'verified' ? 'Akses Dibuka' : 'Akses Diblokir'}
                                </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default ValidasiWarga;