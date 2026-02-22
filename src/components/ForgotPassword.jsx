import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const ForgotPassword = () => {
  // State untuk mengontrol langkah form (1: Email, 2: OTP, 3: Password Baru)
  const [step, setStep] = useState(1);
  
  // State Input
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  
  // State UI & Feedback
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // --- LANGKAH 1: KIRIM EMAIL UNTUK MINTA OTP ---
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    
    try {
      const response = await axios.post("https://warga-melapor-backend-production.up.railway.app/forgot-password/request-otp", { email });
      setIsError(false);
      setMessage(response.data.msg || "Kode OTP telah dikirim ke email Anda.");
      
      // Notifikasi Sukses SweetAlert2
      Swal.fire({
        icon: 'success',
        title: 'OTP Terkirim',
        text: 'Silakan periksa kotak masuk email Anda.',
        confirmButtonColor: '#0d6efd'
      });
      
      setStep(2); // Lanjut ke langkah OTP
    } catch (error) {
      setIsError(true);
      const errorMsg = error.response?.data?.msg || "Gagal mengirim OTP. Pastikan email terdaftar.";
      setMessage(errorMsg);
      
      // Notifikasi Error SweetAlert2
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: errorMsg,
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- LANGKAH 2: VERIFIKASI OTP ---
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await axios.post("https://warga-melapor-backend-production.up.railway.app/forgot-password/verify-otp", { email, otp });
      setIsError(false);
      setMessage(response.data.msg || "OTP Valid! Silakan buat password baru.");
      setStep(3); // Lanjut ke langkah Reset Password
    } catch (error) {
      setIsError(true);
      const errorMsg = error.response?.data?.msg || "Kode OTP salah atau sudah kedaluwarsa.";
      setMessage(errorMsg);
      
      Swal.fire({
        icon: 'warning',
        title: 'Verifikasi Gagal',
        text: errorMsg,
        confirmButtonColor: '#ffc107'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- LANGKAH 3: SIMPAN PASSWORD BARU ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confPassword) {
      setIsError(true);
      setMessage("Password dan Konfirmasi Password tidak cocok.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      await axios.post("https://warga-melapor-backend-production.up.railway.app/forgot-password/reset", { 
        email, 
        otp, 
        newPassword 
      });
      
      // Notifikasi Sukses Final & Redirect
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Password Anda telah diperbarui. Silakan login kembali.',
        confirmButtonColor: '#198754'
      }).then(() => {
        navigate("/"); // Arahkan kembali ke halaman login setelah user menekan OK
      });

    } catch (error) {
      setIsError(true);
      const errorMsg = error.response?.data?.msg || "Gagal mengubah password.";
      setMessage(errorMsg);
      
      Swal.fire({
        icon: 'error',
        title: 'Kesalahan',
        text: errorMsg,
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-vh-100 d-flex align-items-center justify-content-center bg-light position-relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="position-absolute rounded-circle bg-primary opacity-10" style={{width: '300px', height: '300px', top: '-50px', left: '-50px', zIndex: 0}}></div>
      <div className="position-absolute rounded-circle bg-warning opacity-10" style={{width: '200px', height: '200px', bottom: '-50px', right: '-50px', zIndex: 0}}></div>

      <div className="container" style={{zIndex: 1}}>
        <div className="row justify-content-center">
          <div className="col-md-11 col-lg-9">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="row g-0">
                
                {/* KIRI: BRANDING & INFO */}
                <div className="col-md-5 d-none d-md-flex flex-column align-items-center justify-content-center text-white p-5" 
                     style={{background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)'}}>
                  <div className="text-center">
                    <div className="mb-4">
                      <img src="/Logolaporpakwhite.png" alt="Logo Lapor Pak" style={{ width: '120px', height: 'auto' }} />
                    </div>
                    <h2 className="fw-bold mb-3">Lupa Sandi?</h2>
                    <p className="small opacity-75 mb-4">
                      Kami menggunakan sistem verifikasi OTP (One-Time Password) untuk memastikan keamanan akun Anda tetap terjaga.
                    </p>
                  </div>
                </div>

                {/* KANAN: FORM MULTI-STEP */}
                <div className="col-md-7 bg-white p-5">
                  <div className="text-center mb-4 d-md-none">
                      <h3 className="fw-bold fw-italic text-primary">Warga Melapor</h3>
                  </div>
                  
                  <h4 className="fw-bold text-dark mb-1">
                    {step === 1 && "Pulihkan Akun"}
                    {step === 2 && "Verifikasi OTP"}
                    {step === 3 && "Buat Password Baru"}
                  </h4>
                  <p className="text-muted small mb-4">
                    {step === 1 && "Masukkan email Anda untuk menerima kode OTP."}
                    {step === 2 && `Masukkan 6 digit kode yang dikirim ke ${email}`}
                    {step === 3 && "Pastikan password baru Anda kuat (min. 8 karakter)."}
                  </p>

                  {/* Pesan Alert Inline (Tetap ada sebagai panduan cepat) */}
                  {message && (
                    <div className={`alert py-2 small shadow-sm border-0 border-start border-4 fade show ${isError ? 'alert-danger border-danger' : 'alert-success border-success'}`}>
                      <i className={`bi ${isError ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'} me-2`}></i> {message}
                    </div>
                  )}

                  {/* ================= FORM STEP 1: MINTA OTP ================= */}
                  {step === 1 && (
                    <form onSubmit={handleRequestOTP}>
                      <div className="form-floating mb-4">
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
                      <div className="d-grid mb-4">
                        <button type="submit" className="btn btn-primary btn-lg rounded-3 fs-6 fw-bold shadow-sm" disabled={isLoading}>
                          {isLoading ? <span><span className="spinner-border spinner-border-sm me-2"></span>Memproses...</span> : 'Kirim Kode OTP'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* ================= FORM STEP 2: INPUT OTP ================= */}
                  {step === 2 && (
                    <form onSubmit={handleVerifyOTP}>
                      <div className="form-floating mb-4">
                        <input 
                          type="text" 
                          className="form-control bg-light border-0 text-center fs-4 letter-spacing-2 fw-bold" 
                          id="otpInput" 
                          placeholder="123456"
                          maxLength="6"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Hanya angka
                          required
                        />
                        <label htmlFor="otpInput">Kode OTP (6 Digit)</label>
                      </div>
                      <div className="d-grid gap-2 mb-4">
                        <button type="submit" className="btn btn-primary btn-lg rounded-3 fs-6 fw-bold shadow-sm" disabled={isLoading || otp.length < 6}>
                          {isLoading ? <span><span className="spinner-border spinner-border-sm me-2"></span>Memverifikasi...</span> : 'Verifikasi OTP'}
                        </button>
                        <button type="button" onClick={() => setStep(1)} className="btn btn-light rounded-3 text-muted small" disabled={isLoading}>
                          Salah email? Kembali
                        </button>
                      </div>
                    </form>
                  )}

                  {/* ================= FORM STEP 3: RESET PASSWORD ================= */}
                  {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                      <div className="row g-2">
                        <div className="col-md-6">
                            <div className="form-floating mb-3 position-relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="form-control bg-light border-0 pe-5" 
                                    id="newPassInput" 
                                    placeholder="Password Baru"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <label htmlFor="newPassInput">Password Baru</label>
                                <span 
                                    className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                                    style={{cursor: 'pointer', zIndex: 10}}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {/* LOGIKA IKON DIPERBAIKI: Eye-slash saat tersembunyi (false) */}
                                    <i className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'} fs-5`}></i>
                                </span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-floating mb-4 position-relative">
                                <input 
                                    type={showConfPassword ? "text" : "password"} 
                                    className="form-control bg-light border-0 pe-5" 
                                    id="confNewPassInput" 
                                    placeholder="Konfirmasi"
                                    value={confPassword}
                                    onChange={(e) => setConfPassword(e.target.value)}
                                    required
                                />
                                <label htmlFor="confNewPassInput">Konfirmasi</label>
                                <span 
                                    className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                                    style={{cursor: 'pointer', zIndex: 10}}
                                    onClick={() => setShowConfPassword(!showConfPassword)}
                                >
                                    {/* LOGIKA IKON DIPERBAIKI: Eye-slash saat tersembunyi (false) */}
                                    <i className={`bi ${showConfPassword ? 'bi-eye' : 'bi-eye-slash'} fs-5`}></i>
                                </span>
                            </div>
                        </div>
                      </div>
                      <div className="d-grid mb-4">
                        <button type="submit" className="btn btn-success btn-lg rounded-3 fs-6 fw-bold shadow-sm" disabled={isLoading}>
                          {isLoading ? <span><span className="spinner-border spinner-border-sm me-2"></span>Menyimpan...</span> : 'Simpan Password Baru'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Navigasi Kembali (Sembunyikan saat di tahap ganti password agar fokus) */}
                  {step !== 3 && (
                    <div className="text-center">
                      <p className="text-muted small mb-0">
                        Sudah ingat password Anda? <Link to="/" className="fw-bold text-primary text-decoration-none">Masuk disini</Link>
                      </p>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;