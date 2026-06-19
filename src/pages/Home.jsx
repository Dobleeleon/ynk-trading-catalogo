import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'
import { getSiteSetting } from '../services/supabaseClient'
import { ArrowRight, ChevronDown, Award, Globe, Truck, Sparkles } from 'lucide-react'

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=85'

export function Home() {
  const navigate = useNavigate()
  const [heroBanner, setHeroBanner] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBanner = async () => {
      setLoading(true)
      try {
        const val = await getSiteSetting('home_banner')
        setHeroBanner(val || DEFAULT_BANNER)
      } catch (error) {
        console.error('Error cargando banner:', error)
        setHeroBanner(DEFAULT_BANNER)
      } finally {
        setLoading(false)
      }
    }
    loadBanner()
  }, [])

  const features = [
    { icon: Award, title: 'Calidad Garantizada', text: 'Telas seleccionadas de los mejores proveedores del mundo, con estrictos controles de calidad en cada lote.' },
    { icon: Globe, title: 'Variedad de Colores', text: 'Amplia gama de colores y acabados para todos tus proyectos de diseño y confección.' },
    { icon: Truck, title: 'Entrega Directa', text: 'Recibe tus pedidos directamente en tu bodega. Coordinamos la logística para que no te preocupes por nada.' },
  ]

  const stats = [
    { num: '+200', label: 'Tipos de tela', icon: Sparkles },
    { num: '15+', label: 'Años de experiencia', icon: Award },
    { num: 'Directo', label: 'Entrega a bodega', icon: Truck, note: '*Aplican restricciones' },
  ]

  const collection = [
    { title: 'Materiales Premium', text: 'Algodón egipcio, seda natural y lino belga disponibles en stock permanente.' },
    { title: 'Diseño Exclusivo', text: 'Patrones únicos y estampados que marcan tendencia en la industria.' },
    { title: 'Acabados de Lujo', text: 'Detalles y terminaciones que distinguen nuestros productos en el mercado.' },
  ]

  if (loading) {
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
            Cargando colección...
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
    <div className="home-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .home-page {
          font-family: 'DM Sans', -apple-system, sans-serif;
          background: #fcfbf9;
          color: #1a1a2e;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* ═══════ HERO - pegado al navbar ═══════ */
        .hero {
          position: relative;
          min-height: calc(100vh - 70px);
          display: flex;
          align-items: center;
          background: #f8f4ef;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 55%;
          clip-path: polygon(18% 0%, 100% 0%, 100% 100%, 0% 100%);
          overflow: hidden;
        }
        .hero-bg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .hero-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            rgba(26, 35, 50, 0.85) 0%,
            rgba(26, 35, 50, 0.45) 30%,
            rgba(26, 35, 50, 0.15) 60%,
            transparent 100%
          );
        }
        .hero-accent-line {
          position: absolute;
          top: 0;
          bottom: 0;
          right: 55%;
          width: 2px;
          background: linear-gradient(180deg, transparent 0%, #c47d3e 20%, #c47d3e 80%, transparent 100%);
          z-index: 3;
        }
        .hero-content {
          position: relative;
          z-index: 5;
          max-width: 540px;
          padding: 0 5rem;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #c47d3e;
          margin-bottom: 1.5rem;
          background: rgba(196,125,62,0.06);
          padding: 0.4rem 1rem;
          border-radius: 50px;
          border: 1px solid rgba(196,125,62,0.15);
        }
        .hero-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c47d3e;
          animation: blink 2s infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.5rem, 5.5vw, 4.2rem);
          line-height: 1.08;
          color: #1a1a2e;
          margin-bottom: 1.5rem;
          font-weight: 700;
        }
        .hero-title em {
          font-style: italic;
          color: #c47d3e;
          position: relative;
        }
        .hero-title em::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 0;
          width: 100%;
          height: 3px;
          background: rgba(196,125,62,0.2);
          border-radius: 2px;
        }
        .hero-desc {
          font-size: 1rem;
          line-height: 1.8;
          color: #5a6272;
          max-width: 400px;
          margin-bottom: 2.5rem;
        }
        .hero-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .hero-scroll {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 5;
          animation: bounceDown 2s infinite;
          opacity: 0.4;
          color: #1a1a2e;
        }
        @keyframes bounceDown {
          0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
          40% { transform: translateX(-50%) translateY(8px); }
          60% { transform: translateX(-50%) translateY(4px); }
        }

        /* ═══════ BOTONES ═══════ */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #1a2332;
          color: white;
          padding: 0.85rem 1.8rem;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          border: none;
          cursor: pointer;
          border-radius: 50px;
          transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          text-decoration: none;
          white-space: nowrap;
        }
        .btn-primary:hover {
          background: #c47d3e;
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(196,125,62,0.3);
        }
        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          color: #1a1a2e;
          padding: 0.85rem 1.8rem;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          border: 1.5px solid rgba(26,26,46,0.2);
          cursor: pointer;
          border-radius: 50px;
          transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          white-space: nowrap;
        }
        .btn-outline:hover {
          border-color: #c47d3e;
          color: #c47d3e;
          background: rgba(196,125,62,0.03);
          transform: translateY(-3px);
        }
        .btn-outline-light {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          color: white;
          padding: 0.85rem 1.8rem;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          border: 1.5px solid rgba(255,255,255,0.2);
          cursor: pointer;
          border-radius: 50px;
          transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          white-space: nowrap;
        }
        .btn-outline-light:hover {
          background: #c47d3e;
          border-color: #c47d3e;
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(196,125,62,0.3);
        }

        /* ═══════ STATS ═══════ */
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid #e8e3d9;
          border-bottom: 1px solid #e8e3d9;
          background: white;
        }
        .stat-item {
          padding: 2.5rem 2rem;
          text-align: center;
          border-right: 1px solid #f0ebe4;
          transition: all 0.3s ease;
        }
        .stat-item:last-child { border-right: none; }
        .stat-item:hover { background: #fefdfb; }
        .stat-icon-wrap {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: #fef9f4;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: #c47d3e;
        }
        .stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 2.2rem;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 0.3rem;
        }
        .stat-label {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #9a8f84;
        }
        .stat-note {
          font-size: 0.6rem;
          color: #b0a89c;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          flex-wrap: wrap;
        }
        .stat-note-btn {
          background: none;
          border: none;
          color: #c47d3e;
          font-size: 0.6rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0.2rem 0.5rem;
          border-radius: 20px;
          transition: all 0.2s;
        }
        .stat-note-btn:hover { background: rgba(196,125,62,0.08); }

        /* ═══════ FEATURES ═══════ */
        .features-section {
          padding: 6rem 5rem;
          background: white;
        }
        .section-header { margin-bottom: 4rem; }
        .section-eyebrow {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #c47d3e;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .section-eyebrow::before {
          content: '';
          display: inline-block;
          width: 32px;
          height: 1.5px;
          background: #c47d3e;
          border-radius: 1px;
        }
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 3.2rem);
          color: #1a1a2e;
          line-height: 1.15;
          font-weight: 700;
        }
        .section-title em { font-style: italic; color: #c47d3e; }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .feature-card {
          background: #fcfbf9;
          border-radius: 20px;
          padding: 2.5rem 2rem;
          border: 1px solid #ede8df;
          transition: all 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #c47d3e, #d4954e);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .feature-card:hover::before { transform: scaleX(1); }
        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.06);
          border-color: rgba(196,125,62,0.2);
          background: white;
        }
        .feature-icon-wrap {
          width: 52px; height: 52px;
          border-radius: 14px;
          background: #fef9f4;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          color: #c47d3e;
          transition: all 0.4s ease;
        }
        .feature-card:hover .feature-icon-wrap {
          background: #c47d3e;
          color: white;
          box-shadow: 0 6px 16px rgba(196,125,62,0.25);
        }
        .feature-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem;
          font-weight: 600;
          color: #1a1a2e;
          margin-bottom: 0.75rem;
        }
        .feature-text {
          font-size: 0.88rem;
          color: #6b7280;
          line-height: 1.7;
        }

        /* ═══════ COLLECTION ═══════ */
        .collection-section {
          background: #1a2332;
          display: grid;
          grid-template-columns: 1fr 1fr;
          position: relative;
          overflow: hidden;
        }
        .collection-section::before {
          content: '';
          position: absolute;
          top: -30%;
          right: -15%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(196,125,62,0.06) 0%, transparent 70%);
          border-radius: 50%;
        }
        .collection-left {
          padding: 6rem 5rem;
          position: relative;
          z-index: 1;
        }
        .collection-right {
          padding: 6rem 5rem;
          border-left: 1px solid rgba(255,255,255,0.06);
          position: relative;
          z-index: 1;
        }
        .collection-eyebrow {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #c47d3e;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .collection-eyebrow::before {
          content: '';
          display: inline-block;
          width: 32px;
          height: 1.5px;
          background: #c47d3e;
          border-radius: 1px;
        }
        .collection-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem, 3.5vw, 2.8rem);
          color: white;
          margin-bottom: 1.5rem;
          line-height: 1.15;
        }
        .collection-title em { font-style: italic; color: #c47d3e; }
        .collection-desc {
          font-size: 0.9rem;
          color: #7a8898;
          line-height: 1.8;
          margin-bottom: 2.5rem;
          max-width: 380px;
        }
        .collection-item {
          padding: 1.6rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: all 0.3s ease;
        }
        .collection-item:first-child { border-top: 1px solid rgba(255,255,255,0.05); }
        .collection-item:hover { padding-left: 0.5rem; }
        .collection-item-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: white;
          margin-bottom: 0.4rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .collection-item-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #c47d3e;
          flex-shrink: 0;
        }
        .collection-item-text {
          font-size: 0.82rem;
          color: #566070;
          line-height: 1.6;
          padding-left: 1.3rem;
        }

        /* ═══════ CTA ═══════ */
        .cta-section {
          padding: 5rem 5rem;
          background: #f8f4ef;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          border-top: 1px solid #e8e3d9;
        }
        .cta-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem, 3.5vw, 2.6rem);
          color: #1a1a2e;
          line-height: 1.15;
        }
        .cta-title em { font-style: italic; color: #c47d3e; }
        .cta-actions {
          display: flex;
          gap: 1rem;
          flex-shrink: 0;
        }

        /* ═══════ FOOTER ═══════ */
        .footer {
          background: #1a2332;
          padding: 2.5rem 2rem;
          text-align: center;
          flex-shrink: 0;
          margin-top: auto;
        }
        .footer p {
          font-size: 0.78rem;
          color: #6b7280;
          margin: 0;
        }

        /* ═══════════════════════════════════════════
           RESPONSIVE
           ═══════════════════════════════════════════ */
        @media (max-width: 1024px) {
          .hero-content { padding: 0 3rem; }
          .hero-bg { width: 50%; }
          .hero-accent-line { right: 50%; }
          .features-section { padding: 4rem 3rem; }
          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .collection-left, .collection-right { padding: 4rem 3rem; }
          .cta-section { padding: 4rem 3rem; }
        }

        @media (max-width: 768px) {
          .hero {
            min-height: auto;
            flex-direction: column;
          }
          .hero-bg {
            position: relative;
            width: 100%;
            height: 320px;
            clip-path: none;
            order: -1;
          }
          .hero-bg-overlay {
            background: linear-gradient(
              180deg,
              rgba(26, 35, 50, 0.7) 0%,
              rgba(26, 35, 50, 0.3) 50%,
              rgba(26, 35, 50, 0.15) 100%
            );
          }
          .hero-accent-line { display: none; }
          .hero-content {
            padding: 2rem 1.5rem;
            max-width: 100%;
          }
          .hero-title { font-size: 2.2rem; }
          .hero-desc { font-size: 0.9rem; }
          .hero-scroll { bottom: 1rem; }

          .stats-bar { grid-template-columns: 1fr; }
          .stat-item {
            border-right: none;
            border-bottom: 1px solid #f0ebe4;
            padding: 2rem 1.5rem;
          }
          .stat-item:last-child { border-bottom: none; }

          .features-section { padding: 3rem 1.5rem; }
          .features-grid { grid-template-columns: 1fr; }
          .section-header { margin-bottom: 2.5rem; }

          .collection-section { grid-template-columns: 1fr; }
          .collection-left, .collection-right {
            padding: 3rem 1.5rem;
            border-left: none;
          }
          .collection-right { border-top: 1px solid rgba(255,255,255,0.06); }

          .cta-section {
            flex-direction: column;
            text-align: center;
            padding: 3rem 1.5rem;
            gap: 1.5rem;
          }
          .cta-actions { flex-direction: column; width: 100%; }
          .hero-actions { flex-direction: column; width: 100%; }
          .btn-primary, .btn-outline, .btn-outline-light {
            justify-content: center;
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .hero-bg { height: 250px; }
          .hero-content { padding: 1.5rem 1rem; }
          .hero-title { font-size: 1.8rem; }
          .hero-desc { font-size: 0.85rem; }
          .hero-badge { font-size: 0.62rem; padding: 0.3rem 0.8rem; }

          .features-section { padding: 2.5rem 1rem; }
          .feature-card { padding: 1.75rem 1.25rem; }
          .section-title { font-size: 1.7rem; }

          .collection-left, .collection-right { padding: 2.5rem 1rem; }
          .collection-title { font-size: 1.6rem; }

          .cta-section { padding: 2.5rem 1rem; }
          .cta-title { font-size: 1.6rem; }

          .stat-num { font-size: 1.8rem; }

          .btn-primary, .btn-outline, .btn-outline-light {
            padding: 0.75rem 1.5rem;
            font-size: 0.75rem;
          }
        }
      `}</style>

      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <img src={heroBanner} alt="Exportación de telas YNK Trading" />
          <div className="hero-bg-overlay" />
        </div>
        <div className="hero-accent-line" />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Exportación Textil Internacional
          </div>
          <h1 className="hero-title">
            Telas de <em>alta calidad</em> para el mundo
          </h1>
          <p className="hero-desc">
            Proveemos materiales textiles premium seleccionados de los mejores 
            productores globales para la industria de la confección.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/catalogo')}>
              Ver Catálogo
              <ArrowRight size={16} />
            </button>
            <button className="btn-outline" onClick={() => navigate('/contacto')}>
              Contáctanos
            </button>
          </div>
        </div>

        <div className="hero-scroll">
          <ChevronDown size={22} />
        </div>
      </section>

      {/* STATS */}
      <div className="stats-bar">
        {stats.map((stat, idx) => (
          <div className="stat-item" key={idx}>
            <div className="stat-icon-wrap"><stat.icon size={20} /></div>
            <div className="stat-num">{stat.num}</div>
            <div className="stat-label">{stat.label}</div>
            {stat.note && (
              <div className="stat-note">
                <span>*{stat.note}</span>
                <button className="stat-note-btn" onClick={() => navigate('/contacto')}>
                  Consultar →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <section className="features-section">
        <div className="section-header">
          <p className="section-eyebrow">Por qué elegirnos</p>
          <h2 className="section-title">
            Calidad que se <em>siente al tacto</em>
          </h2>
        </div>
        <div className="features-grid">
          {features.map((f, idx) => (
            <div className="feature-card" key={idx}>
              <div className="feature-icon-wrap"><f.icon size={24} /></div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-text">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COLLECTION */}
      <section className="collection-section">
        <div className="collection-left">
          <p className="collection-eyebrow">Colección exclusiva</p>
          <h2 className="collection-title">
            Lo mejor de la <em>industria textil</em>
          </h2>
          <p className="collection-desc">
            Trabajamos con los proveedores más reconocidos para traerte 
            materiales que marcan la diferencia en cada proyecto.
          </p>
          <button className="btn-outline-light" onClick={() => navigate('/catalogo')}>
            Explorar catálogo
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="collection-right">
          {collection.map((item, idx) => (
            <div className="collection-item" key={idx}>
              <p className="collection-item-title">
                <span className="collection-item-dot" />
                {item.title}
              </p>
              <p className="collection-item-text">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="cta-title">
          ¿Listo para <em>empezar?</em>
        </h2>
        <div className="cta-actions">
          <button className="btn-primary" onClick={() => navigate('/catalogo')}>
            Ver Catálogo
            <ArrowRight size={16} />
          </button>
          <button className="btn-outline" onClick={() => navigate('/contacto')}>
            Contáctanos
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>© 2025 YNK Trading · Todos los derechos reservados</p>
      </footer>
    </div>
  )
}