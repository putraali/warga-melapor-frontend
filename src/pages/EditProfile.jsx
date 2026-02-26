import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getMe } from "../features/authSlice";

// --- IMPORT SWEETALERT2 ---
import Swal from 'sweetalert2';

const EditProfile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // State untuk NIK, Alamat, dan RW
  const [nik, setNik] = useState("");
  const [alamat, setAlamat] = useState("");
  const [rw, setRw] = useState("");

  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [file, setFile] = useState(null); 
  const [preview, setPreview] = useState(""); 
  const [msg, setMsg] = useState("");
  
  const [removePhoto, setRemovePhoto] = useState(false); 
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isError, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
        navigate("/");
    }
  }, [isError, navigate]);

  useEffect(() => {
    const getMyProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        if (user && user.uuid && token) {
            const response = await axios.get(`https://warga-melapor-backend-production.up.railway.app/users/${user.uuid}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setName(response.data.name);
            setEmail(response.data.email);
            setPreview(response.data.url);
            
            // Set data NIK, Alamat, dan RW dari database (jika ada nilainya)
            setNik(response.data.nik || "");
            setAlamat(response.data.alamat || "");
            setRw(response.data.rw || "");
        }
      } catch (error) {
        console.log("Gagal ambil profil:", error);
      } finally {
        setIsDataLoading(false);
      }
    };

    if (user) {
        getMyProfile();
    }
  }, [user]); 

  const loadImage = (e) => {
    const image = e.target.files[0];
    if (image) {
        setFile(image);
        setPreview(URL.createObjectURL(image));
        setRemovePhoto(false); 
    }
  };

  const handleRemovePhoto = () => {
    setFile(null);        
    setPreview("");       
    setRemovePhoto(true); 
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setMsg("");

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
    const token = localStorage.getItem('accessToken');
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    
    // Append NIK, Alamat, dan RW ke FormData
    formData.append("nik", nik);
    formData.append("alamat", alamat);
    formData.append("rw", rw);
    
    if (password) {
        formData.append("password", password);
        formData.append("confPassword", confPassword);
    }
    
    if (file) {
        formData.append("file", file);
    }

    if (removePhoto) {
        formData.append("removePhoto", "true");
    }

    try {
      await axios.patch(`https://warga-melapor-backend-production.up.railway.app/users/${user.uuid}`, formData, {
        headers: { 
            Authorization: `Bearer ${token}`,
            "Content-type": "multipart/form-data" 
        }
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Profil Anda telah berhasil diperbarui.',
        confirmButtonColor: '#0d6efd',
        timer: 3000
      });
      
      dispatch(getMe()); 
      setPassword("");
      setConfPassword("");
      setRemovePhoto(false); 
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
                Menyiapkan Profil...
            </h5>
        </div>
      )}

      {!isPageLoading && (
          <div className="row justify-content-center">
            <div className="col-md-8">
                <h3 className="fw-bold mb-4">Edit Profil Saya</h3>

                <div className="card shadow-sm border-0 mb-5">
                    <div className="card-body p-4">
                    
                    {msg && (
                        <div className="alert alert-danger py-2 small shadow-sm border-0 border-start border-danger border-4 fade show text-center">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i> {msg}
                        </div>
                    )}

                    <form onSubmit={updateProfile}>
                        {/* BAGIAN FOTO */}
                        <div className="text-center mb-4">
                            <div className="mb-3">
                                {preview ? (
                                    <img src={preview} alt="Profile" className="rounded-circle object-fit-cover border border-3 border-light shadow-sm" style={{width: '120px', height: '120px'}} />
                                ) : (
                                    <div className="bg-secondary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{width: '120px', height: '120px'}}>
                                        <i className="bi bi-person-fill fs-1 text-secondary"></i>
                                    </div>
                                )}
                            </div>
                            
                            <div className="d-flex justify-content-center gap-2">
                                <label htmlFor="upload-photo" className="btn btn-sm btn-outline-primary rounded-pill cursor-pointer mb-0">
                                    <i className="bi bi-camera me-2"></i>Ganti Foto
                                </label>
                                <input 
                                    id="upload-photo"
                                    type="file" 
                                    className="d-none" 
                                    onChange={loadImage}
                                    accept="image/*"
                                />
                                {preview && (
                                    <button 
                                        type="button" 
                                        onClick={handleRemovePhoto} 
                                        className="btn btn-sm btn-outline-danger rounded-pill"
                                    >
                                        <i className="bi bi-trash me-2"></i>Hapus Foto
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* INPUT FORM - NAMA */}
                        <div className="mb-3">
                            <label className="form-label fw-bold small text-muted">Nama Lengkap</label>
                            <input 
                                type="text" 
                                className="form-control bg-light" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                required
                            />
                        </div>

                        {/* INPUT FORM - EMAIL */}
                        <div className="mb-3">
                            <label className="form-label fw-bold small text-muted">Email</label>
                            <input 
                                type="email" 
                                className="form-control bg-light" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required
                            />
                        </div>

                        {/* --- NIK & ALAMAT (Hanya tampil untuk Warga/Petugas, DIBLOKIR untuk Admin & Ketua RW) --- */}
                        {user?.role !== "admin" && user?.role !== "ketua_rw" && (
                            <>
                                <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted">NIK (Nomor Induk Kependudukan)</label>
                                    <input 
                                        type="text" 
                                        className="form-control bg-light" 
                                        value={nik} 
                                        onChange={(e) => setNik(e.target.value)} 
                                        required
                                        placeholder="Masukkan 16 digit NIK"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted">Alamat Lengkap</label>
                                    <textarea 
                                        className="form-control bg-light" 
                                        value={alamat} 
                                        onChange={(e) => setAlamat(e.target.value)} 
                                        rows="3"
                                        required
                                        placeholder="Masukkan detail alamat (Jalan, RT, dll)"
                                    ></textarea>
                                </div>
                            </>
                        )}

                        {/* --- INPUT RW (Tampil untuk selain Admin. Jika Ketua RW, maka dropdown di-disable) --- */}
                        {user?.role !== "admin" && (
                            <div className="mb-3">
                                <label className="form-label fw-bold small text-muted">
                                    {user?.role === "ketua_rw" ? "Wilayah RW (Tidak dapat diubah)" : "Pilih RW"}
                                </label>
                                <select 
                                    className="form-select bg-light" 
                                    value={rw} 
                                    onChange={(e) => setRw(e.target.value)} 
                                    required
                                    disabled={user?.role === "ketua_rw"} // Kunci RW jika user adalah Ketua RW
                                >
                                    <option value="" disabled>-- Pilih RW --</option>
                                    {[...Array(12)].map((_, index) => (
                                        <option key={index + 1} value={`RW ${index + 1}`}>
                                            RW {index + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* --- UBAH PASSWORD (Bisa diakses oleh semua KECUALI Admin) --- */}
                        {user?.role !== "admin" && (
                            <>
                                <hr className="my-4 text-muted" />
                                <h6 className="fw-bold mb-3 text-primary"><i className="bi bi-lock-fill me-2"></i>Ganti Kata Sandi (Opsional)</h6>
                                
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold small text-muted">Password Baru</label>
                                        <div className="position-relative">
                                            <input 
                                                type={showPassword ? "text" : "password"} 
                                                className="form-control bg-light pe-5" 
                                                value={password} 
                                                onChange={(e) => setPassword(e.target.value)} 
                                                placeholder="Biarkan kosong jika tidak diubah" 
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
                            </>
                        )}

                        <div className="d-flex gap-2 mt-4">
                            <button type="submit" className="btn btn-primary px-4 fw-bold" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <span><span className="spinner-border spinner-border-sm me-2"></span>Menyimpan...</span>
                                ) : (
                                    <><i className="bi bi-save me-2"></i> Simpan Profil</>
                                )}
                            </button>
                            <button type="button" onClick={() => navigate("/dashboard")} className="btn btn-light px-4 border" disabled={isSubmitting}>
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

export default EditProfile;