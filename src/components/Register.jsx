import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);
  const navigate = useNavigate();

  const saveUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post("https://warga-melapor-backend-production.up.railway.app/register", {
        name: name,
        email: email,
        password: password,
        confPassword: confPassword,
      });
      navigate("/");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-vh-100 d-flex align-items-center justify-content-center bg-light position-relative overflow-hidden">
      
      {/* Background Decor (Konsisten dengan Login & Forgot Password) */}
      <div className="position-absolute rounded-circle bg-primary opacity-10" style={{width: '300px', height: '300px', top: '-50px', left: '-50px', zIndex: 0}}></div>
      <div className="position-absolute rounded-circle bg-warning opacity-10" style={{width: '200px', height: '200px', bottom: '-50px', right: '-50px', zIndex: 0}}></div>

      <div className="container" style={{zIndex: 1}}>
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="row g-0">
                
                {/* KIRI: BRANDING & INFO */}
                <div className="col-md-5 d-none d-md-flex flex-column align-items-center justify-content-center text-white p-5" 
                     style={{background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)'}}>
                  <div className="text-center">
                     <div className="mb-4">
                      <img src="/Logolaporpakwhite.png" alt="Logo Lapor Pak" style={{ width: '120px', height: 'auto' }} />
                    </div>
                    <h3 className="fw-bold mb-3">Bergabunglah!</h3>
                    <p className="small opacity-75 mb-0">
                      Jadilah bagian dari perubahan. Laporkan masalah lingkungan Anda dan pantau penyelesaiannya secara transparan.
                    </p>
                  </div>
                </div>

                {/* KANAN: FORM REGISTER */}
                <div className="col-md-7 bg-white p-5">
                  <div className="text-center mb-4 d-md-none">
                      <h3 className="fw-bold fw-italic text-primary">Warga Melapor</h3>
                  </div>
                  
                  <h4 className="fw-bold text-dark mb-1">Buat Akun Baru</h4>
                  <p className="text-muted small mb-4">Lengkapi data diri Anda untuk mendaftar.</p>

                  {msg && (
                    <div className="alert alert-danger py-2 small shadow-sm border-0 border-start border-danger border-4 fade show">
                      <i className="bi bi-exclamation-circle me-2"></i> {msg}
                    </div>
                  )}

                  <form onSubmit={saveUser}>
                    
                    {/* Input Nama */}
                    <div className="form-floating mb-3">
                      <input 
                        type="text" 
                        className="form-control bg-light border-0" 
                        id="nameInput" 
                        placeholder="Nama Lengkap"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                      <label htmlFor="nameInput">Nama Lengkap</label>
                    </div>

                    {/* Input Email */}
                    <div className="form-floating mb-3">
                      <input 
                        type="email" 
                        className="form-control bg-light border-0" 
                        id="emailInput" 
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <label htmlFor="emailInput">Alamat Email</label>
                    </div>

                    {/* PASSWORD INPUTS */}
                    <div className="row g-2">
                        {/* 1. PASSWORD INPUT */}
                        <div className="col-md-6">
                            <div className="form-floating mb-3 position-relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="form-control bg-light border-0 pe-5" 
                                    id="passInput" 
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <label htmlFor="passInput">Password</label>
                                {/* Icon Mata Password */}
                                <span 
                                    className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                                    style={{cursor: 'pointer', zIndex: 10}}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <i className="bi bi-eye fs-5"></i> : <i className="bi bi-eye-slash fs-5"></i>}
                                </span>
                            </div>
                        </div>

                        {/* 2. CONFIRM PASSWORD INPUT */}
                        <div className="col-md-6">
                            <div className="form-floating mb-3 position-relative">
                                <input 
                                    type={showConfPassword ? "text" : "password"} 
                                    className="form-control bg-light border-0 pe-5" 
                                    id="confPassInput" 
                                    placeholder="Konfirmasi"
                                    value={confPassword}
                                    onChange={(e) => setConfPassword(e.target.value)}
                                    required
                                />
                                <label htmlFor="confPassInput">Konfirmasi</label>
                                {/* Icon Mata Konfirmasi */}
                                <span 
                                    className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                                    style={{cursor: 'pointer', zIndex: 10}}
                                    onClick={() => setShowConfPassword(!showConfPassword)}
                                >
                                    {showConfPassword ? <i className="bi bi-eye fs-5"></i> : <i className="bi bi-eye-slash fs-5"></i>}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="form-check mb-4">
                        <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" required />
                        <label className="form-check-label text-muted small" htmlFor="flexCheckDefault">
                            Saya menyetujui <Link to="#" className="text-decoration-none">Syarat & Ketentuan</Link>
                        </label>
                    </div>

                    <div className="d-grid mb-4">
                      <button type="submit" className="btn btn-primary btn-lg rounded-3 fs-6 fw-bold shadow-sm" disabled={isLoading}>
                        {isLoading ? (
                            <span><span className="spinner-border spinner-border-sm me-2"></span>Memproses...</span>
                        ) : 'Daftar Sekarang'}
                      </button>
                    </div>

                    <div className="text-center">
                      <p className="text-muted small mb-0">
                        Sudah punya akun? <Link to="/" className="fw-bold text-primary text-decoration-none">Masuk disini</Link>
                      </p>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;