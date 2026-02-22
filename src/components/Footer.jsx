import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white text-center py-4 mt-auto border-top">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 text-md-start mb-2 mb-md-0">
            <span className="text-muted small">
              &copy; {new Date().getFullYear()} <strong>Warga Melapor</strong> - Sistem Pelaporan Warga.
            </span>
          </div>
          <div className="col-md-6 text-md-end">
            <ul className="list-inline mb-0 small">
              <li className="list-inline-item"><a href="#" className="text-decoration-none text-muted">Bantuan</a></li>
              <li className="list-inline-item mx-2 text-muted">|</li>
              <li className="list-inline-item"><a href="#" className="text-decoration-none text-muted">Privasi</a></li>
              <li className="list-inline-item mx-2 text-muted">|</li>
              <li className="list-inline-item"><a href="#" className="text-decoration-none text-muted">Syarat & Ketentuan</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;