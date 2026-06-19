import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, Clock, MessageCircle, Sparkles, Award, Lightbulb, Handshake, Globe, Shield } from 'lucide-react'
import { getSiteSetting } from '../services/supabaseClient'
import { Navbar } from '../components/layout/Navbar'

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=85'

export function Contacto() {
  const [bannerImage, setBannerImage] = useState(DEFAULT_BANNER)
  const [bannerLoading, setBannerLoading] = useState(true)

  useEffect(() => {
    const loadBanner = async () => {
      setBannerLoading(true)
      try {
        const val = await getSiteSetting('contacto_banner')
        if (val) setBannerImage(val)
      } catch (error) {
        console.error('Error cargando banner:', error)
      } finally {
        setBannerLoading(false)
      }
    }
    loadBanner()
  }, [])

  const infoContacto = [
    { icon: Phone, title: 'Teléfono', content: '+57 315 062 68 85', detail: 'Lunes a Viernes 9am - 6pm' },
    { icon: Mail, title: 'Email', content: 'Adrianao.ynk@gmail.com', detail: 'Respuesta en menos de 24h' },
    { icon: Clock, title: 'Horario', content: 'Lun - Sáb: 7am - 6pm'}
  ]

  const valores = [
    { icon: Award, titulo: 'Calidad Premium', descripcion: 'Seleccionamos los mejores materiales de productores líderes a nivel mundial para garantizar la excelencia en cada producto.' },
    { icon: Lightbulb, titulo: 'Innovación', descripcion: 'Buscamos constantemente nuevas tendencias y tecnologías textiles para ofrecer soluciones vanguardistas.' },
    { icon: Handshake, titulo: 'Compromiso', descripcion: 'Nos dedicamos a superar las expectativas de nuestros clientes con un servicio personalizado y ágil.' },
    { icon: Globe, titulo: 'Alcance Global', descripcion: 'Conectamos los mejores productores internacionales con la industria textil de múltiples países.' }
  ]

  if (bannerLoading) {
    return (
      <div style={{ 
        fontFamily: "'DM Sans', sans-serif", 
        background: '#fcfbf9', 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Navbar />
        <div style={{ 
          flex: 1,
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '2rem'
        }}>
          <div className="spinner">
            <div className="spinner-ring" />
            <div className="spinner-ring" />
            <div className="spinner-ring" />
          </div>
          <p style={{ 
            fontFamily: "'Playfair Display', serif", 
            color: '#9a8f84', 
            fontSize: '1rem' 
          }}>
            Cargando...
          </p>
        </div>
        <style>{`
          .spinner { position: relative; width: 56px; height: 56px; }
          .spinner-ring { position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid transparent; animation: spinRing 1.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite; }
          .spinner-ring:nth-child(1) { border-top-color: #c47d3e; }
          .spinner-ring:nth-child(2) { border-right-color: #1a2332; animation-delay: -0.5s; width: 75%; height: 75%; top: 12.5%; left: 12.5%; }
          .spinner-ring:nth-child(3) { border-bottom-color: #e5dfd7; animation-delay: -1s; width: 50%; height: 50%; top: 25%; left: 25%; }
          @keyframes spinRing { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  return (
    <div className="contacto-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .contacto-page {
          font-family: 'DM Sans', -apple-system, sans-serif;
          background: #fcfbf9;
          color: #1a1a2e;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* Banner */
        .banner {
          position: relative;
          height: 380px;
          background-size: cover;
          background-position: center 30%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .banner::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.55) 100%);
        }
        .banner-inner {
          position: relative;
          z-index: 2;
          text-align: center;
          color: white;
          padding: 0 2rem;
        }
        .banner-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.18);
          padding: 0.4rem 1.2rem;
          border-radius: 50px;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }
        .banner-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 700;
          line-height: 1.15;
          margin: 0 0 0.75rem;
          text-shadow: 0 2px 15px rgba(0,0,0,0.3);
        }
        .banner-title em { font-style: italic; color: #d4954e; }
        .banner-sub {
          font-size: 1.05rem;
          font-weight: 300;
          opacity: 0.9;
          max-width: 550px;
          margin: 0 auto;
          line-height: 1.5;
        }

        /* Contenedor principal - crece para empujar el footer abajo */
        .main-content {
          flex: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 3.5rem 2rem;
          width: 100%;
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .section-label {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #c47d3e;
          margin-bottom: 0.75rem;
        }
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 2.8rem);
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 1rem;
          line-height: 1.2;
        }
        .section-title em { font-style: italic; color: #c47d3e; }
        .section-desc {
          color: #6b7280;
          max-width: 650px;
          margin: 0 auto;
          font-size: 0.95rem;
          line-height: 1.7;
        }

        .valores-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
          margin-bottom: 4rem;
        }
        .valor-card {
          background: white;
          border-radius: 18px;
          padding: 1.75rem 1.5rem;
          text-align: center;
          border: 1px solid #ede8df;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          cursor: default;
          box-shadow: 0 1px 4px rgba(0,0,0,0.03);
        }
        .valor-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 32px rgba(0,0,0,0.08);
          border-color: rgba(196,125,62,0.3);
        }
        .valor-icon-wrap {
          width: 56px; height: 56px;
          border-radius: 14px;
          background: #fef9f4;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
          transition: all 0.4s ease;
          color: #c47d3e;
        }
        .valor-card:hover .valor-icon-wrap {
          background: #c47d3e;
          color: white;
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(196,125,62,0.2);
        }
        .valor-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem;
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 0.6rem;
          transition: color 0.3s;
        }
        .valor-card:hover .valor-title { color: #c47d3e; }
        .valor-desc {
          font-size: 0.85rem;
          color: #6b7280;
          line-height: 1.65;
        }

        .contacto-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 4rem;
        }
        .contacto-card {
          background: white;
          border-radius: 20px;
          padding: 2rem 1.75rem;
          text-align: center;
          border: 1px solid #ede8df;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          box-shadow: 0 1px 4px rgba(0,0,0,0.03);
        }
        .contacto-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 32px rgba(0,0,0,0.08);
          border-color: rgba(196,125,62,0.3);
        }
        .contacto-icon-wrap {
          width: 64px; height: 64px;
          border-radius: 16px;
          background: linear-gradient(135deg, #fef9f4 0%, #f8f4ef 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
          transition: all 0.4s ease;
          border: 1px solid #ede8df;
        }
        .contacto-card:hover .contacto-icon-wrap {
          background: linear-gradient(135deg, #c47d3e 0%, #d4954e 100%);
          border-color: #c47d3e;
          transform: scale(1.05);
          box-shadow: 0 8px 20px rgba(196,125,62,0.25);
        }
        .contacto-icon-wrap svg { color: #c47d3e; transition: color 0.3s; }
        .contacto-card:hover .contacto-icon-wrap svg { color: white; }
        .contacto-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 0.5rem;
        }
        .contacto-card-content {
          font-size: 1rem;
          font-weight: 600;
          color: #c47d3e;
          margin-bottom: 0.3rem;
          word-break: break-word;
        }
        .contacto-card-detail {
          font-size: 0.78rem;
          color: #9a8f84;
        }

        .cta-section {
          text-align: center;
          background: linear-gradient(135deg, #1a2332 0%, #2a3a4f 100%);
          border-radius: 24px;
          padding: 3.5rem 2rem;
          color: white;
          position: relative;
          overflow: hidden;
        }
        .cta-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(196,125,62,0.12) 0%, transparent 70%);
          border-radius: 50%;
        }
        .cta-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          position: relative;
          z-index: 1;
          color: white;
        }
        .cta-desc {
          font-size: 0.95rem;
          opacity: 0.8;
          max-width: 500px;
          margin: 0 auto 2rem;
          line-height: 1.6;
          position: relative;
          z-index: 1;
        }
        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.9rem 2rem;
          border-radius: 50px;
          font-size: 0.9rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
          background: #c47d3e;
          color: white;
          text-decoration: none;
        }
        .cta-btn:hover {
          background: #d4954e;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(196,125,62,0.4);
        }

        /* Footer - SIEMPRE VISIBLE */
        .footer {
          background: #1a2332;
          padding: 2.5rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
          margin-top: auto;
        }
        .footer p {
          font-size: 0.78rem;
          color: #6b7280;
          margin: 0;
        }
        .footer-admin-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.7rem;
          font-weight: 500;
          color: #6b7280;
          text-decoration: none;
          padding: 0.4rem 1rem;
          border-radius: 20px;
          border: 1px solid rgba(107, 114, 128, 0.2);
          transition: all 0.3s ease;
          letter-spacing: 0.04em;
        }
        .footer-admin-btn:hover {
          color: #c47d3e;
          border-color: rgba(196, 125, 62, 0.3);
          background: rgba(196, 125, 62, 0.06);
        }

        @media (max-width: 768px) {
          .banner { height: 300px; }
          .banner-title { font-size: 2rem; }
          .banner-sub { font-size: 0.9rem; }
          .main-content { padding: 2rem 1.25rem; }
        }
      `}</style>

      <Navbar />

      {/* Banner */}
      <div className="banner" style={{ backgroundImage: `url(${bannerImage})` }}>
        <div className="banner-inner">
          <span className="banner-badge"><Sparkles size={13} />YNK Trading</span>
          <h1 className="banner-title">Contacto & <em>Sobre Nosotros</em></h1>
          <p className="banner-sub">Conoce más sobre nuestra empresa y contáctanos para cualquier consulta</p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="main-content">
        <div className="section-header">
          <span className="section-label">Nuestra Empresa</span>
          <h2 className="section-title">Sobre <em>YNK Trading</em></h2>
          <p className="section-desc">
            Somos una empresa dedicada a la importación y distribución de telas de alta calidad, 
            conectando los mejores productores globales con la industria textil de Panamá 
            y otros mercados internacionales.
          </p>
        </div>

        <div className="valores-grid">
          {valores.map((valor, idx) => (
            <div key={idx} className="valor-card">
              <div className="valor-icon-wrap"><valor.icon size={26} /></div>
              <h3 className="valor-title">{valor.titulo}</h3>
              <p className="valor-desc">{valor.descripcion}</p>
            </div>
          ))}
        </div>

        <div className="section-header" style={{ marginBottom: '2rem' }}>
          <span className="section-label">Contáctanos</span>
          <h2 className="section-title" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)' }}>
            Estamos para <em>ayudarte</em>
          </h2>
        </div>

        <div className="contacto-grid">
          {infoContacto.map((item, idx) => (
            <div key={idx} className="contacto-card">
              <div className="contacto-icon-wrap"><item.icon size={28} /></div>
              <h3 className="contacto-card-title">{item.title}</h3>
              <p className="contacto-card-content">{item.content}</p>
              {item.detail && <p className="contacto-card-detail">{item.detail}</p>}
            </div>
          ))}
        </div>

        <div className="cta-section">
          <h2 className="cta-title">¿Listo para trabajar con nosotros?</h2>
          <p className="cta-desc">
            Contáctanos hoy mismo y descubre cómo nuestras telas premium pueden 
            transformar tus proyectos textiles.
          </p>
          <a href="mailto:Adrianao.ynk@gmail.com" className="cta-btn">
            <MessageCircle size={18} />
            Escríbenos ahora
          </a>
        </div>
      </div>

      {/* Footer con botón de Administración */}
      <footer className="footer">
        <p>© 2025 YNK Trading · Todos los derechos reservados</p>
        <Link to="/login" className="footer-admin-btn" title="Panel de administración">
          <Shield size={12} />
          Administración
        </Link>
      </footer>
    </div>
  )
}