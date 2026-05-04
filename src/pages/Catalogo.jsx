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
import { Navbar } from '../components/layout/Navbar'  // 👈 IMPORTAR NAVBAR
import toast from 'react-hot-toast'

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=85'
const ITEMS_PER_PAGE = 12

// Componente de paginación
function Paginacion({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i)
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i)
    }
    return pages
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '0.5rem',
      marginTop: '2rem',
      flexWrap: 'wrap'
    }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          border: '1px solid #e5dfd7',
          background: currentPage === 1 ? '#f0ebe4' : 'white',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s'
        }}
      >
        Anterior
      </button>
      
      {getPageNumbers().map(pageNum => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid #e5dfd7',
            background: currentPage === pageNum ? '#c47d3e' : 'white',
            color: currentPage === pageNum ? 'white' : '#1a2332',
            cursor: 'pointer',
            fontWeight: currentPage === pageNum ? '600' : '400',
            transition: 'all 0.2s'
          }}
        >
          {pageNum}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          border: '1px solid #e5dfd7',
          background: currentPage === totalPages ? '#f0ebe4' : 'white',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s'
        }}
      >
        Siguiente
      </button>
    </div>
  )
}

export function Catalogo() {
  const { user, isEditor } = useAuth()

  // Banner - Inicializar SIN imagen para evitar flickering
  const [bannerImage, setBannerImage] = useState(null)
  const [bannerLoading, setBannerLoading] = useState(true)

  const [telas, setTelas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [colores, setColores] = useState([])
  const [telasFiltradas, setTelasFiltradas] = useState([])
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

  // ── Banner: carga sin flickering ───────────────────────────────────────────────────
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

  // ── Datos del catálogo con caché ─────────────────────────────────────────────────────
  useEffect(() => {
    const cargarDatosOptimizado = async () => {
      try {
        // Intentar cargar desde caché
        const cached = sessionStorage.getItem('catalogo_cache')
        if (cached) {
          const { telas: tCache, categorias: cCache, colores: colCache, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < 5 * 60 * 1000) { // 5 minutos
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
        
        // Guardar en caché
        sessionStorage.setItem('catalogo_cache', JSON.stringify({
          telas: telasData,
          categorias: categoriasData,
          colores: coloresData,
          timestamp: Date.now()
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
      filtradas = filtradas.filter(t =>
        t.tela_colores?.some(tc => tc.colores.id === filtros.colorId)
      )
    }

    filtradas.sort((a, b) => {
      let valA, valB
      switch (ordenPor) {
        case 'referencia':
          valA = a.referencia || ''; valB = b.referencia || ''; break
        case 'peso':
          valA = parseFloat(a.peso) || 0; valB = parseFloat(b.peso) || 0; break
        default:
          valA = a.nombre || ''; valB = b.nombre || ''
      }
      return ordenDir === 'asc'
        ? (valA > valB ? 1 : -1)
        : (valA < valB ? 1 : -1)
    })

    return filtradas
  }, [telas, busqueda, filtros, ordenPor, ordenDir])

  // Paginación
  const paginatedTelas = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return telasFiltradas_.slice(start, end)
  }, [telasFiltradas_, currentPage])

  const totalPages = Math.ceil(telasFiltradas_.length / ITEMS_PER_PAGE)

  // Resetear página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [busqueda, filtros, ordenPor, ordenDir])

  useEffect(() => {
    setTelasFiltradas(telasFiltradas_)
  }, [telasFiltradas_])

  useEffect(() => {
    if (showEditor) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => { document.body.style.overflow = 'auto' }
  }, [showEditor])

  const handleFiltroChange = useCallback((key, value) => {
    setFiltros(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleOrdenar = useCallback((campo, direccion) => {
    setOrdenPor(campo)
    setOrdenDir(direccion)
  }, [])

  const handleLimpiarFiltros = useCallback(() => {
    setFiltros({ categoriaId: 'todos', colorId: null })
    setBusqueda('')
    setMostrarFiltros(false)
    setOrdenPor('nombre')
    setOrdenDir('asc')
  }, [])

  const filtrosActivos = filtros.categoriaId !== 'todos' ||
    filtros.colorId !== null ||
    ordenPor !== 'nombre'

  // ─── SPINNER DE CARGA (como en Contacto) ────────────────────────────────────────────
  if (bannerLoading || cargando) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#fff', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 70px)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px', height: '48px',
              border: '3px solid #e5dfd7', borderBottomColor: '#c47d3e',
              borderRadius: '50%', animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <p style={{ color: '#6b7280' }}>Cargando catálogo...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#fff', color: '#1a2332' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .ynk-catalogo-banner {
          position: relative;
          height: 320px;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .ynk-catalogo-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 100%);
        }
        .ynk-banner-content {
          position: relative;
          z-index: 2;
          color: white;
          max-width: 800px;
          padding: 0 2rem;
        }
        .ynk-banner-title {
          font-family: 'Playfair Display', serif;
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          animation: fadeInUp 0.6s ease;
        }
        .ynk-banner-subtitle {
          font-size: 1.1rem;
          opacity: 0.95;
          letter-spacing: 0.05em;
          animation: fadeInUp 0.6s ease 0.2s both;
        }
        .ynk-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem;
        }
        @media (max-width: 768px) { .ynk-container { padding: 1rem; } }

        .ynk-search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3.2rem;
          border: 1.5px solid #e5dfd7;
          border-radius: 60px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          background: white;
          outline: none;
          box-sizing: border-box;
          font-family: 'DM Sans', sans-serif;
          color: #1a2332;
        }
        .ynk-search-input:focus {
          border-color: #c47d3e;
          box-shadow: 0 0 0 4px rgba(196,125,62,0.1);
        }
        .ynk-search-input::placeholder { color: #c9c3b8; }

        .ynk-btn-primary {
          background: #1a2332; color: white;
          padding: 0.75rem 1.5rem; border-radius: 60px;
          font-size: 0.85rem; font-weight: 600; letter-spacing: 0.05em;
          border: none; cursor: pointer; transition: all 0.3s ease;
          display: inline-flex; align-items: center; gap: 0.5rem; white-space: nowrap;
        }
        .ynk-btn-primary:hover { background: #c47d3e; transform: translateY(-2px); }

        .ynk-btn-outline {
          background: transparent; color: #1a2332;
          padding: 0.75rem 1.5rem; border-radius: 60px;
          font-size: 0.85rem; font-weight: 600; letter-spacing: 0.05em;
          border: 1.5px solid #e5dfd7; cursor: pointer; transition: all 0.3s ease;
          display: inline-flex; align-items: center; gap: 0.5rem; white-space: nowrap;
        }
        .ynk-btn-outline:hover { border-color: #c47d3e; color: #c47d3e; }
        .ynk-btn-outline.active { background: #c47d3e; border-color: #c47d3e; color: white; }

        .ynk-filtros-panel {
          background: #f8f4ef; border-radius: 24px; padding: 1.5rem;
          margin-bottom: 2rem; animation: fadeIn 0.3s ease;
        }

        .ynk-footer {
          background: #1a2332; padding: 2rem;
          margin-top: 4rem;
          text-align: center;
        }
        .ynk-footer-copy { font-size: 0.75rem; color: #9a8f84; }
        .ynk-editor-overlay {
          position: fixed; top: 80px; left: 0; right: 0; bottom: 0;
          background: #090909; z-index: 1000; overflow-y: auto;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.1); }
        }

        .ynk-grid-enter {
          animation: fadeIn 0.4s ease;
        }

        @media (max-width: 768px) {
          .ynk-banner-title { font-size: 2rem; }
          .ynk-editor-overlay { top: 60px; }
        }
      `}</style>

      <Navbar />

      {/* Banner */}
      <div
        className="ynk-catalogo-banner"
        style={{ backgroundImage: `url(${bannerImage})` }}
      >
        <div className="ynk-banner-content">
          <h1 className="ynk-banner-title">Catálogo de Telas</h1>
          <p className="ynk-banner-subtitle">Descubre nuestra exclusiva colección de telas de alta calidad</p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="ynk-container">
        <div style={{ padding: '1rem 0 2rem' }}>

          {/* Barra de búsqueda y acciones */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <Search size={20} style={{
                position: 'absolute', left: '1.1rem', top: '50%',
                transform: 'translateY(-50%)', color: '#9a8f84', pointerEvents: 'none'
              }} />
              <input
                type="text"
                placeholder="Buscar por nombre, referencia o composición..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="ynk-search-input"
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={`ynk-btn-outline ${mostrarFiltros || filtrosActivos ? 'active' : ''}`}
              >
                <Filter size={16} />
                Filtros y Orden
                {filtrosActivos && (
                  <span style={{
                    background: 'rgba(255,255,255,0.3)', color: 'white',
                    fontSize: '0.7rem', borderRadius: '40px',
                    padding: '0.1rem 0.5rem', marginLeft: '0.25rem'
                  }}>
                    activos
                  </span>
                )}
                <ChevronDown size={14} style={{
                  transition: 'transform 0.2s',
                  transform: mostrarFiltros ? 'rotate(180deg)' : 'rotate(0deg)'
                }} />
              </button>

              {user && isEditor && (
                <button onClick={() => setShowEditor(true)} className="ynk-btn-primary">
                  <Palette size={16} /> Diseñar Catálogo
                </button>
              )}

              <div style={{
                display: 'flex', gap: '0.25rem', background: 'white',
                borderRadius: '40px', border: '1.5px solid #e5dfd7', padding: '0.25rem'
              }}>
                {['grid', 'list'].map(v => (
                  <button
                    key={v}
                    onClick={() => setVista(v)}
                    style={{
                      padding: '0.4rem 0.6rem', borderRadius: '40px', border: 'none',
                      cursor: 'pointer',
                      background: vista === v ? '#c47d3e' : 'transparent',
                      color: vista === v ? 'white' : '#9a8f84',
                      transition: 'all 0.2s'
                    }}
                  >
                    {v === 'grid' ? <Grid size={18} /> : <List size={18} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Panel de filtros */}
          {mostrarFiltros && (
            <div className="ynk-filtros-panel">
              <Filtros
                categorias={categorias}
                colores={colores}
                filtros={filtros}
                onFiltroChange={handleFiltroChange}
                onLimpiarFiltros={handleLimpiarFiltros}
                ordenPor={ordenPor}
                ordenDir={ordenDir}
                onOrdenar={handleOrdenar}
              />
            </div>
          )}

          {/* Contador */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            marginBottom: '1.5rem', fontSize: '0.9rem', color: '#6b7280'
          }}>
            <Sparkles size={16} style={{ color: '#c47d3e', animation: 'sparkle 1.5s ease infinite' }} />
            <span style={{ fontWeight: 700, color: '#c47d3e', fontSize: '1.2rem' }}>
              {telasFiltradas_.length}
            </span>
            telas encontradas
            {ordenPor !== 'nombre' && (
              <span style={{ fontSize: '0.75rem', color: '#9a8f84', marginLeft: '0.5rem' }}>
                (ordenado por {ordenPor} {ordenDir === 'asc' ? 'ascendente' : 'descendente'})
              </span>
            )}
          </div>

          {/* Grid de telas con paginación */}
          {paginatedTelas.length > 0 ? (
            <>
              <div
                className="ynk-grid-enter"
                style={{
                  display: 'grid',
                  gridTemplateColumns: vista === 'grid'
                    ? 'repeat(auto-fill, minmax(280px, 1fr))'
                    : '1fr',
                  gap: '1.5rem'
                }}
              >
                {paginatedTelas.map(tela => (
                  <TarjetaTela
                    key={tela.id}
                    tela={tela}
                    onClick={setTelaSeleccionada}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <Paginacion
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          ) : (
            <div style={{
              textAlign: 'center', padding: '4rem 2rem',
              background: '#f8f4ef', borderRadius: '24px'
            }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔍</div>
              <p style={{ color: '#4b5563', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                No se encontraron telas
              </p>
              <p style={{ color: '#9a8f84', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Intenta con otros filtros o palabras de búsqueda
              </p>
              <button
                onClick={handleLimpiarFiltros}
                className="ynk-btn-primary"
                style={{ margin: '0 auto' }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="ynk-footer">
        <p className="ynk-footer-copy">© 2025 YNK Trading · Todos los derechos reservados</p>
      </footer>

      {/* Modal detalle */}
      <Modal isOpen={!!telaSeleccionada} onClose={() => setTelaSeleccionada(null)}>
        {telaSeleccionada && (
          <DetalleTelaModal tela={telaSeleccionada} onClose={() => setTelaSeleccionada(null)} />
        )}
      </Modal>

      {/* Editor fashion */}
      {showEditor && (
        <div className="ynk-editor-overlay">
          <CatalogoEditorFashion
            telas={telasFiltradas}
            categorias={categorias}
            onClose={() => setShowEditor(false)}
          />
        </div>
      )}
    </div>
  )
}