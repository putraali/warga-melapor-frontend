import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Layout from "./Layout";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getMe } from "../features/authSlice";

// --- IMPORT SWEETALERT2 ---
import Swal from "sweetalert2";

// --- MAPS IMPORT ---
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ReportDetail = () => {
  const [report, setReport] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [progressList, setProgressList] = useState([]);
  
  // State untuk Kontrol Tampilan Chat
  const [isChatOpen, setIsChatOpen] = useState(false); 

  // State untuk Feedback
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [rating, setRating] = useState(5);    
  const [review, setReview] = useState("");   

  // --- REFS & STATE TRACKING BACA (NOTIFIKASI) ---
  const prevCommentsLen = useRef(0);
  const isFirstLoad = useRef(true);
  const [lastReadChat, setLastReadChat] = useState(0);
  
  // Ref Khusus Scroll Chat
  const chatEndRef = useRef(null);       
  const chatContainerRef = useRef(null); 
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const { uuid } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Ekstrak data dari Redux authSlice
  const { user, isError, isLoading } = useSelector((state) => state.auth);

  const userUuid = user?.uuid;
  const userEmail = user?.email;

  useEffect(() => { dispatch(getMe()); }, [dispatch]);
  useEffect(() => { if (isError) navigate("/"); }, [isError, navigate]);

  // --- INISIALISASI LAST READ DARI LOCAL STORAGE ---
  useEffect(() => {
      if (userUuid && uuid) {
          const storageKey = `lastReadChat_${uuid}_${userUuid}`;
          const storedTime = localStorage.getItem(storageKey);
          
          const timer = setTimeout(() => {
              setLastReadChat(storedTime ? new Date(storedTime).getTime() : 0);
          }, 0);
          
          return () => clearTimeout(timer);
      }
  }, [uuid, userUuid]);

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

  // --- PERBAIKAN ESLINT 1: Auto-scroll saat chat dibuka ---
  useEffect(() => {
    if (isChatOpen && !showScrollBtn) {
        const timer = setTimeout(() => {
            scrollToBottom();
        }, 0);
        return () => clearTimeout(timer);
    }
  }, [comments, isChatOpen, showScrollBtn, scrollToBottom]);

  // --- CHECK IS ME ---
  const checkIsMe = useCallback((msgUser) => {
      if (!msgUser || !userUuid) return false;
      return String(msgUser.uuid) === String(userUuid) || msgUser.email === userEmail;
  }, [userUuid, userEmail]);

  // --- LOGIKA MENGHITUNG PESAN BELUM DIBACA (UNREAD COUNT) ---
  const unreadCount = useMemo(() => {
      if (isChatOpen || !userUuid) return 0; 
      
      return comments.filter(c => 
          new Date(c.createdAt).getTime() > lastReadChat && !checkIsMe(c.user)
      ).length;
  }, [comments, isChatOpen, lastReadChat, userUuid, checkIsMe]);

  // --- LOGIKA UPDATE LAST READ SAAT CHAT DIBUKA ---
  useEffect(() => {
      if (!userUuid) return;
      
      if (isChatOpen && comments.length > 0) {
          const latestMsg = comments[comments.length - 1];
          const latestTime = new Date(latestMsg.createdAt).getTime();
          
          if (latestTime > lastReadChat) {
              const timer = setTimeout(() => {
                  setLastReadChat(latestTime);
                  localStorage.setItem(`lastReadChat_${uuid}_${userUuid}`, latestMsg.createdAt);
              }, 0);
              
              return () => clearTimeout(timer);
          }
      }
  }, [isChatOpen, comments, lastReadChat, uuid, userUuid]);


  // --- FUNGSI AUDIO NOTIFIKASI ---
  const playNotificationSound = () => {
      const audio = new Audio('/notif.mp3'); 
      audio.play().catch(() => {}); 
  };

  // --- FUNGSI FETCH DATA ---
  const getReportData = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
        const resReport = await axios.get(`https://warga-melapor-backend-production.up.railway.app/reports/${uuid}`, config);
        setReport(resReport.data);

        axios.get(`https://warga-melapor-backend-production.up.railway.app/reports/${uuid}/progress`, config).then(res => setProgressList(res.data)).catch(()=>{});
        
        const resComments = await axios.get(`https://warga-melapor-backend-production.up.railway.app/reports/${uuid}/comments`, config);
        setComments(resComments.data);

        axios.get(`https://warga-melapor-backend-production.up.railway.app/reports/${uuid}/feedback`, config)
            .then(res => setExistingFeedback(res.data))
            .catch(() => {});

    } catch (error) {
        if (error.response?.status === 401) navigate('/');
    }
  }, [uuid, navigate]);

  // --- PERBAIKAN ESLINT 2: INITIAL LOAD & POLLING ---
  useEffect(() => {
    if (uuid) {
        // Bungkus panggilan sinkron pertama dengan setTimeout
        const initialLoadTimer = setTimeout(() => {
            getReportData();
        }, 0);
        
        const intervalId = setInterval(getReportData, 3000); 
        
        return () => {
            clearTimeout(initialLoadTimer);
            clearInterval(intervalId);
        };
    }
  }, [uuid, getReportData]); 

  // --- LOGIKA MEMAINKAN SUARA NOTIFIKASI SAAT ADA PESAN BARU ---
  useEffect(() => {
      if (comments.length > prevCommentsLen.current) {
          if (!isFirstLoad.current) {
              const lastMsg = comments[comments.length - 1];
              if (!checkIsMe(lastMsg.user) && !isChatOpen) {
                  playNotificationSound(); 
              }
          }
          prevCommentsLen.current = comments.length;
      }

      if (isFirstLoad.current && comments.length > 0) {
          isFirstLoad.current = false;
          prevCommentsLen.current = comments.length;
      }
  }, [comments, checkIsMe, isChatOpen]);


  // --- FORMAT DATE & TIME ---
  const formatDate = (dateString) => {
    if(!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatDateTime = (dateString) => {
      if(!dateString) return "-";
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', { 
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit' 
      }).replace('.', ':'); 
  };

  // --- SUBMIT COMMENT ---
  const submitComment = async (e) => {
    e.preventDefault();
    if(!newComment.trim()) return;
    const token = localStorage.getItem('accessToken');
    try {
        await axios.post(`https://warga-melapor-backend-production.up.railway.app/reports/${uuid}/comments`, { message: newComment }, { headers: { Authorization: `Bearer ${token}` } });
        setNewComment("");
        getReportData(); 
        setTimeout(scrollToBottom, 100); 
    } catch (error) { 
        Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: error.response?.data?.msg || "Gagal mengirim komentar",
            confirmButtonColor: '#dc3545'
        });
    }
  };

 // --- SUBMIT FEEDBACK ---
  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!rating || !review) { 
        Swal.fire({
            icon: 'warning',
            title: 'Perhatian',
            text: 'Mohon isi rating dan ulasan.',
            confirmButtonColor: '#ffc107'
        });
        return; 
    }
    const token = localStorage.getItem('accessToken');
    
    try {
        await axios.post(`https://warga-melapor-backend-production.up.railway.app/reports/${uuid}/feedback`, { 
            rating: rating, 
            review: review,
            reportUuid: uuid 
        }, { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        
        Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Terima kasih atas penilaian Anda!',
            confirmButtonColor: '#198754'
        });
        
        setExistingFeedback({ rating, review, user: { name: user?.name } }); 
        getReportData(); 
    } catch (error) { 
        Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: error.response?.data?.msg || error.message,
            confirmButtonColor: '#dc3545'
        });
    }
  };

  const renderStars = (count) => {
      let stars = [];
      for(let i=0; i<5; i++) {
          stars.push(<i key={i} className={`bi bi-star-fill me-1 ${i < count ? 'text-warning' : 'text-secondary'}`}></i>);
      }
      return stars;
  };

  // --- KOMPONEN BUBBLE CHAT ---
  const ChatBubble = ({ message, sender, role, time, isMe }) => (
    <div className={`d-flex flex-column mb-3 ${isMe ? 'align-items-end' : 'align-items-start'}`}>
        <div className="d-flex align-items-center mb-1 gap-2" style={{ flexDirection: isMe ? 'row-reverse' : 'row' }}>
            <small className="fw-bold" style={{fontSize:'0.75rem', color: '#555'}}>{sender}</small>
            <span className={`badge ${role === 'admin' ? 'bg-danger' : role === 'penanggung_jawab' ? 'bg-warning text-dark' : 'bg-secondary'}`} style={{fontSize:'0.5rem', padding:'3px 6px'}}>
                {role}
            </span>
        </div>
        <div 
            className={`p-3 shadow-sm ${isMe ? 'bg-primary text-white' : 'bg-white border'}`} 
            style={{
                maxWidth: '85%',
                borderRadius: isMe ? '15px 15px 0 15px' : '15px 15px 15px 0',
                wordWrap: 'break-word'
            }}
        >
            <span style={{fontSize:'0.95rem'}}>{message}</span>
        </div>
        <small className="text-muted mt-1" style={{fontSize:'0.65rem'}}>
            {new Date(time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
        </small>
    </div>
  );

  const isPageLoading = isLoading || !report || (!user && !isError);

  return (
    <Layout>
      
      {/* --- OVERLAY LOADING --- */}
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
                Memuat Detail Laporan...
            </h5>
        </div>
      )}

      {/* --- KONTEN HALAMAN --- */}
      {!isPageLoading && (
        <div className="row g-4">
          <div className="col-md-8">
              <div className="card shadow-sm border-0 mb-4">
                  <div className="bg-light text-center p-2">
                      {report.url ? (
                          <img src={report.url} className="img-fluid rounded" alt="Bukti" style={{maxHeight:'300px', objectFit:'cover'}} />
                      ) : <div className="p-4 text-muted">Tidak ada foto</div>}
                  </div>
                  
                  <div className="card-body p-4">
                      <h2 className="fw-bold">{report.title}</h2>
                      <div className="text-primary fw-bold mb-3"><i className="bi bi-calendar-event me-2"></i>{formatDate(report.tanggal_kejadian)}</div>
                      <div className="mb-3">
                          <span className={`badge me-2 ${report.status === 'selesai' ? 'bg-success' : report.status === 'proses' ? 'bg-warning text-dark' : 'bg-danger'}`}>Status: {report.status.toUpperCase()}</span>
                          <span className="text-muted"><i className="bi bi-geo-alt"></i> {report.location}</span>
                      </div>

                      {report.latitude && report.longitude && (
                          <div className="mb-4">
                              <div className="border rounded overflow-hidden shadow-sm" style={{ height: "200px", width: "100%" }}>
                                  <MapContainer center={[report.latitude, report.longitude]} zoom={15} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                      <Marker position={[report.latitude, report.longitude]}><Popup>{report.location}</Popup></Marker>
                                  </MapContainer>
                              </div>
                          </div>
                      )}

                      <p className="lead fs-6">{report.description}</p>

                      {/* SECTION FEEDBACK */}
                      {existingFeedback && (
                          <div className="alert alert-warning mt-4 border-warning">
                              <h5 className="alert-heading fw-bold"><i className="bi bi-award-fill me-2"></i>Penilaian Warga</h5>
                              <hr/>
                              <div className="d-flex align-items-center mb-2">
                                  <div className="fs-4 me-3">{renderStars(existingFeedback.rating)}</div>
                                  <span className="fw-bold text-dark">({existingFeedback.rating}/5)</span>
                              </div>
                              <figure>
                                  <blockquote className="blockquote">
                                      <p className="fs-6">"{existingFeedback.review}"</p>
                                  </blockquote>
                                  <figcaption className="blockquote-footer mt-1">
                                      Ditulis oleh <cite title="Source Title">{existingFeedback.user?.name || "Warga"}</cite>
                                  </figcaption>
                              </figure>
                          </div>
                      )}

                      {!existingFeedback && user && user.role === "warga" && report.status === "selesai" && (
                          <div className="alert alert-success mt-4">
                              <h5 className="alert-heading"><i className="bi bi-star-fill me-2"></i>Beri Nilai Pelayanan</h5>
                              <hr/>
                              <form onSubmit={submitFeedback}>
                                  <div className="mb-2">
                                      <label className="fw-bold me-2">Rating:</label>
                                      {[1,2,3,4,5].map(num => (
                                          <button key={num} type="button" onClick={()=>setRating(num)} className={`btn btn-sm me-1 ${rating >= num ? 'btn-warning' : 'btn-outline-secondary'}`}>★</button>
                                      ))}
                                  </div>
                                  <textarea className="form-control mb-2" placeholder="Bagaimana kinerja petugas kami?" value={review} onChange={(e)=>setReview(e.target.value)} required></textarea>
                                  <button className="btn btn-success w-100">Kirim Penilaian</button>
                              </form>
                          </div>
                      )}
                  </div>
              </div>

              <h5 className="fw-bold text-primary"><i className="bi bi-clock-history me-2"></i>Timeline Progres</h5>
              <div className="list-group mb-5">
                  {progressList.map((prog, i) => (
                      <div key={i} className="list-group-item">
                          <div className="d-flex justify-content-between">
                              <strong className="text-dark">{prog.user?.name || "Petugas"}</strong>
                              <small className="text-muted fw-bold">
                                  {formatDateTime(prog.createdAt)}
                              </small>
                          </div>
                          <p className="mb-1 text-muted">{prog.description}</p>
                          {prog.url && <a href={prog.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-info mt-1">Lihat Foto</a>}
                      </div>
                  ))}
                  {progressList.length === 0 && <div className="text-muted fst-italic">Belum ada update.</div>}
              </div>
          </div>

          {/* KOLOM KANAN: CHAT */}
          <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm" style={{maxHeight: '85vh'}}>
                  <div className="card-header bg-white">
                      <div className="d-flex align-items-center justify-content-center text-primary fw-bold py-2 position-relative">
                          <i className="bi bi-chat-quote me-2"></i> Diskusi Publik
                          
                          {/* BADGE NOTIFIKASI DI HEADER CHAT */}
                          {unreadCount > 0 && !isChatOpen && (
                              <span className="position-absolute top-50 start-100 translate-middle badge rounded-pill bg-danger" style={{ marginLeft: '-40px' }}>
                                  {unreadCount}
                                  <span className="visually-hidden">pesan belum dibaca</span>
                              </span>
                          )}
                      </div>
                  </div>
                  
                  {/* AREA CHAT */}
                  <div 
                      className="card-body overflow-auto p-3 d-flex flex-column position-relative" 
                      style={{backgroundColor: '#f0f2f5'}}
                      ref={chatContainerRef} 
                      onScroll={handleScroll}
                  >
                      {!isChatOpen ? (
                          <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                              <i className="bi bi-chat-left-text display-4 mb-3 text-secondary"></i>
                              <p className="text-center small mb-3">Klik tombol di bawah untuk melihat dan bergabung dalam diskusi.</p>
                              
                              {/* TOMBOL BUKA CHAT DENGAN BADGE */}
                              <button onClick={() => setIsChatOpen(true)} className="btn btn-primary rounded-pill px-4 position-relative">
                                  <i className="bi bi-eye me-2"></i> Tampilkan Diskusi
                                  {unreadCount > 0 && (
                                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light">
                                          {unreadCount}
                                      </span>
                                  )}
                              </button>
                          </div>
                      ) : (
                          <>
                              {comments.length === 0 && <div className="text-center mt-5 text-muted small">Belum ada diskusi. Jadilah yang pertama berkomentar!</div>}
                              
                              {comments.map((c, i) => (
                                  <ChatBubble 
                                      key={i} 
                                      message={c.message} 
                                      sender={c.user?.name} 
                                      role={c.user?.role} 
                                      time={c.createdAt} 
                                      isMe={checkIsMe(c.user)} 
                                  />
                              ))}
                              
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
                          </>
                      )}
                  </div>

                  {/* INPUT AREA */}
                  {isChatOpen && (
                      <div className="card-footer bg-white p-3">
                          <form onSubmit={submitComment} className="d-flex gap-2">
                              <input 
                                  type="text" className="form-control rounded-pill bg-light" 
                                  placeholder="Tulis komentar..." 
                                  value={newComment} onChange={(e)=>setNewComment(e.target.value)} 
                                  required 
                              />
                              <button className="btn btn-primary rounded-circle"><i className="bi bi-send-fill"></i></button>
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

export default ReportDetail;