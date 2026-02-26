import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getMe } from "../features/authSlice";

const AddUser = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [role, setRole] = useState("warga");
  
  // --- TAMBAHAN BARU: State untuk RW ---
  const [rw, setRw] = useState(""); 
  
  const [msg, setMsg] = useState("");
  
  // State untuk Loading Submit & Eye Icon
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Ekstrak data & status loading dari Redux
  const { user, isError, isLoading } = useSelector((state) => state.auth);

  // Cek sesi login saat halaman dimuat
  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  // Tendang ke halaman login jika error/belum login
  useEffect(() => {
    if (isError) {
      navigate("/");
    }
  }, [isError, navigate]);

  const saveUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Aktifkan animasi loading saat submit
    setMsg("");

    try {
      const token = user?.accessToken || localStorage.getItem('accessToken');
      
      await axios.post("https://warga-melapor-backend-production.up.railway.app/users",{
        name: name,
        email: email,
        password: password,
        confPassword: confPassword,
        role: role,
        rw: role === "ketua_rw" ? rw : null, // --- TAMBAHAN BARU: Kirim data RW jika rolenya ketua_rw ---
      }, {
        headers: {
            Authorization: `Bearer ${token}` 
        }
      });
      
      navigate("/users");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg);
      } else {
        setMsg("Terjadi kesalahan sistem. Tidak dapat terhubung ke server.");
      }
      setIsSubmitting(false); // Matikan loading form jika gagal
    }
  };

  // Logika Loading Awal (Halaman pertama kali dimuat)
  const isPageLoading = isLoading || (!user && !isError);

  return (
    <Layout>
      {/* --- 1. OVERLAY LOADING AWAL HALAMAN --- */}
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
                Menyiapkan Halaman...
            </h5>
        </div>
      )}

      {/* --- 2. OVERLAY LOADING SAAT TOMBOL SUBMIT DITEKAN --- */}
      {isSubmitting && (
        <div 
            className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center" 
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', zIndex: 9999, backdropFilter: 'blur(3px)' }}
        >
            <div className="position-relative d-flex justify-content-center align-items-center" style={{ width: '120px', height: '120px' }}>
                <img 
                    src="/Logolaporpak.png" 
                    alt="Menyimpan data..." 
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
                Menyimpan Akun...
            </h5>
        </div>
      )}

      {/* --- KONTEN FORM (Tampil setelah loading halaman selesai) --- */}
      {!isPageLoading && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold">Tambah Akun Baru</h3>
          </div>
          <div className="card shadow-sm border-0 mb-5">
            <div className="card-body p-4">
              {msg && (
                  <div className="alert alert-danger py-2 small shadow-sm border-0 border-start border-danger border-4">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i> {msg}
                  </div>
              )}
              
              <form onSubmit={saveUser}>
                <div className="mb-3">
                  <label className="form-label fw-bold text-muted small">Nama Lengkap</label>
                  <input 
                    type="text" 
                    className="form-control bg-light" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-bold text-muted small">Email</label>
                  <input 
                    type="email" 
                    className="form-control bg-light" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>

                <div className="row">
                    {/* PASSWORD FIELD DENGAN ICON EYE */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold text-muted small">Password</label>
                        <div className="position-relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="form-control bg-light pe-5" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                            <span 
                                className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                                style={{cursor: 'pointer', zIndex: 10}}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'} fs-5`}></i>
                            </span>
                        </div>
                    </div>

                    {/* CONFIRM PASSWORD FIELD DENGAN ICON EYE */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold text-muted small">Konfirmasi Password</label>
                        <div className="position-relative">
                            <input 
                                type={showConfPassword ? "text" : "password"} 
                                className="form-control bg-light pe-5" 
                                value={confPassword} 
                                onChange={(e) => setConfPassword(e.target.value)} 
                                required 
                            />
                            <span 
                                className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                                style={{cursor: 'pointer', zIndex: 10}}
                                onClick={() => setShowConfPassword(!showConfPassword)}
                            >
                                <i className={`bi ${showConfPassword ? 'bi-eye' : 'bi-eye-slash'} fs-5`}></i>
                            </span>
                        </div>
                    </div>
                </div>

                {/* OPSI ROLE (TANPA ADMIN) */}
                <div className="mb-4 mt-2">
                  <label className="form-label fw-bold text-muted small">Hak Akses (Role)</label>
                  <select 
                    className="form-select bg-light" 
                    value={role} 
                    onChange={(e) => {
                        setRole(e.target.value);
                        // Reset nilai RW jika user mengganti role dari ketua_rw ke yang lain
                        if (e.target.value !== "ketua_rw") {
                            setRw("");
                        }
                    }}
                  >
                    <option value="warga">Warga</option>
                    <option value="ketua_rw">Ketua RW</option>
                    <option value="penanggung_jawab">Penanggung Jawab (Petugas)</option>
                  </select>
                </div>

                {/* --- TAMBAHAN BARU: MUNCUL HANYA JIKA ROLE == KETUA RW --- */}
                {role === "ketua_rw" && (
                    <div className="mb-4 p-3 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded">
                        <label className="form-label fw-bold text-primary small">
                            <i className="bi bi-geo-alt-fill me-1"></i> Pilih Wilayah RW
                        </label>
                        <select 
                            className="form-select bg-white" 
                            value={rw} 
                            onChange={(e) => setRw(e.target.value)} 
                            required={role === "ketua_rw"} // Wajib diisi jika rolenya ketua_rw
                        >
                            <option value="" disabled>-- Pilih RW yang dipimpin --</option>
                            {[...Array(12)].map((_, index) => (
                                <option key={index + 1} value={`RW ${index + 1}`}>
                                    RW {index + 1}
                                </option>
                            ))}
                        </select>
                        <div className="form-text mt-2 small text-muted">
                            <i className="bi bi-info-circle me-1"></i> 
                            Ketua RW hanya akan bisa melihat dan memvalidasi warga yang mendaftar di wilayah RW yang dipilih ini.
                        </div>
                    </div>
                )}

                <hr className="text-muted my-4" />

                {/* TOMBOL SUBMIT */}
                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary px-4 fw-bold" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <span><span className="spinner-border spinner-border-sm me-2"></span>Menyimpan...</span>
                        ) : (
                            <><i className="bi bi-save me-2"></i> Simpan Akun</>
                        )}
                    </button>
                    <button type="button" onClick={() => navigate("/users")} className="btn btn-light px-4 border" disabled={isSubmitting}>
                        Batal
                    </button>
                </div>
                
              </form>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default AddUser;