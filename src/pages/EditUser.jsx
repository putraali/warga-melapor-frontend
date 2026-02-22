import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getMe } from "../features/authSlice";
import Swal from 'sweetalert2';

const EditUser = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [role, setRole] = useState("");
  const [msg, setMsg] = useState("");
  
  // Kontrol Visibilitas Password & Loading Submit
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const navigate = useNavigate();
  const { id } = useParams(); 
  const dispatch = useDispatch();
  const { user, isError, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      navigate("/");
    }
    // Proteksi: Hanya Admin yang boleh mengakses halaman Edit User
    if (user && user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [isError, user, navigate]);

  useEffect(() => {
    const getUserById = async () => {
      try {
        const token = user?.accessToken || localStorage.getItem('accessToken');
        if (!token) return;

        const response = await axios.get(`https://warga-melapor-backend-production.up.railway.app/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        setName(response.data.name);
        setEmail(response.data.email);
        setRole(response.data.role);
        
      } catch (error) {
        if (error.response) {
          setMsg(error.response.data.msg);
        }
      } finally {
        setIsDataLoading(false);
      }
    };
    
    if (user && user.role === "admin") {
        getUserById();
    }
  }, [id, user]); 

  const updateUser = async (e) => {
    e.preventDefault();
    setMsg("");

    // Validasi Password Opsional
    if (password || confPassword) {
        if (password.length < 8) {
            setMsg("Keamanan rentan: Password baru minimal harus 8 karakter.");
            return;
        }
        if (password !== confPassword) {
            setMsg("Validasi gagal: Password dan Konfirmasi Password tidak cocok.");
            return;
        }
    }

    setIsSubmitting(true);
    try {
      const token = user?.accessToken || localStorage.getItem('accessToken');
      
      const payload = {
        name: name,
        email: email,
        role: role
      };

      // Hanya kirim password jika diisi
      if (password) {
          payload.password = password;
          payload.confPassword = confPassword;
      }

      await axios.patch(`https://warga-melapor-backend-production.up.railway.app/users/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data pengguna telah berhasil diperbarui.',
        confirmButtonColor: '#0d6efd',
        timer: 3000
      });
      
      navigate("/users");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg);
      } else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Gagal terhubung ke server. Silakan coba lagi.',
            confirmButtonColor: '#dc3545'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
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
                Menyiapkan Data Pengguna...
            </h5>
        </div>
      )}

      {!isPageLoading && (
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold mb-0">Edit Pengguna</h3>
                <Link to="/users" className="btn btn-primary btn-sm px-3 text-white">
                  <i className="bi bi-arrow-left me-2"></i>Kembali
                </Link>
              </div>

              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  {msg && (
                      <div className="alert alert-danger py-2 small shadow-sm border-0 border-start border-danger border-4 fade show text-center">
                          <i className="bi bi-exclamation-triangle-fill me-2"></i> {msg}
                      </div>
                  )}
                  
                  <form onSubmit={updateUser}>
                    <div className="mb-3">
                      <label className="form-label fw-bold small text-muted">Nama Lengkap</label>
                      <input 
                        type="text" 
                        className="form-control bg-light" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Nama pengguna" 
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label fw-bold small text-muted">Email</label>
                      <input 
                        type="email" 
                        className="form-control bg-light" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="email@example.com" 
                        required
                      />
                    </div>
                    
                    <hr className="my-4 text-muted" />
                    <h6 className="fw-bold mb-3 text-primary"><i className="bi bi-lock-fill me-2"></i>Ganti Kata Sandi Pengguna (Opsional)</h6>
                    
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold small text-muted">Password Baru</label>
                            <div className="position-relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="form-control bg-light pe-5" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    placeholder="Kosongkan jika tidak diubah" 
                                />
                                <span 
                                    className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                                    style={{cursor: 'pointer', zIndex: 10}}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <i className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'} fs-5`}></i>
                                </span>
                            </div>
                            <div className="form-text" style={{fontSize: '0.75rem'}}>Minimal 8 karakter.</div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold small text-muted">Konfirmasi Password</label>
                            <div className="position-relative">
                                <input 
                                    type={showConfPassword ? "text" : "password"} 
                                    className="form-control bg-light pe-5" 
                                    value={confPassword} 
                                    onChange={(e) => setConfPassword(e.target.value)} 
                                    placeholder="Ulangi password baru" 
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
                    
                    <hr className="my-4 text-muted" />
                    <div className="mb-4">
                      <label className="form-label fw-bold small text-muted">Hak Akses (Role)</label>
                      <select 
                        className="form-select bg-light" 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)}
                        required
                      >
                        <option value="penanggung_jawab">Penanggung Jawab</option>
                        <option value="warga">Warga</option>
                      </select>
                    </div>
                    
                    <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-primary px-4 fw-bold" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <span><span className="spinner-border spinner-border-sm me-2"></span>Menyimpan...</span>
                            ) : (
                                <><i className="bi bi-save me-2"></i> Perbarui Data</>
                            )}
                        </button>
                        <button type="button" onClick={() => navigate("/users")} className="btn btn-light px-4 border" disabled={isSubmitting}>
                            Batal
                        </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
      )}
    </Layout>
  );
};

export default EditUser;