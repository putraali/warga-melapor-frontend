import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { LoginUser, reset } from "../features/authSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // 1. STATE UNTUK SHOW/HIDE PASSWORD
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isError, isSuccess, isLoading, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user || isSuccess) {
      navigate("/dashboard");
    }
    dispatch(reset());
  }, [user, isSuccess, dispatch, navigate]);

  const Auth = (e) => {
    e.preventDefault();
    dispatch(LoginUser({ email, password }));
  };

  return (
    <section className="min-vh-100 d-flex align-items-center justify-content-center bg-light position-relative overflow-hidden">
      
      {/* Background Decor (Circles) */}
      <div className="position-absolute rounded-circle bg-primary opacity-10" style={{width: '300px', height: '300px', top: '-50px', left: '-50px', zIndex: 0}}></div>
      <div className="position-absolute rounded-circle bg-warning opacity-10" style={{width: '200px', height: '200px', bottom: '-50px', right: '-50px', zIndex: 0}}></div>

      <div className="container" style={{zIndex: 1}}>
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="row g-0">
                
                {/* KIRI: IMAGE / BRANDING */}
                <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center text-white p-5" 
                     style={{background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)'}}>
                  <div className="text-center">
                    <div className="mb-4">
                      <img src="/Logolaporpakwhite.png" alt="Logo Lapor Pak" style={{ width: '120px', height: 'auto' }} />
                    </div>
                    <p className="small opacity-75">
                      Sistem pelaporan aspirasi dan pengaduan masyarakat yang transparan dan terpercaya.
                    </p>
                  </div>
                </div>

                {/* KANAN: FORM LOGIN */}
                <div className="col-md-6 bg-white p-5">
                  <div className="text-center mb-4 d-md-none">
                     <h3 className="fw-bold text-primary">Warga Melapor</h3>
                  </div>
                  
                  <h4 className="fw-bold text-dark mb-1">Selamat Datang Kembali</h4>
                  <p className="text-muted small mb-4">Silakan masuk dengan akun Anda.</p>

                  {isError && (
                    <div className="alert alert-danger py-2 small shadow-sm border-0 border-start border-danger border-4">
                      <i className="bi bi-exclamation-circle me-2"></i> {message}
                    </div>
                  )}

                  <form onSubmit={Auth}>
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
                      <label htmlFor="emailInput">Email Address</label>
                    </div>

                    {/* 2. PASSWORD INPUT DENGAN ICON */}
                    <div className="form-floating mb-3 position-relative">
                      <input 
                        // Ubah type text/password berdasarkan state
                        type={showPassword ? "text" : "password"} 
                        className="form-control bg-light border-0 pe-5" // pe-5 agar teks tidak tertutup icon
                        id="passwordInput" 
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <label htmlFor="passwordInput">Password</label>
                      
                      {/* Icon Mata */}
                      <span 
                        className="position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer text-muted"
                        style={{cursor: 'pointer', zIndex: 10}}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                            <i className="bi bi-eye fs-5"></i>
                        ) : (
                            <i className="bi bi-eye-slash fs-5"></i>
                        )}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="rememberMe" />
                        <label className="form-check-label text-muted small" htmlFor="rememberMe">
                          Ingat Saya
                        </label>
                      </div>
                      <a href="/forgot-password" className="text-decoration-none small fw-bold">Lupa Password?</a>
                    </div>

                    <div className="d-grid mb-4">
                      <button type="submit" className="btn btn-primary btn-lg rounded-3 fs-6 fw-bold shadow-sm">
                        {isLoading ? (
                            <span><span className="spinner-border spinner-border-sm me-2"></span>Loading...</span>
                        ) : 'Masuk Sekarang'}
                      </button>
                    </div>

                    <div className="text-center">
                      <p className="text-muted small mb-0">
                        Belum punya akun? <Link to="/register" className="fw-bold text-primary text-decoration-none">Daftar disini</Link>
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

export default Login;