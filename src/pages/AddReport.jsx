import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { useSelector, useDispatch } from "react-redux";
import { getMe } from "../features/authSlice";

// --- IMPORT SWEETALERT2 ---
import Swal from "sweetalert2";

// --- MAPS IMPORT ---
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Icon Leaflet
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const AddReport = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState(""); 
  const [tanggal, setTanggal] = useState("");
  const [file, setFile] = useState("");
  const [preview, setPreview] = useState("");
  
  // State Loading Submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Default Koordinat (Jakarta) agar peta tidak error saat loading
  const [position, setPosition] = useState({ lat: -6.200000, lng: 106.816666 }); 
  const [lat, setLat] = useState("-6.200000");
  const [lng, setLng] = useState("106.816666");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isError, user, isLoading } = useSelector((state) => state.auth); // Ekstrak isLoading dari Redux

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (isError) navigate("/");
  }, [isError, navigate]);

  // --- LOGIKA DETEKSI GPS ---
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const newPos = { lat: latitude, lng: longitude };
          setPosition(newPos);
          setLat(latitude.toString());
          setLng(longitude.toString());
        },
        (error) => {
          console.log("GPS Akses ditolak atau error:", error);
        }
      );
    }
  }, []);

  // Komponen untuk menangani klik di peta
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        setLat(e.latlng.lat.toString());
        setLng(e.latlng.lng.toString());
      },
    });
    return position === null ? null : <Marker position={position}></Marker>;
  };

  // Komponen agar peta otomatis "terbang" ke lokasi GPS saat ditemukan
  const RecenterMap = ({ pos }) => {
    const map = useMap();
    useEffect(() => {
        if (pos) map.flyTo([pos.lat, pos.lng], 15);
    }, [pos, map]);
    return null;
  };

  const loadImage = (e) => {
    const image = e.target.files[0];
    if (image) {
        setFile(image);
        setPreview(URL.createObjectURL(image));
    }
  };

  const saveReport = async (e) => {
    e.preventDefault();
    
    // Validasi Peta menggunakan SweetAlert
    if(!lat || !lng) {
        return Swal.fire({
            icon: 'warning',
            title: 'Lokasi Kosong',
            text: 'Silakan klik pada peta untuk menentukan titik lokasi kejadian terlebih dahulu.',
            confirmButtonColor: '#ffc107'
        });
    }

    setIsSubmitting(true); // Mulai Pemicu Loading Overlay Submit

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("location", locationName);
    formData.append("tanggal_kejadian", tanggal);
    formData.append("latitude", lat);
    formData.append("longitude", lng);
    formData.append("file", file);

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post("https://warga-melapor-backend-production.up.railway.app/reports", formData, {
        headers: { "Content-type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      
      // Notifikasi Sukses
      Swal.fire({
        icon: 'success',
        title: 'Laporan Terkirim!',
        text: 'Terima kasih, laporan Anda berhasil disimpan ke dalam sistem.',
        confirmButtonColor: '#0d6efd',
        timer: 3000
      }).then(() => {
          navigate("/reports");
      });

    } catch (error) {
      // Notifikasi Error
      Swal.fire({
          icon: 'error',
          title: 'Gagal Mengirim',
          text: error.response?.data?.msg || "Terjadi kesalahan saat menyimpan laporan. Silakan coba lagi.",
          confirmButtonColor: '#dc3545'
      });
    } finally {
      setIsSubmitting(false); // Matikan Pemicu Loading Overlay
    }
  };

  // --- LOGIKA KONDISI LOADING AWAL HALAMAN ---
  const isPageLoading = isLoading || (!user && !isError);

  return (
    <Layout>

      {/* 1. OVERLAY LOADING SAAT HALAMAN AWAL DIMUAT (Gaya Dashboard) */}
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

      {/* 2. OVERLAY LOADING SAAT MENGIRIM DATA FORM */}
      {isSubmitting && (
        <div 
            className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center" 
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', zIndex: 9999, backdropFilter: 'blur(3px)' }}
        >
            <div className="position-relative d-flex justify-content-center align-items-center" style={{ width: '120px', height: '120px' }}>
                <img 
                    src="/Logolaporpak.png" 
                    alt="Mengirim data..." 
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
                Mengirim Laporan...
            </h5>
            <p className="text-muted small">Mohon tunggu, sedang mengunggah bukti foto.</p>
        </div>
      )}

      {/* --- KONTEN HALAMAN UTAMA (Hanya dirender jika loading awal selesai) --- */}
      {!isPageLoading && (
          <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold mb-0">Buat Laporan Baru</h3>
              </div>

              <div className="card shadow-sm border-0 mb-5">
                <div className="card-body p-4">
                  <form onSubmit={saveReport}>
                    
                    <div className="mb-3">
                      <label className="form-label fw-bold small text-muted">Judul Laporan</label>
                      <input 
                        type="text" className="form-control bg-light" value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="Contoh: Jalan Berlubang Parah di Perempatan" required
                      />
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold small text-muted">Lokasi Kejadian (Alamat/Nama Tempat)</label>
                            <input 
                                type="text" className="form-control bg-light" value={locationName} 
                                onChange={(e) => setLocationName(e.target.value)} 
                                placeholder="Contoh: Jl. Sudirman No. 10" required
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold small text-muted">Tanggal Kejadian</label>
                            <input 
                                type="date" className="form-control bg-light" value={tanggal} 
                                onChange={(e) => setTanggal(e.target.value)} required 
                            />
                        </div>
                    </div>

                    {/* MAPS SECTION */}
                    <div className="mb-4 mt-2">
                        <label className="form-label fw-bold text-primary"><i className="bi bi-geo-alt-fill me-2"></i>Pilih Titik Lokasi Laporan (Klik di Peta):</label>
                        <div className="border border-2 border-primary rounded overflow-hidden shadow-sm" style={{ height: "350px", width: "100%" }}>
                            <MapContainer center={[position.lat, position.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <LocationMarker />
                                <RecenterMap pos={position} />
                            </MapContainer>
                        </div>
                        <div className="mt-2 p-2 bg-light rounded border d-flex gap-3 small">
                            <span className="text-muted"><i className="bi bi-compass me-1"></i><b>Latitude:</b> {lat}</span>
                            <span className="text-muted"><i className="bi bi-compass me-1"></i><b>Longitude:</b> {lng}</span>
                        </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold small text-muted">Deskripsi Lengkap</label>
                      <textarea 
                        className="form-control bg-light" value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        rows="4" placeholder="Jelaskan detail kronologi, kondisi saat ini, atau informasi penting lainnya..." required
                      ></textarea>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold small text-muted">Bukti Foto</label>
                      <input type="file" className="form-control bg-light" onChange={loadImage} accept="image/*" required />
                    </div>

                    {preview && (
                      <div className="mb-4 text-center">
                        <img src={preview} alt="Preview Bukti" className="img-fluid rounded border border-3 shadow-sm object-fit-cover" style={{maxHeight: '300px', width: '100%'}} />
                      </div>
                    )}

                    <hr className="my-4 text-muted" />

                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-primary px-4 fw-bold" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <span><span className="spinner-border spinner-border-sm me-2"></span>Mengirim Laporan...</span>
                        ) : (
                            <><i className="bi bi-send-fill me-2"></i>Kirim Laporan</>
                        )}
                      </button>
                      <button type="button" onClick={() => navigate("/reports")} className="btn btn-light px-4 border" disabled={isSubmitting}>
                        Batal
                      </button>
                    </div>

                  </form>
                </div>
              </div>
          </div>
      )}
    </Layout>
  );
};

export default AddReport;