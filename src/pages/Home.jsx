import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'
import { getSiteSetting } from '../services/supabaseClient'
import { Loader2 } from 'lucide-react'

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
    { num: '01', title: 'Calidad Garantizada', text: 'Telas seleccionadas de los mejores proveedores del mundo, con estrictos controles de calidad en cada lote.' },
    { num: '02', title: 'Variedad de Colores', text: 'Amplia gama de colores y acabados para todos tus proyectos de diseño y confección.' },
    { num: '03', title: 'Te entregamos en bodega', text: 'Coordinamos la logística para que recibas tus materiales directamente en tu bodega o centro de operaciones.' },
  ]

  const collection = [
    { num: '01', title: 'Materiales Premium', text: 'Algodón egipcio, seda natural y lino belga disponibles en stock permanente.' },
    { num: '02', title: 'Diseño Exclusivo', text: 'Patrones únicos y estampados que marcan tendencia en la industria.' },
    { num: '03', title: 'Acabados de Lujo', text: 'Detalles y terminaciones que distinguen nuestros productos en el mercado.' },
  ]

  if (loading) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#fff', color: '#1a2332', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <Loader2 size={40} className="animate-spin" style={{ color: '#c47d3e' }} />
          <p style={{ color: '#9a8f84' }}>Cargando...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#fff', color: '#1a2332', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }

        .ynk-hero {
          position:relative; min-height:100vh; display:flex; align-items:center;
          background:#f8f4ef; overflow:hidden; padding-top:80px;
        }
        .ynk-hero-img-wrap {
          position:absolute; right:0; top:0; bottom:0; width:58%;
          clip-path:polygon(18% 0%, 100% 0%, 100% 100%, 0% 100%); overflow:hidden;
        }
        .ynk-hero-img-wrap img { width:100%; height:100%; object-fit:cover; }
        .ynk-hero-img-wrap::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(105deg, #f8f4ef 0%, transparent 30%);
        }
        .ynk-hero-img-accent {
          position:absolute; top:0; bottom:0; right:58%; width:3px;
          background:#c47d3e; transform:skewX(-6deg); z-index:3;
        }
        .ynk-hero-content { position:relative; z-index:5; max-width:520px; padding:0 5rem; }
        .ynk-eyebrow {
          font-size:0.72rem; font-weight:500; letter-spacing:0.22em;
          text-transform:uppercase; color:#c47d3e; margin-bottom:1.4rem;
          display:flex; align-items:center; gap:0.75rem;
        }
        .ynk-eyebrow::before { content:''; display:inline-block; width:28px; height:1.5px; background:#c47d3e; }
        .ynk-hero-title {
          font-family:'Playfair Display',serif; font-size:4rem; line-height:1.06;
          color:#1a2332; margin-bottom:1.6rem; font-weight:700;
        }
        .ynk-hero-title em { font-style:italic; color:#c47d3e; }
        .ynk-hero-desc {
          font-size:0.95rem; line-height:1.8; color:#5a6272;
          max-width:390px; margin-bottom:2.8rem;
        }
        .ynk-hero-actions { display:flex; gap:1rem; }
        .ynk-btn-dark {
          background:#1a2332; color:#fff; padding:0.9rem 2.2rem;
          font-size:0.75rem; font-weight:600; letter-spacing:0.12em;
          text-transform:uppercase; border:none; cursor:pointer;
          border-radius:40px; transition:all 0.3s ease;
        }
        .ynk-btn-dark:hover { background:#c47d3e; transform:translateY(-2px); }
        .ynk-btn-ghost {
          background:transparent; color:#1a2332; padding:0.9rem 2.2rem;
          font-size:0.75rem; font-weight:600; letter-spacing:0.12em;
          text-transform:uppercase; border:1.5px solid rgba(26,35,50,0.3);
          cursor:pointer; border-radius:40px; transition:all 0.3s ease;
        }
        .ynk-btn-ghost:hover { border-color:#c47d3e; color:#c47d3e; transform:translateY(-2px); }
        .ynk-side-links {
          position:absolute; right:2.5rem; bottom:3.5rem;
          display:flex; flex-direction:column; gap:1.4rem; z-index:10;
        }
        .ynk-side-links a {
          font-size:0.68rem; letter-spacing:0.2em; text-transform:uppercase;
          color:#1a2332; text-decoration:none; opacity:0.4;
          display:flex; align-items:center; gap:0.6rem;
        }
        .ynk-side-links a::after { content:''; display:block; width:20px; height:1px; background:currentColor; }
        .ynk-side-links a:hover { opacity:1; color:#c47d3e; }

        .ynk-stats { display:grid; grid-template-columns:repeat(3,1fr); border-top:1px solid #e5dfd7; border-bottom:1px solid #e5dfd7; }
        .ynk-stat { padding:2rem 3.5rem; border-right:1px solid #e5dfd7; }
        .ynk-stat:last-child { border-right:none; }
        .ynk-stat-num { font-family:'Playfair Display',serif; font-size:2.6rem; font-weight:700; color:#1a2332; }
        .ynk-stat-label { font-size:0.7rem; letter-spacing:0.18em; text-transform:uppercase; color:#9a8f84; }

        .ynk-features { padding:6rem 5rem; background:#fff; }
        .ynk-section-eyebrow {
          font-size:0.7rem; letter-spacing:0.22em; text-transform:uppercase;
          color:#c47d3e; margin-bottom:1rem; display:flex; align-items:center; gap:0.75rem;
        }
        .ynk-section-eyebrow::before { content:''; display:inline-block; width:28px; height:1.5px; background:#c47d3e; }
        .ynk-section-title { font-family:'Playfair Display',serif; font-size:3rem; color:#1a2332; margin-bottom:3.5rem; }
        .ynk-section-title em { font-style:italic; }
        .ynk-feat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; }
        .ynk-feat-card { padding:2.5rem 2rem; border:1px solid #ede8e2; transition:all 0.3s ease; }
        .ynk-feat-card:hover { background:#1a2332; transform:translateY(-4px); }
        .ynk-feat-card:hover .fc-num, .ynk-feat-card:hover .fc-title { color:#fff; }
        .ynk-feat-card:hover .fc-text { color:#8a9aaa; }
        .ynk-feat-card:hover .fc-bar { background:#c47d3e; }
        .fc-num { font-family:'Playfair Display',serif; font-size:0.85rem; color:#c47d3e; font-style:italic; margin-bottom:1.8rem; }
        .fc-bar { width:28px; height:2px; background:#1a2332; margin-bottom:1.2rem; }
        .fc-title { font-size:0.95rem; font-weight:600; color:#1a2332; margin-bottom:0.7rem; }
        .fc-text { font-size:0.85rem; color:#6b7280; line-height:1.7; }

        .ynk-collection { background:#1a2332; display:grid; grid-template-columns:1fr 1fr; }
        .ynk-coll-left { padding:6rem 5rem; }
        .ynk-coll-right { padding:6rem 5rem; border-left:1px solid rgba(255,255,255,0.07); }
        .coll-eyebrow { font-size:0.7rem; letter-spacing:0.22em; text-transform:uppercase; color:#c47d3e; margin-bottom:1rem; display:flex; align-items:center; gap:0.75rem; }
        .coll-eyebrow::before { content:''; display:inline-block; width:28px; height:1.5px; background:#c47d3e; }
        .coll-title { font-family:'Playfair Display',serif; font-size:3rem; color:#fff; margin-bottom:1.6rem; }
        .coll-title em { font-style:italic; color:#c47d3e; }
        .coll-desc { font-size:0.9rem; color:#7a8898; line-height:1.8; margin-bottom:2.8rem; }
        .ynk-btn-outline-light {
          background:transparent; color:#fff; padding:0.9rem 2.2rem;
          font-size:0.75rem; font-weight:600; letter-spacing:0.12em;
          text-transform:uppercase; border:1.5px solid rgba(255,255,255,0.25);
          cursor:pointer; border-radius:40px; transition:all 0.3s ease;
        }
        .ynk-btn-outline-light:hover { background:#c47d3e; border-color:#c47d3e; transform:translateY(-2px); }
        .coll-item { padding:1.8rem 0; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; gap:1.5rem; }
        .coll-item:first-child { border-top:1px solid rgba(255,255,255,0.06); }
        .ci-num { font-family:'Playfair Display',serif; font-size:0.75rem; color:#c47d3e; font-style:italic; min-width:28px; }
        .ci-title { font-size:0.9rem; font-weight:600; color:#fff; margin-bottom:0.4rem; }
        .ci-text { font-size:0.82rem; color:#566070; line-height:1.65; }

        .ynk-cta {
          padding:5.5rem 5rem; background:#f8f4ef;
          display:flex; align-items:center; justify-content:space-between; border-top:1px solid #e5dfd7;
        }
        .ynk-cta-text { font-family:'Playfair Display',serif; font-size:2.6rem; color:#1a2332; }
        .ynk-cta-text em { font-style:italic; color:#c47d3e; }
        .ynk-cta-actions { display:flex; gap:1rem; }

        .ynk-footer {
          padding:1.5rem 5rem; border-top:1px solid #e5dfd7;
          display:flex; justify-content:space-between; align-items:center; background:#fff;
        }
        .ynk-footer-copy { font-size:0.7rem; color:#9a8f84; }

        @media (max-width:900px) {
          .ynk-hero-content { padding:0 2rem; max-width:100%; }
          .ynk-hero-title { font-size:2.5rem; }
          .ynk-hero-img-wrap { width:45%; }
          .ynk-stats { grid-template-columns:1fr; }
          .ynk-stat { border-right:none; border-bottom:1px solid #e5dfd7; }
          .ynk-features { padding:4rem 2rem; }
          .ynk-feat-grid { grid-template-columns:1fr; }
          .ynk-collection { grid-template-columns:1fr; }
          .ynk-coll-left, .ynk-coll-right { padding:3.5rem 2rem; border-left:none; }
          .ynk-cta { flex-direction:column; gap:2rem; padding:4rem 2rem; text-align:center; }
          .ynk-side-links { display:none; }
          .ynk-footer { padding:1.5rem 2rem; flex-direction:column; gap:1rem; text-align:center; }
        }
      `}</style>

      <Navbar />

      {/* Hero */}
      <section className="ynk-hero">
        <div className="ynk-hero-img-wrap">
          <img src={heroBanner} alt="Exportación de telas YNK Trading" />
        </div>
        <div className="ynk-hero-img-accent" />
        <div className="ynk-hero-content">
          <p className="ynk-eyebrow">Exportación Textil · Internacional</p>
          <h1 className="ynk-hero-title">
            Telas de<br /><em>alta calidad</em><br />para el mundo
          </h1>
          <p className="ynk-hero-desc">
            Proveemos materiales textiles premium seleccionados de los mejores productores globales.
          </p>
          <div className="ynk-hero-actions">
            <button className="ynk-btn-dark" onClick={() => navigate('/catalogo')}>Ver Catálogo →</button>
            <button className="ynk-btn-ghost" onClick={() => navigate('/contacto')}>Contáctanos</button>
          </div>
        </div>
        <div className="ynk-side-links">
          <a href="/catalogo">Catálogo</a>
          <a href="/contacto">Contacto</a>
        </div>
      </section>

      {/* Stats - modificado */}
      <div className="ynk-stats">
        <div className="ynk-stat"><div className="ynk-stat-num">+200</div><div className="ynk-stat-label">Tipos de tela</div></div>
        <div className="ynk-stat"><div className="ynk-stat-num">15+</div><div className="ynk-stat-label">Años de experiencia</div></div>
        <div className="ynk-stat"><div className="ynk-stat-num">Entrega</div><div className="ynk-stat-label">Directo a bodega</div></div>
      </div>

      {/* Features */}
      <section className="ynk-features">
        <p className="ynk-section-eyebrow">Por qué elegirnos</p>
        <h2 className="ynk-section-title">Calidad que se<br /><em>siente al tacto</em></h2>
        <div className="ynk-feat-grid">
          {features.map(f => (
            <div className="ynk-feat-card" key={f.num}>
              <p className="fc-num">{f.num}</p>
              <div className="fc-bar" />
              <h3 className="fc-title">{f.title}</h3>
              <p className="fc-text">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Collection */}
      <section className="ynk-collection">
        <div className="ynk-coll-left">
          <p className="coll-eyebrow">Colección exclusiva</p>
          <h2 className="coll-title">Lo mejor de la<br /><em>industria textil</em></h2>
          <p className="coll-desc">Trabajamos con los proveedores más reconocidos para traerte materiales que marcan la diferencia.</p>
          <button className="ynk-btn-outline-light" onClick={() => navigate('/catalogo')}>Explorar catálogo →</button>
        </div>
        <div className="ynk-coll-right">
          {collection.map(item => (
            <div className="coll-item" key={item.num}>
              <span className="ci-num">{item.num}</span>
              <div>
                <p className="ci-title">{item.title}</p>
                <p className="ci-text">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="ynk-cta">
        <h2 className="ynk-cta-text">¿Listo para<br /><em>empezar?</em></h2>
        <div className="ynk-cta-actions">
          <button className="ynk-btn-dark" onClick={() => navigate('/catalogo')}>Ver Catálogo</button>
          <button className="ynk-btn-ghost" onClick={() => navigate('/contacto')}>Contáctanos</button>
        </div>
      </section>

      {/* Footer - sin links de términos */}
      <footer className="ynk-footer">
        <p className="ynk-footer-copy">© 2025 YNK Trading · Todos los derechos reservados</p>
      </footer>
    </div>
  )
}