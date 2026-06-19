import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, Filter, Grid, List, X, ChevronDown, Palette, Sparkles } from 'lucide-react'
import { telaService, categoriaService, colorService } from '../services/api'
import { getSiteSetting } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { TarjetaTela } from '../components/catalogo/TarjetaTela'
import { Filtros } from '../components/catalogo/Filtros'
import { CatalogoEditorFashion } from '../components/CatalogoEditorFashion'
import { Modal } from '../components/ui/Modal'
import { DetalleTelaModal } from '../components/catalogo/DetalleTelaModal'
import { Navbar } from '../components/layout/Navbar'
import toast from 'react-hot-toast'

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=85'
const ITEMS_PER_PAGE = 12

function Paginacion({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage > 3) pages.push(1, '...')
      for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
        pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push('...', totalPages)
    }
    return pages
  }

  return (
    <div className="pagination-wrapper">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">Anterior</button>
      {getPageNumbers().map((page, idx) => (
        <button key={idx} onClick={() => typeof page === 'number' && onPageChange(page)} className={`pagination-num ${currentPage === page ? 'active' : ''} ${typeof page !== 'number' ? 'dots' : ''}`} disabled={typeof page !== 'number'}>{page}</button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-btn">Siguiente</button>
    </div>
  )
}

export function Catalogo() {
  const { user, isEditor } = useAuth()
  const [bannerImage, setBannerImage] = useState(null)
  const [bannerLoading, setBannerLoading] = useState(true)
  const [telas, setTelas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [colores, setColores] = useState([])
  const [filtros, setFiltros] = useState({ categoriaId: 'todos', colorId: null })
  const [busqueda, setBusqueda] = useState('')
  const [vista, setVista] = useState('grid')
  const [cargando, setCargando] = useState(true)
  const [telaSeleccionada, setTelaSeleccionada] = useState(null)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [ordenPor, setOrdenPor] = useState('nombre')
  const [ordenDir, setOrdenDir] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const loadBanner = async () => {
      try {
        const val = await getSiteSetting('catalogo_banner')
        setBannerImage(val || DEFAULT_BANNER)
      } catch (error) {
        console.error('Error cargando banner:', error)
        setBannerImage(DEFAULT_BANNER)
      } finally {
        setBannerLoading(false)
      }
    }
    loadBanner()
  }, [])

  useEffect(() => {
    const cargarDatosOptimizado = async () => {
      try {
        const cached = sessionStorage.getItem('catalogo_cache')
        if (cached) {
          const { telas: tCache, categorias: cCache, colores: colCache, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            setTelas(tCache)
            setCategorias(cCache)
            setColores(colCache)
            setCargando(false)
            return
          }
        }
        const [telasData, categoriasData, coloresData] = await Promise.all([
          telaService.obtenerTodas(),
          categoriaService.obtenerTodas(),
          colorService.obtenerTodos()
        ])
        setTelas(telasData)
        setCategorias(categoriasData)
        setColores(coloresData)
        sessionStorage.setItem('catalogo_cache', JSON.stringify({
          telas: telasData, categorias: categoriasData, colores: coloresData, timestamp: Date.now()
        }))
      } catch (error) {
        toast.error('Error al cargar los datos')
        console.error(error)
      } finally {
        setCargando(false)
      }
    }
    cargarDatosOptimizado()
  }, [])

  const telasFiltradas_ = useMemo(() => {
    let filtradas = [...telas]
    if (busqueda) {
      const q = busqueda.toLowerCase()
      filtradas = filtradas.filter(t =>
        t.nombre?.toLowerCase().includes(q) ||
        t.referencia?.toLowerCase().includes(q) ||
        t.composicion?.toLowerCase().includes(q)
      )
    }
    if (filtros.categoriaId !== 'todos') {
      filtradas = filtradas.filter(t => t.categoria_id === parseInt(filtros.categoriaId))
    }
    if (filtros.colorId) {
      filtradas = filtradas.filter(t => t.tela_colores?.some(tc => tc.colores.id === filtros.colorId))
    }
    filtradas.sort((a, b) => {
      let valA, valB
      switch (ordenPor) {
        case 'referencia': valA = a.referencia || ''; valB = b.referencia || ''; break
        case 'peso': valA = parseFloat(a.peso) || 0; valB = parseFloat(b.peso) || 0; break
        default: valA = a.nombre || ''; valB = b.nombre || ''
      }
      return ordenDir === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1)
    })
    return filtradas
  }, [telas, busqueda, filtros, ordenPor, ordenDir])

  const paginatedTelas = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return telasFiltradas_.slice(start, start + ITEMS_PER_PAGE)
  }, [telasFiltradas_, currentPage])

  const totalPages = Math.ceil(telasFiltradas_.length / ITEMS_PER_PAGE)

  useEffect(() => { setCurrentPage(1) }, [busqueda, filtros, ordenPor, ordenDir])

  useEffect(() => {
    if (showEditor) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => { document.body.style.overflow = 'auto' }
  }, [showEditor])

  const handleFiltroChange = useCallback((key, value) => setFiltros(prev => ({ ...prev, [key]: value })), [])
  const handleOrdenar = useCallback((campo, direccion) => { setOrdenPor(campo); setOrdenDir(direccion) }, [])
  const handleLimpiarFiltros = useCallback(() => {
    setFiltros({ categoriaId: 'todos', colorId: null })
    setBusqueda('')
    setMostrarFiltros(false)
    setOrdenPor('nombre')
    setOrdenDir('asc')
  }, [])

  const filtrosActivos = filtros.categoriaId !== 'todos' || filtros.colorId !== null || ordenPor !== 'nombre'

  if (bannerLoading || cargando) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#fcfbf9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
          <div className="spinner">
            <div className="spinner-ring" />
            <div className="spinner-ring" />
            <div className="spinner-ring" />
          </div>
          <p style={{ fontFamily: "'Playfair Display', serif", color: '#9a8f84', fontSize: '1rem' }}>Cargando catálogo...</p>
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
    <div className="catalogo-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .catalogo-page {
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
          height: 340px;
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
          background: linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.5) 100%);
        }
        .banner-inner {
          position: relative;
          z-index: 2;
          text-align: center;
          color: white;
          padding: 0 2rem;
        }
        .banner-tag {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(6px);
          padding: 0.35rem 1.2rem;
          border-radius: 50px;
          margin-bottom: 1.25rem;
          border: 1px solid rgba(255,255,255,0.18);
        }
        .banner-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 5.5vw, 3.8rem);
          font-weight: 700;
          line-height: 1.15;
          margin: 0;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .banner-title em { font-style: italic; color: #d4954e; }
        .banner-sub {
          font-size: 1.05rem;
          font-weight: 300;
          opacity: 0.85;
          margin-top: 0.75rem;
          letter-spacing: 0.03em;
        }

        /* Contenedor principal */
        .main-content {
          flex: 1;
          max-width: 1280px;
          margin: 0 auto;
          padding: 2.5rem 2rem;
          width: 100%;
        }

        /* Barra de búsqueda */
        .search-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          align-items: center;
        }
        .search-input-wrap {
          flex: 1;
          min-width: 220px;
          position: relative;
        }
        .search-field {
          width: 100%;
          padding: 0.8rem 1rem 0.8rem 2.8rem;
          border: 1.5px solid #e8e3d9;
          border-radius: 14px;
          font-size: 0.88rem;
          font-family: 'DM Sans', sans-serif;
          background: white;
          transition: all 0.25s ease;
          outline: none;
          color: #1a1a2e;
        }
        .search-field::placeholder { color: #bfb8ad; }
        .search-field:focus {
          border-color: #c47d3e;
          box-shadow: 0 0 0 3px rgba(196,125,62,0.08);
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #bfb8ad;
          pointer-events: none;
        }

        /* Botones */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1.2rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.25s ease;
          border: none;
          white-space: nowrap;
          letter-spacing: 0.01em;
        }
        .btn-outline {
          background: white;
          color: #1a1a2e;
          border: 1.5px solid #e8e3d9;
        }
        .btn-outline:hover { border-color: #c47d3e; color: #c47d3e; background: #fef9f4; }
        .btn-outline.is-active { background: #c47d3e; border-color: #c47d3e; color: white; }
        .btn-primary { background: #1a2332; color: white; }
        .btn-primary:hover { background: #c47d3e; transform: translateY(-1px); box-shadow: 0 4px 15px rgba(196,125,62,0.3); }
        .badge {
          font-size: 0.6rem;
          background: rgba(255,255,255,0.25);
          padding: 0.12rem 0.45rem;
          border-radius: 20px;
          font-weight: 600;
        }

        /* Toggle vista */
        .view-toggle {
          display: flex;
          background: #f3f0ea;
          border-radius: 12px;
          padding: 3px;
        }
        .view-btn {
          padding: 0.4rem 0.65rem;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          background: transparent;
          color: #9a8f84;
          transition: all 0.25s;
          display: flex;
          align-items: center;
        }
        .view-btn.is-active { background: white; color: #c47d3e; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

        /* Panel filtros */
        .filtros-panel {
          background: white;
          border-radius: 18px;
          padding: 1.5rem;
          margin-bottom: 1.75rem;
          border: 1px solid #eae5dc;
          box-shadow: 0 2px 12px rgba(0,0,0,0.03);
          animation: slideDown 0.3s ease;
        }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

        /* Contador */
        .counter {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #faf8f5;
          border-radius: 12px;
          font-size: 0.82rem;
          color: #6b7280;
          margin-bottom: 1.75rem;
        }
        .counter strong { color: #c47d3e; font-size: 0.95rem; }

        /* Cards */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .cards-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* Paginación */
        .pagination-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.3rem;
          margin-top: 2.5rem;
          flex-wrap: wrap;
        }
        .pagination-btn {
          padding: 0.5rem 1rem;
          border-radius: 10px;
          border: 1.5px solid #e5dfd7;
          background: white;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 500;
          color: #1a1a2e;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .pagination-btn:hover:not(:disabled) { border-color: #c47d3e; background: #fef9f4; }
        .pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; background: #f9f7f4; }
        .pagination-num {
          width: 36px; height: 36px;
          border-radius: 10px;
          border: 1.5px solid #e5dfd7;
          background: white;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 500;
          color: #1a1a2e;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
        }
        .pagination-num:hover:not(.dots) { border-color: #c47d3e; background: #fef9f4; }
        .pagination-num.active { background: #c47d3e; border-color: #c47d3e; color: white; font-weight: 700; }
        .pagination-num.dots { border: none; cursor: default; background: transparent; }

        /* Estado vacío */
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 20px;
          border: 1.5px solid #eae5dc;
        }
        .empty-icon { font-size: 3.5rem; margin-bottom: 1rem; }
        .empty-title { font-family: 'Playfair Display', serif; font-size: 1.3rem; color: #1a1a2e; margin-bottom: 0.5rem; }
        .empty-desc { color: #8b8074; margin-bottom: 1.5rem; font-size: 0.9rem; }

        /* Footer */
        .footer {
          background: #1a2332;
          padding: 2.5rem 2rem;
          text-align: center;
          flex-shrink: 0;
          margin-top: auto;
        }
        .footer p { font-size: 0.78rem; color: #6b7280; margin: 0; }

        /* ═══════════════════════════════════════════
           RESPONSIVE
           ═══════════════════════════════════════════ */
        @media (max-width: 1024px) {
          .main-content { padding: 2rem 2rem; }
          .cards-grid { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }
        }

        @media (max-width: 768px) {
          .banner { height: 260px; }
          .banner-title { font-size: 1.8rem; }
          .banner-sub { font-size: 0.85rem; }
          .main-content { padding: 1.5rem 1rem; }
          .search-bar { flex-direction: column; }
          .search-input-wrap { min-width: 100%; }
          .cards-grid { grid-template-columns: 1fr; gap: 1rem; }
          .empty-state { padding: 3rem 1.5rem; }
        }

        @media (max-width: 480px) {
          .banner { height: 220px; }
          .banner-title { font-size: 1.5rem; }
          .banner-tag { font-size: 0.62rem; padding: 0.25rem 0.8rem; }
          .btn { padding: 0.55rem 1rem; font-size: 0.72rem; }
          .counter { font-size: 0.75rem; padding: 0.4rem 0.75rem; }
        }
      `}</style>

      <Navbar />

      <div className="banner" style={{ backgroundImage: `url(${bannerImage})` }}>
        <div className="banner-inner">
          <span className="banner-tag">Colección Exclusiva</span>
          <h1 className="banner-title">Catálogo de <em>Telas</em></h1>
          <p className="banner-sub">Descubre nuestra selección de tejidos premium</p>
        </div>
      </div>

      <div className="main-content">
        <div className="search-bar">
          <div className="search-input-wrap">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Buscar por nombre, referencia o composición..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="search-field" />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setMostrarFiltros(!mostrarFiltros)} className={`btn btn-outline ${mostrarFiltros || filtrosActivos ? 'is-active' : ''}`}>
              <Filter size={16} /> Filtros {filtrosActivos && <span className="badge">Activos</span>}
            </button>
            {user && isEditor && (
              <button onClick={() => setShowEditor(true)} className="btn btn-primary"><Palette size={16} /> Diseñar</button>
            )}
            <div className="view-toggle">
              <button onClick={() => setVista('grid')} className={`view-btn ${vista === 'grid' ? 'is-active' : ''}`}><Grid size={17} /></button>
              <button onClick={() => setVista('list')} className={`view-btn ${vista === 'list' ? 'is-active' : ''}`}><List size={17} /></button>
            </div>
          </div>
        </div>

        {mostrarFiltros && (
          <div className="filtros-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: '1.1rem' }}>Refinar búsqueda</h3>
              {filtrosActivos && (
                <button onClick={handleLimpiarFiltros} style={{ background: 'none', border: 'none', color: '#c47d3e', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Limpiar todo</button>
              )}
            </div>
            <Filtros categorias={categorias} colores={colores} filtros={filtros} onFiltroChange={handleFiltroChange} onLimpiarFiltros={handleLimpiarFiltros} ordenPor={ordenPor} ordenDir={ordenDir} onOrdenar={handleOrdenar} />
          </div>
        )}

        <div className="counter">
          <Sparkles size={15} style={{ color: '#c47d3e' }} />
          <strong>{telasFiltradas_.length}</strong> telas encontradas
          {ordenPor !== 'nombre' && <span style={{ color: '#b0a89c', fontSize: '0.75rem' }}>· {ordenPor}</span>}
        </div>

        {paginatedTelas.length > 0 ? (
          <>
            <div className={vista === 'grid' ? 'cards-grid' : 'cards-list'}>
              {paginatedTelas.map(tela => (
                <TarjetaTela key={tela.id} tela={tela} onClick={setTelaSeleccionada} />
              ))}
            </div>
            {totalPages > 1 && <Paginacion currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3 className="empty-title">Sin resultados</h3>
            <p className="empty-desc">Prueba con otros términos o ajusta los filtros</p>
            <button onClick={handleLimpiarFiltros} className="btn btn-outline"><X size={16} /> Limpiar filtros</button>
          </div>
        )}
      </div>

      <footer className="footer">
        <p>© 2025 YNK Trading · Todos los derechos reservados</p>
      </footer>

      <Modal isOpen={!!telaSeleccionada} onClose={() => setTelaSeleccionada(null)}>
        {telaSeleccionada && <DetalleTelaModal tela={telaSeleccionada} onClose={() => setTelaSeleccionada(null)} />}
      </Modal>

      {showEditor && (
        <div style={{ position: 'fixed', top: '70px', left: 0, right: 0, bottom: 0, background: '#0a0a0a', zIndex: 1000, overflowY: 'auto' }}>
          <CatalogoEditorFashion telas={telasFiltradas_} categorias={categorias} onClose={() => setShowEditor(false)} />
        </div>
      )}
    </div>
  )
}