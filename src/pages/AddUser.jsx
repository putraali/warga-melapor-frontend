import React, { useState } from "react";
import Layout from "./Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AddUser = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [role, setRole] = useState("warga");
  const [msg, setMsg] = useState("");
  
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const saveUser = async (e) => {
    e.preventDefault();
    try {
      // --- PERBAIKAN UTAMA DI SINI ---
      // Ambil token dari user.accessToken ATAU langsung dari localStorage (Cadangan)
      const token = user?.accessToken || localStorage.getItem('accessToken');
      
      console.log("Token yang dikirim:", token); // Cek di Console browser

      await axios.post("https://warga-melapor-backend-production.up.railway.app/users",{
        name: name,
        email: email,
        password: password,
        confPassword: confPassword,
        role: role,
      }, {
        headers: {
            // Pastikan tidak mengirim "Bearer undefined"
            Authorization: `Bearer ${token}` 
        }
      });
      
      navigate("/users");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg);
      } else {
        setMsg("Terjadi kesalahan sistem");
      }
    }
  };

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Tambah Akun Baru</h3>
      </div>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          {msg && <div className="alert alert-danger">{msg}</div>}
          
          <form onSubmit={saveUser}>
            {/* ... (Input form lainnya sama seperti sebelumnya) ... */}
            
            <div className="mb-3">
              <label className="form-label fw-bold">Name</label>
              <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            
            <div className="mb-3">
              <label className="form-label fw-bold">Email</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Password</label>
                    <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Confirm Password</label>
                    <input type="password" className="form-control" value={confPassword} onChange={(e) => setConfPassword(e.target.value)} required />
                </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Role</label>
              <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="warga">Warga</option>
                <option value="penanggung_jawab">Penanggung Jawab</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button type="submit" className="btn btn-success px-4">Save</button>
            <button type="button" onClick={() => navigate("/users")} className="btn btn-secondary px-4 ms-2">Cancel</button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddUser;