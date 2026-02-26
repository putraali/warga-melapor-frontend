import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMe } from "../features/authSlice";

// --- IMPORT SWEETALERT2 ---
import Swal from "sweetalert2";

const UserList = () => {
  // State untuk menyimpan semua data asli dari API
  const [allUsers, setAllUsers] = useState([]);
  
  // State untuk menyimpan data yang ditampilkan di tabel setelah difilter
  const [displayedUsers, setDisplayedUsers] = useState([]);
  
  // State untuk menyimpan nilai filter yang sedang aktif
  const [roleFilter, setRoleFilter] = useState("all");

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
            setAllUsers(response.data);
            setDisplayedUsers(response.data); // Awalnya, tampilkan semua
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

  // --- FUNGSI FILTER BERDASARKAN ROLE ---
  const handleFilterChange = (e) => {
    const selectedRole = e.target.value;
    setRoleFilter(selectedRole);

    if (selectedRole === "all") {
        setDisplayedUsers(allUsers); // Kembalikan ke semua data
    } else {
        const filtered = allUsers.filter(u => u.role === selectedRole);
        setDisplayedUsers(filtered); // Tampilkan hasil filter
    }
  };

  // --- FUNGSI DELETE DENGAN SWEETALERT2 ---
  const deleteUser = async (userId) => {
    const confirmResult = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Data pengguna yang dihapus tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545', 
        cancelButtonColor: '#6c757d',  
        confirmButtonText: '<i class="bi bi-trash-fill me-2"></i>Ya, Hapus!',
        cancelButtonText: 'Batal',
        reverseButtons: true 
    });

    if (!confirmResult.isConfirmed) return;
    
    const token = user?.accessToken || localStorage.getItem('accessToken');

    try {
        await axios.delete(`https://warga-melapor-backend-production.up.railway.app/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        const updatedAllUsers = allUsers.filter((u) => u.uuid !== userId);
        setAllUsers(updatedAllUsers);
        
        if (roleFilter === "all") {
             setDisplayedUsers(updatedAllUsers);
        } else {
             setDisplayedUsers(updatedAllUsers.filter(u => u.role === roleFilter));
        }

        Swal.fire({
            title: 'Terhapus!',
            text: 'Data pengguna berhasil dihapus secara permanen.',
            icon: 'success',
            confirmButtonColor: '#0d6efd',
            timer: 2500 
        });

    } catch (error) {
        console.log("Error delete:", error);
        Swal.fire({
            title: 'Gagal!',
            text: 'Terjadi kesalahan saat menghapus data pengguna.',
            icon: 'error',
            confirmButtonColor: '#0d6efd'
        });
    }
  };

  const isPageLoading = isLoading || isUsersLoading || (!user && !isError);

  return (
    <Layout>
      {/* OVERLAY LOADING DIKEMBALIKAN KE VERSI ASLI ANDA */}
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
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
            <div>
                <h3 className="fw-bold mb-0">Kelola Pengguna</h3>
                <small className="text-muted">Menampilkan: {displayedUsers.length} Pengguna</small>
            </div>
            <div className="d-flex gap-2 mt-3 mt-md-0">
                <Link to="/users/add" className="btn btn-primary shadow-sm rounded-pill px-4 fw-bold">
                  <i className="bi bi-person-plus-fill me-2"></i>Tambah User Baru
                </Link>
            </div>
          </div>

          {/* --- FITUR FILTER ROLE --- */}
          <div className="card mb-4 border-0 shadow-sm bg-white rounded-4">
              <div className="card-body py-3 px-4 d-flex align-items-center gap-3">
                  <label className="fw-bold text-secondary mb-0"><i className="bi bi-funnel-fill me-2"></i>Filter Role:</label>
                  <select 
                      className="form-select w-auto shadow-sm" 
                      value={roleFilter} 
                      onChange={handleFilterChange}
                      style={{ minWidth: '200px' }}
                  >
                      <option value="all">Semua Role</option>
                      <option value="admin">Admin</option>
                      <option value="penanggung_jawab">Petugas (Penanggung Jawab)</option>
                      <option value="ketua_rw">Ketua RW</option>
                      <option value="warga">Warga</option>
                  </select>
              </div>
          </div>

          <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="text-secondary ps-4 py-3">No</th>
                      <th className="text-secondary py-3">Nama</th>
                      <th className="text-secondary py-3">Email</th>
                      <th className="text-secondary py-3">Role</th>
                      <th className="text-secondary py-3 pe-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="border-top-0">
                    {displayedUsers.map((item, index) => (
                      <tr key={item.uuid}>
                        <td className="ps-4 fw-bold text-secondary">{index + 1}</td>
                        <td>
                            <div className="fw-bold text-dark">{item.name}</div>
                        </td>
                        <td>
                            <div className="text-muted small">{item.email}</div>
                        </td>
                        <td>
                            <span className={`badge text-uppercase px-3 py-2 rounded-pill shadow-sm ${
                                item.role === 'admin' ? 'bg-primary' : 
                                item.role === 'penanggung_jawab' ? 'bg-warning text-dark' : 
                                item.role === 'ketua_rw' ? 'bg-info text-dark' :
                                'bg-secondary'
                            }`}>
                                {item.role.replace('_', ' ')}
                            </span>
                        </td>
                        <td className="pe-4 text-center">
                          <div className="d-flex justify-content-center gap-2">
                              {item.role === 'admin' ? (
                                <span className="badge bg-light text-muted border py-2 px-3 rounded-pill shadow-sm">
                                    <i className="bi bi-shield-lock-fill me-1"></i> Dilindungi
                                </span>
                              ) : (
                                <>
                                  <Link
                                    to={`/users/edit/${item.uuid}`}
                                    className="btn btn-sm btn-info text-white rounded-3 shadow-sm"
                                    title="Edit Pengguna"
                                  >
                                    <i className="bi bi-pencil-square"></i>
                                  </Link>
                                  <button
                                    onClick={() => deleteUser(item.uuid)}
                                    className="btn btn-sm btn-danger rounded-3 shadow-sm"
                                    title="Hapus Pengguna"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {displayedUsers.length === 0 && (
                     <div className="text-center py-5 my-3">
                        <div className="text-muted opacity-50 mb-3">
                            <i className="bi bi-people" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h5 className="fw-bold text-dark">Belum Ada Pengguna</h5>
                        <p className="text-secondary">Tidak ada data pengguna yang sesuai dengan filter Anda.</p>
                     </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default UserList;