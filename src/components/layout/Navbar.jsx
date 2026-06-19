import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { X, Menu, Shield } from 'lucide-react'

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { user, isEditor } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  const navLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/catalogo', label: 'Catálogo' },
    { path: '/contacto', label: 'Contacto' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        .ynk-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.9rem 5rem;
          background: ${scrolled ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.9)'};
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid ${scrolled ? 'rgba(0,0,0,0.06)' : 'transparent'};
          transition: all 0.35s cubic-bezier(0.25,0.46,0.45,0.94);
          box-shadow: ${scrolled ? '0 1px 8px rgba(0,0,0,0.04)' : 'none'};
        }

        .ynk-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a2e;
          letter-spacing: 0.02em;
          text-decoration: none;
          cursor: pointer;
          transition: opacity 0.3s;
          display: flex;
          align-items: center;
          gap: 0.15rem;
          flex-shrink: 0;
        }
        .ynk-logo:hover { opacity: 0.85; }
        .ynk-logo em { font-style: italic; color: #c47d3e; }

        .ynk-nav-links {
          display: flex;
          gap: 2.2rem;
          list-style: none;
          margin: 0;
          padding: 0;
          align-items: center;
        }
        .ynk-nav-links li a {
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #4a4a5a;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
          padding-bottom: 5px;
        }
        .ynk-nav-links li a::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1.5px;
          background: #c47d3e;
          border-radius: 1px;
          transition: width 0.35s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .ynk-nav-links li a:hover { color: #1a1a2e; }
        .ynk-nav-links li a:hover::after { width: 100%; }
        .ynk-nav-links li a.active { color: #c47d3e; }
        .ynk-nav-links li a.active::after { width: 100%; }

        /* Admin link - solo visible cuando hay sesión */
        .ynk-admin-link {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #9a8f84;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
          padding-bottom: 5px;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
        .ynk-admin-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1.5px;
          background: #c47d3e;
          border-radius: 1px;
          transition: width 0.35s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .ynk-admin-link:hover { color: #c47d3e; }
        .ynk-admin-link:hover::after { width: 100%; }
        .ynk-admin-link.active { color: #c47d3e; }
        .ynk-admin-link.active::after { width: 100%; }
        .ynk-admin-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #c47d3e;
          opacity: 0.8;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          z-index: 1001;
          color: #1a1a2e;
          transition: color 0.3s;
        }
        .mobile-menu-btn:hover { color: #c47d3e; }

        .mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.3);
          z-index: 999;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .mobile-overlay.show { opacity: 1; }

        @media (max-width: 768px) {
          .ynk-nav { padding: 0.9rem 1.5rem; }
          .mobile-menu-btn { display: flex; align-items: center; justify-content: center; }
          .mobile-overlay { display: block; pointer-events: none; }
          .mobile-overlay.show { pointer-events: auto; }
          .ynk-nav-links {
            position: fixed;
            top: 0;
            right: -100%;
            width: 75%;
            max-width: 320px;
            height: 100vh;
            background: white;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            gap: 1.8rem;
            padding: 2.5rem;
            transition: right 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
            box-shadow: -8px 0 30px rgba(0,0,0,0.08);
            z-index: 1000;
          }
          .ynk-nav-links.mobile-open { right: 0; }
          .ynk-nav-links li a { font-size: 0.95rem; }
        }
      `}</style>

      <nav className="ynk-nav">
        <Link to="/" className="ynk-logo">YNK <em>Trading</em></Link>
        
        <div 
          className={`mobile-overlay ${menuOpen ? 'show' : ''}`} 
          onClick={() => setMenuOpen(false)} 
        />

        <ul className={`ynk-nav-links ${menuOpen ? 'mobile-open' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link 
                to={link.path} 
                className={isActive(link.path) ? 'active' : ''}
              >
                {link.label}
              </Link>
            </li>
          ))}
          
          {/* Admin - solo visible si el usuario está logueado y es editor */}
          {user && isEditor && (
            <li>
              <Link 
                to="/admin" 
                className={`ynk-admin-link ${isActive('/admin') ? 'active' : ''}`}
              >
                <span className="ynk-admin-dot" />
                <Shield size={11} />
                Admin
              </Link>
            </li>
          )}
        </ul>

        <button 
          className="mobile-menu-btn" 
          onClick={() => setMenuOpen(!menuOpen)} 
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
    </>
  )
}