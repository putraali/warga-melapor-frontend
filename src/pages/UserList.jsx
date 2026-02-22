import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMe } from "../features/authSlice";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isError, user, isLoading } = useSelector((state) => state.auth);
  
  const [isUsersLoading, setIsUsersLoading] = useState(true);

  const getUsers = async () => {
    const token = user?.accessToken || localStorage.getItem('accessToken');
    
    if (token) {
        try {
            const response = await axios.get("https://warga-melapor-backend-production.up.railway.app/users", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Gagal ambil user:", error);
        } finally {
            setIsUsersLoading(false);
        }
    } else {
        setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      navigate("/");
    }
    
    if (user) {
        if (user.role !== "admin") {
            navigate("/dashboard");
        } else {
            getUsers(); 
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError, user, navigate]);

  const deleteUser = async (userId) => {
    if (!window.confirm("Yakin ingin menghapus user ini?")) return;
    
    const token = user?.accessToken || localStorage.getItem('accessToken');

    try {
        await axios.delete(`https://warga-melapor-backend-production.up.railway.app/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        setUsers((prev) => prev.filter((u) => u.uuid !== userId));
    } catch (error) {
        console.log("Error delete:", error);
        alert("Gagal menghapus user.");
    }
  };

  const isPageLoading = isLoading || isUsersLoading || (!user && !isError);

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
                Memuat Data Pengguna...
            </h5>
        </div>
      )}

      {!isPageLoading && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold">Kelola Pengguna</h3>
            <Link to="/users/add" className="btn btn-primary">
              <i className="bi bi-person-plus-fill me-2"></i>Tambah User
            </Link>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th>No</th>
                      <th>Nama</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item, index) => (
                      <tr key={item.uuid}>
                        <td>{index + 1}</td>
                        <td className="fw-bold">{item.name}</td>
                        <td>{item.email}</td>
                        <td>
                            <span className={`badge ${
                                item.role === 'admin' ? 'bg-primary' : 
                                item.role === 'penanggung_jawab' ? 'bg-warning text-dark' : 
                                'bg-secondary'
                            }`}>
                                {item.role.replace('_', ' ')}
                            </span>
                        </td>
                        <td>
                          {/* PROTEKSI ADMIN: Sembunyikan tombol Edit & Delete jika role adalah admin */}
                          {item.role === 'admin' ? (
                            <span className="badge bg-light text-muted border py-2 px-3">
                                <i className="bi bi-shield-lock-fill me-1"></i> Dilindungi
                            </span>
                          ) : (
                            <>
                              <Link
                                to={`/users/edit/${item.uuid}`}
                                className="btn btn-sm btn-info text-white me-2"
                              >
                                <i className="bi bi-pencil-square"></i>
                              </Link>
                              <button
                                onClick={() => deleteUser(item.uuid)}
                                className="btn btn-sm btn-danger"
                              >
                                <i className="bi bi-trash-fill"></i>
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && <div className="text-center p-3 text-muted">Tidak ada data user atau gagal memuat.</div>}
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default UserList;