 
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Layout from "./Layout";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getMe } from "../features/authSlice";

// --- MAPS, PDF & SWEETALERT IMPORTS ---
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 
import Swal from "sweetalert2";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ReportAction = () => {
  const { uuid } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user, isError, isLoading } = useSelector((state) => state.auth);

  // --- STATE CHAT & REPORT ---
  const [activeMode, setActiveMode] = useState(null); 
  const [publicComments, setPublicComments] = useState([]);
  const [internalNotes, setInternalNotes] = useState([]); 
  const [report, setReport] = useState(null);
  const [progressList, setProgressList] = useState([]);
  
  const [inputPublic, setInputPublic] = useState("");
  const [inputInternal, setInputInternal] = useState("");
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [pjFile, setPjFile] = useState(null); 
  const [pjDesc, setPjDesc] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userUuid = user?.uuid;
  const userEmail = user?.email; 
  const canAccessInternal = user?.role === 'admin' || user?.role === 'penanggung_jawab';

  // --- STATE TRACKING BACA ---
  const [lastReadPublic, setLastReadPublic] = useState(0);
  const [lastReadInternal, setLastReadInternal] = useState(0);

  useEffect(() => {
      if (userUuid && uuid) {
          const publicKey = `lastReadPublic_${uuid}_${userUuid}`;
          const internalKey = `lastReadInternal_${uuid}_${userUuid}`;
          const storedPublic = localStorage.getItem(publicKey);
          const storedInternal = localStorage.getItem(internalKey);
          setLastReadPublic(storedPublic ? new Date(storedPublic).getTime() : 0);
          setLastReadInternal(storedInternal ? new Date(storedInternal).getTime() : 0);
      }
  }, [uuid, userUuid]);

  // --- REFS ---
  const prevUnreadPublicRef = useRef(0);
  const prevUnreadInternalRef = useRef(0);
  const isFirstRender = useRef(true); 
  const fileInputRef = useRef(null);   
  const chatEndRef = useRef(null);       
  const chatContainerRef = useRef(null); 
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // --- FUNGSI SCROLL CHAT ---
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: "smooth"
        });
        setShowScrollBtn(false);
    }
  }, []);

  const handleScroll = () => {
      if (chatContainerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
          const isNotBottom = scrollHeight - scrollTop - clientHeight > 100;
          setShowScrollBtn(isNotBottom);
      }
  };

  useEffect(() => {
    if (!showScrollBtn) {
        scrollToBottom();
    }
  }, [publicComments, internalNotes, activeMode, showScrollBtn, scrollToBottom]);

  // --- CHECK IS ME ---
  const checkIsMe = useCallback((msgUser) => {
      if (!msgUser || !userUuid) return false;
      return String(msgUser.uuid) === String(userUuid) || msgUser.email === userEmail;
  }, [userUuid, userEmail]);

  useEffect(() => { dispatch(getMe()); }, [dispatch]);
  useEffect(() => { if (isError) navigate("/"); }, [isError, navigate]);

  const playNotificationSound = () => {
      const audio = new Audio('/notif.mp3'); 
      audio.play().catch(() => {}); 
  };

  // --- LOGIKA NOTIFIKASI ---
  const unreadPublicCount = useMemo(() => {
      if (activeMode === 'public' || !userUuid) return 0; 
      return publicComments.filter(c => 
          new Date(c.createdAt).getTime() > lastReadPublic && !checkIsMe(c.user)
      ).length;
  }, [publicComments, activeMode, lastReadPublic, userUuid, checkIsMe]);

  const unreadInternalCount = useMemo(() => {
      if (activeMode === 'internal' || !userUuid) return 0;
      return internalNotes.filter(c => 
          new Date(c.createdAt).getTime() > lastReadInternal && !checkIsMe(c.user)
      ).length;
  }, [internalNotes, activeMode, lastReadInternal, userUuid, checkIsMe]);

  useEffect(() => {
      if (unreadPublicCount > prevUnreadPublicRef.current && !isFirstRender.current) playNotificationSound();
      prevUnreadPublicRef.current = unreadPublicCount;
  }, [unreadPublicCount]);

  useEffect(() => {
      if (unreadInternalCount > prevUnreadInternalRef.current && !isFirstRender.current) playNotificationSound();
      prevUnreadInternalRef.current = unreadInternalCount;
  }, [unreadInternalCount]);

  // --- UPDATE LAST READ ---
  useEffect(() => {
      if (!userUuid) return;
      if (activeMode === 'public' && publicComments.length > 0) {
          const latest = publicComments[publicComments.length - 1];
          const latestTime = new Date(latest.createdAt).getTime();
          if (latestTime > lastReadPublic) {
              setLastReadPublic(latestTime);
              localStorage.setItem(`lastReadPublic_${uuid}_${userUuid}`, latest.createdAt);
          }
      }
  }, [activeMode, publicComments, lastReadPublic, uuid, userUuid]);

  useEffect(() => {
      if (!userUuid) return;
      if (activeMode === 'internal' && internalNotes.length > 0) {
          const latest = internalNotes[internalNotes.length - 1];
          const latestTime = new Date(latest.createdAt).getTime();
          if (latestTime > lastReadInternal) {
              setLastReadInternal(latestTime);
              localStorage.setItem(`lastReadInternal_${uuid}_${userUuid}`, latest.createdAt);
          }
      }
  }, [activeMode, internalNotes, lastReadInternal, uuid, userUuid]);

  // --- RESET STATE ---
  useEffect(() => {
    setPublicComments([]);
    setInternalNotes([]);
    setActiveMode(null);
    isFirstRender.current = true;
    const timer = setTimeout(() => { isFirstRender.current = false; }, 2000);
    return () => clearTimeout(timer);
  }, [uuid]);

  // --- FETCH DATA ---
  const getReportData = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token || !uuid) return;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
        const resReport = await axios.get(`https://warga-melapor-backend-production.up.railway.app/reports/${uuid}`, config);
        setReport(resReport.data);
        axios.get(`https://warga-melapor-backend-production.up.railway.app/reports/${uuid}/progress`, config).then(res => setProgressList(res.data)).catch(()=>{});
        axios.get(`https://warga-melapor-backend-production.up.railway.app/reports/${uuid}/comments`, config).then(res => setPublicComments(res.data)).catch(()=>{});
        if (canAccessInternal) {
            axios.get(`https://warga-melapor-backend-production.up.railway.app/internal-notes/${uuid}`, config).then(res => setInternalNotes(res.data)).catch(()=>{});
        }
        axios.get(`https://warga-melapor-backend-production.up.railway.app/reports/${uuid}/feedback`, config).then(res => setExistingFeedback(res.data)).catch(() => {});
    } catch (error) { 
        if (error.response?.status === 401) navigate('/'); 
    }
  }, [uuid, navigate, canAccessInternal]); 

  useEffect(() => {
    if(uuid && userUuid) { 
        getReportData();
        const intervalId = setInterval(getReportData, 3000); 
        return () => clearInterval(intervalId); 
    }
  }, [uuid, userUuid, getReportData]); 

  const handleTabChange = (mode) => setActiveMode(mode);

  const sendComment = async (e, type) => {
    e.preventDefault();
    const isPublic = type === 'public';
    const input = isPublic ? inputPublic : inputInternal;
    if(!input.trim()) return;
    try {
        const url = isPublic ? `https://warga-melapor-backend-production.up.railway.app/reports/${uuid}/comments` : `https://warga-melapor-backend-production.up.railway.app/internal-notes`;
        const payload = isPublic ? { message: input } : { note: input, reportUuid: uuid };
        await axios.post(url, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });
        isPublic ? setInputPublic("") : setInputInternal("");
        getReportData();
        setTimeout(scrollToBottom, 100); 
    } catch (error) { 
        console.error("Error sendComment:", error); // <-- PERBAIKAN ESLINT
        Swal.fire({ icon: 'error', title: 'Gagal', text: "Gagal mengirim pesan." });
    }
  };

  const generatePDF = () => {
    if (!report) return;
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text("Laporan Detail", 14, 20);
    doc.setFontSize(12);
    doc.text(`Judul: ${report.title}`, 14, 30);
    doc.text(`Status: ${report.status.toUpperCase()}`, 14, 40);
    const splitDesc = doc.splitTextToSize(`Deskripsi: ${report.description}`, 180);
    doc.text(splitDesc, 14, 60);
    let finalY = 60 + (splitDesc.length * 7);
    doc.text("Riwayat Pengerjaan:", 14, finalY + 10);
    const tableRows = progressList.map((prog, index) => [
        index + 1, new Date(prog.createdAt).toLocaleDateString(), prog.user?.name || "Sistem", prog.description
    ]);
    autoTable(doc, { head: [['No', 'Tanggal', 'Petugas', 'Keterangan']], body: tableRows, startY: finalY + 15 });
    doc.save(`Laporan_${report.title.substring(0, 10)}.pdf`);
  };

  const updateStatus = async (newStatus) => {
    const confirmResult = await Swal.fire({
        title: 'Konfirmasi',
        text: `Apakah Anda yakin ingin mengubah status menjadi ${newStatus.toUpperCase()}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Ubah!',
        cancelButtonText: 'Batal'
    });

    if(!confirmResult.isConfirmed) return;

    try {
        await axios.patch(`https://warga-melapor-backend-production.up.railway.app/reports/${uuid}`, { status: newStatus }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        getReportData(); 
        Swal.fire('Berhasil!', 'Status laporan telah diperbarui.', 'success');
    } catch (error) { 
        console.error("Error updateStatus:", error); // <-- PERBAIKAN ESLINT
        Swal.fire('Gagal', 'Terjadi kesalahan saat mengupdate status.', 'error');
    }
  };

  const submitProgress = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("description", pjDesc);
    if(pjFile) formData.append("file", pjFile); 
    
    try {
        await axios.post(`https://warga-melapor-backend-production.up.railway.app/reports/${uuid}/progress`, formData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        if(report.status === 'pending') {
            await axios.patch(`https://warga-melapor-backend-production.up.railway.app/reports/${uuid}`, { status: 'proses' }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            });
        }
        setPjDesc(""); setPjFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; 
        getReportData();
        Swal.fire('Berhasil!', 'Progres pekerjaan berhasil dikirim.', 'success');
    } catch (error) { 
        console.error("Error submitProgress:", error); // <-- PERBAIKAN ESLINT
        Swal.fire('Gagal', 'Gagal mengirim update progres.', 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  const renderStars = (count) => {
      let stars = [];
      for(let i=0; i<5; i++) stars.push(<i key={i} className={`bi bi-star-fill me-1 ${i < count ? 'text-warning' : 'text-secondary'}`}></i>);
      return stars;
  };

  const ChatBubble = ({ message, sender, role, time, isMe, isInternal }) => (
    <div className={`d-flex flex-column mb-3 ${isMe ? 'align-items-end' : 'align-items-start'}`} style={{ width: '100%' }}>
        <div className="d-flex align-items-center mb-1 gap-2" style={{ flexDirection: isMe ? 'row-reverse' : 'row' }}>
            <small className="fw-bold" style={{fontSize:'0.75rem', color: '#555'}}>{sender}</small>
            <span className={`badge ${role === 'admin' ? 'bg-danger' : role === 'penanggung_jawab' ? 'bg-warning text-dark' : 'bg-secondary'}`} style={{fontSize:'0.5rem', padding:'3px 6px'}}>
                {role}
            </span>
        </div>
        <div className={`p-3 shadow-sm ${isMe ? (isInternal ? 'bg-danger text-white' : 'bg-primary text-white') : 'bg-white border'}`} 
            style={{ maxWidth: '80%', borderRadius: isMe ? '15px 15px 0 15px' : '15px 15px 15px 0', wordWrap: 'break-word' }}>
            <span style={{fontSize:'0.95rem'}}>{message}</span>
        </div>
        <small className="text-muted mt-1" style={{fontSize:'0.65rem'}}>{new Date(time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</small>
    </div>
  );

  const isPageLoading = isLoading || !report || (!user && !isError);

  return (
    <Layout>

      {/* OVERLAY LOADING AWAL DIMUAT */}
      {isPageLoading && (
        <div 
            className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center" 
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', zIndex: 9999, backdropFilter: 'blur(3px)' }}
        >
            <div className="position-relative d-flex justify-content-center align-items-center" style={{ width: '120px', height: '120px' }}>
                <img src="/Logolaporpak.png" alt="Memuat data..." className="position-absolute" style={{ width: '55px', height: 'auto', zIndex: 2 }} />
                <div className="spinner-border text-primary position-absolute" style={{ width: '120px', height: '120px', borderWidth: '5px', zIndex: 1 }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
            <h5 className="mt-4 fw-bold text-dark" style={{ letterSpacing: '0.5px' }}>Memuat Data Laporan...</h5>
        </div>
      )}

      {/* OVERLAY LOADING SUBMIT PROGRESS */}
      {isSubmitting && (
        <div 
            className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center" 
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', zIndex: 9999, backdropFilter: 'blur(3px)' }}
        >
            <div className="position-relative d-flex justify-content-center align-items-center" style={{ width: '120px', height: '120px' }}>
                <img src="/Logolaporpak.png" alt="Mengirim data..." className="position-absolute" style={{ width: '55px', height: 'auto', zIndex: 2 }} />
                <div className="spinner-border text-primary position-absolute" style={{ width: '120px', height: '120px', borderWidth: '5px', zIndex: 1 }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
            <h5 className="mt-4 fw-bold text-dark" style={{ letterSpacing: '0.5px' }}>Menyimpan Progres Pekerjaan...</h5>
        </div>
      )}

      {!isPageLoading && (
          <div className="row g-4">
            <div className="col-md-8">
                <div className="card shadow-sm border-0 mb-4">
                    <div className="bg-light text-center p-2">
                        {report.url ? <img src={report.url} className="img-fluid rounded" alt="Bukti" style={{maxHeight:'300px'}} /> : <div className="p-4 text-muted">Tidak ada foto</div>}
                    </div>
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="fw-bold m-0">{report.title}</h3>
                            <button onClick={generatePDF} className="btn btn-outline-danger btn-sm"><i className="bi bi-file-pdf-fill me-1"></i> Export PDF</button>
                        </div>
                        <div className="mb-3">
                            <span className={`badge ${report.status === 'selesai' ? 'bg-success' : report.status === 'proses' ? 'bg-warning text-dark' : 'bg-danger'}`}>{report.status.toUpperCase()}</span>
                            <span className="ms-2 text-muted"><i className="bi bi-geo-alt"></i> {report.location}</span>
                        </div>
                        {report.latitude && report.longitude && (
                            <div className="mb-4 border rounded overflow-hidden shadow-sm" style={{ height: "250px", width: "100%" }}>
                                <MapContainer center={[report.latitude, report.longitude]} zoom={15} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={[report.latitude, report.longitude]}><Popup>{report.location}</Popup></Marker>
                                </MapContainer>
                            </div>
                        )}
                        <p>{report.description}</p>
                        <hr className="my-4"/>
                        {existingFeedback && (
                            <div className="alert alert-warning border-warning mb-4">
                                <h6 className="fw-bold"><i className="bi bi-award-fill me-2"></i>Ulasan Warga</h6>
                                <div>{renderStars(existingFeedback.rating)} <span className="fw-bold">({existingFeedback.rating}/5)</span></div>
                                <p className="mb-0 fst-italic mt-1">"{existingFeedback.review}"</p>
                            </div>
                        )}
                        {user && user.role === "admin" && (
                            <div className="alert alert-secondary">
                                <strong className="d-block mb-2">Admin Control</strong>
                                <div className="d-flex gap-2 flex-wrap">
                                    <button onClick={()=>updateStatus('proses')} className="btn btn-sm btn-warning">Proses</button>
                                    <button onClick={()=>updateStatus('selesai')} className="btn btn-sm btn-success">Selesai</button>
                                    <button onClick={()=>updateStatus('ditolak')} className="btn btn-sm btn-dark">Tolak</button>
                                    <button onClick={()=>updateStatus('pending')} className="btn btn-sm btn-outline-secondary">Reset</button>
                                </div>
                            </div>
                        )}
                        {user && user.role === "penanggung_jawab" && (
                            <div className="card border-primary bg-light mb-4">
                                <div className="card-body">
                                    <h6 className="fw-bold text-primary">Area Kerja Petugas</h6>
                                    {report.status === 'pending' && <button onClick={()=>updateStatus('proses')} className="btn btn-primary btn-sm mb-2">Mulai Kerjakan</button>}
                                    {(report.status === 'proses' || report.status === 'pending') && (
                                        <form onSubmit={submitProgress} className="mt-2">
                                            <input type="file" className="form-control mb-2" onChange={(e)=>setPjFile(e.target.files[0])} ref={fileInputRef} required />
                                            <input type="text" className="form-control mb-2" placeholder="Ket. Progres..." value={pjDesc} onChange={(e)=>setPjDesc(e.target.value)} required />
                                            <button className="btn btn-primary btn-sm w-100" disabled={isSubmitting}>Kirim Progres</button>
                                        </form>
                                    )}
                                    {report.status === 'proses' && <button onClick={()=>updateStatus('selesai')} className="btn btn-success btn-sm w-100 mt-2">Tandai Selesai</button>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <h5 className="fw-bold">Riwayat Pengerjaan</h5>
                <ul className="list-group mb-4">
                    {progressList.map((prog, i) => (
                        <li key={i} className="list-group-item">
                            <small className="fw-bold text-primary">{prog.user?.name}</small>
                            <small className="text-muted ms-2">{new Date(prog.createdAt).toLocaleString()}</small>
                            <p className="mb-1">{prog.description}</p>
                            {prog.url && <a href={prog.url} target="_blank" rel="noreferrer"><img src={prog.url} alt="bukti" height="80" className="rounded"/></a>}
                        </li>
                    ))}
                    {progressList.length === 0 && <li className="list-group-item text-muted">Belum ada data.</li>}
                </ul>
            </div>

            <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm" style={{maxHeight: '85vh'}}>
                    <div className="card-header bg-white p-0 d-flex">
                        <button className={`flex-fill py-3 border-0 bg-transparent ${activeMode==='public'?'fw-bold text-primary border-bottom border-primary border-3':''}`} onClick={() => handleTabChange('public')}>
                            <div className="d-inline-flex position-relative align-items-center">
                                <i className="bi bi-chat-quote me-2"></i> Publik
                                {unreadPublicCount > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{unreadPublicCount}</span>}
                            </div>
                        </button>
                        {canAccessInternal && (
                            <button className={`flex-fill py-3 border-0 bg-transparent ${activeMode==='internal'?'fw-bold text-danger border-bottom border-danger border-3':''}`} onClick={() => handleTabChange('internal')}>
                                <div className="d-inline-flex position-relative align-items-center">
                                    <i className="bi bi-shield-lock-fill me-2"></i> Internal
                                    {unreadInternalCount > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{unreadInternalCount}</span>}
                                </div>
                            </button>
                        )}
                    </div>
                    
                    <div 
                        className="card-body overflow-auto p-3 bg-light d-flex flex-column position-relative" 
                        ref={chatContainerRef} 
                        onScroll={handleScroll}
                    >
                        {!activeMode && (
                            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                                <i className="bi bi-chat-dots display-4 mb-3"></i>
                                <p className="text-center small px-4">Silakan pilih tab untuk memulai diskusi.</p>
                            </div>
                        )}
                        {activeMode === 'public' && publicComments.map((c, i) => <ChatBubble key={i} message={c.message} sender={c.user?.name} role={c.user?.role} time={c.createdAt} isMe={checkIsMe(c.user)} isInternal={false} />)}
                        {activeMode === 'internal' && internalNotes.map((c, i) => <ChatBubble key={i} message={c.note} sender={c.user?.name} role={c.user?.role} time={c.createdAt} isMe={checkIsMe(c.user)} isInternal={true} />)}
                        
                        <div ref={chatEndRef} />

                        {showScrollBtn && (
                            <button 
                                onClick={scrollToBottom}
                                className="btn btn-primary rounded-circle shadow position-sticky start-50 translate-middle-x"
                                style={{ bottom: '10px', marginTop: '-50px', zIndex: 10, width: '40px', height: '40px' }}
                            >
                                <i className="bi bi-arrow-down"></i>
                            </button>
                        )}
                    </div>

                    {activeMode && (
                        <div className="card-footer bg-white">
                            <form onSubmit={(e) => sendComment(e, activeMode)} className="d-flex gap-2">
                                <input type="text" className="form-control rounded-pill" value={activeMode === 'public' ? inputPublic : inputInternal} onChange={(e) => activeMode === 'public' ? setInputPublic(e.target.value) : setInputInternal(e.target.value)} placeholder="Ketik pesan..." />
                                <button className={`btn rounded-circle ${activeMode === 'public' ? 'btn-primary' : 'btn-danger'}`}><i className="bi bi-send"></i></button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
          </div>
      )}

    </Layout>
  );
};

export default ReportAction;