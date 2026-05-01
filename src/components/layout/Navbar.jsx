import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  const navLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/catalogo', label: 'Catálogo' },
    { path: '/admin', label: 'Admin' },
    { path: '/contacto', label: 'Contacto' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      <style>{`
        .ynk-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 5rem;
          background: ${scrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)'};
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .ynk-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          font-weight: 700;
          background: linear-gradient(135deg, #1a2332 0%, #c47d3e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.02em;
          cursor: pointer;
          text-decoration: none;
        }

        .ynk-logo span {
          font-style: italic;
          color: #c47d3e;
          background: none;
          -webkit-text-fill-color: #c47d3e;
        }

        .ynk-nav-links {
          display: flex;
          gap: 2.5rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .ynk-nav-links li a {
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #1a2332;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
          padding-bottom: 4px;
        }

        .ynk-nav-links li a::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: #c47d3e;
          transition: width 0.3s ease;
        }

        .ynk-nav-links li a:hover::after {
          width: 100%;
        }

        .ynk-nav-links li a:hover {
          color: #c47d3e;
        }

        .ynk-nav-links li a.active {
          color: #c47d3e;
        }

        .ynk-nav-links li a.active::after {
          width: 100%;
        }

        /* Mobile menu button */
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          z-index: 1001;
        }

        .mobile-menu-btn span {
          display: block;
          width: 25px;
          height: 2px;
          background: #1a2332;
          margin: 5px 0;
          transition: all 0.3s ease;
        }

        @media (max-width: 768px) {
          .ynk-nav {
            padding: 1rem 1.5rem;
          }

          .mobile-menu-btn {
            display: block;
          }

          .ynk-nav-links {
            position: fixed;
            top: 0;
            right: -100%;
            width: 70%;
            height: 100vh;
            background: white;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 2rem;
            transition: right 0.3s ease;
            box-shadow: -5px 0 20px rgba(0, 0, 0, 0.1);
            z-index: 1000;
          }

          .ynk-nav-links.mobile-open {
            right: 0;
          }

          .ynk-nav-links li a {
            font-size: 1.1rem;
          }
        }
      `}</style>

      <nav className="ynk-nav">
        <Link to="/" className="ynk-logo">
          YNK <span>TRADING</span>
        </Link>
        
        <ul className={`ynk-nav-links ${menuOpen ? 'mobile-open' : ''}`} id="navLinks">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link to={link.path} className={isActive(link.path) ? 'active' : ''}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>
    </>
  )
}