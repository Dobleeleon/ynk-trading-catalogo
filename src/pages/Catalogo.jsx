import React, { useState, useEffect } from 'react'
import { Search, Filter, Grid, List, X, ChevronDown, Palette, Sparkles } from 'lucide-react'
import { telaService, categoriaService, colorService } from '../services/api'
import { getSiteSetting } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { TarjetaTela } from '../components/catalogo/TarjetaTela'
import { Filtros } from '../components/catalogo/Filtros'
import { CatalogoEditorFashion } from '../components/CatalogoEditorFashion'
import { Modal } from '../components/ui/Modal'
import { DetalleTelaModal } from '../components/catalogo/DetalleTelaModal'
import toast from 'react-hot-toast'

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=85'

export function Catalogo() {
  const { user, isEditor } = useAuth()
  const [bannerLoading, setBannerLoading] = useState(true)
  const [telas, setTelas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [colores, setColores] = useState([])
  const [telasFiltradas, setTelasFiltradas] = useState([])
  const [filtros, setFiltros] = useState({
    categoriaId: 'todos',
    colorId: null
  })
  const [busqueda, setBusqueda] = useState('')
  const [vista, setVista] = useState('grid')
  const [cargando, setCargando] = useState(true)
  const [telaSeleccionada, setTelaSeleccionada] = useState(null)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [bannerImage, setBannerImage] = useState(DEFAULT_BANNER)
  
  // Estado para ordenamiento
  const [ordenPor, setOrdenPor] = useState('nombre')
  const [ordenDir, setOrdenDir] = useState('asc')

  // Cargar banner desde Supabase
  useEffect(() => {
    const loadBanner = async () => {
      setBannerLoading(true)
      try {
        const val = await getSiteSetting('catalogo_banner')
        if (val) setBannerImage(val)
      } catch (error) {
        console.error('Error cargando banner:', error)
      } finally {
        setBannerLoading(false)
      }
    }
    loadBanner()
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    aplicarFiltrosYOrdenar()
  }, [filtros, busqueda, telas, ordenPor, ordenDir])

  useEffect(() => {
    if (showEditor) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => { document.body.style.overflow = 'auto' }
  }, [showEditor])

  const cargarDatos = async () => {
    try {
      const [telasData, categoriasData, coloresData] = await Promise.all([
        telaService.obtenerTodas(),
        categoriaService.obtenerTodas(),
        colorService.obtenerTodos()
      ])
      setTelas(telasData)
      setCategorias(categoriasData)
      setColores(coloresData)
      setTelasFiltradas(telasData)
    } catch (error) {
      toast.error('Error al cargar los datos')
      console.error(error)
    } finally {
      setCargando(false)
    }
  }

  const aplicarFiltrosYOrdenar = () => {
    let filtradas = [...telas]

    // Búsqueda por texto
    if (busqueda) {
      filtradas = filtradas.filter(t =>
        t.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.referencia?.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.composicion?.toLowerCase().includes(busqueda.toLowerCase())
      )
    }

    // Filtro por categoría
    if (filtros.categoriaId !== 'todos') {
      filtradas = filtradas.filter(t => t.categoria_id === parseInt(filtros.categoriaId))
    }

    // Filtro por color
    if (filtros.colorId) {
      filtradas = filtradas.filter(t =>
        t.tela_colores?.some(tc => tc.colores.id === filtros.colorId)
      )
    }

    // Ordenamiento
    filtradas.sort((a, b) => {
      let valA, valB
      switch(ordenPor) {
        case 'nombre':
          valA = a.nombre || ''
          valB = b.nombre || ''
          break
        case 'referencia':
          valA = a.referencia || ''
          valB = b.referencia || ''
          break
        case 'peso':
          valA = parseFloat(a.peso) || 0
          valB = parseFloat(b.peso) || 0
          break
        default:
          valA = a.nombre || ''
          valB = b.nombre || ''
      }
      if (ordenDir === 'asc') {
        return valA > valB ? 1 : -1
      } else {
        return valA < valB ? 1 : -1
      }
    })

    setTelasFiltradas(filtradas)
  }

  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({ ...prev, [key]: value }))
  }

  const handleOrdenar = (campo, direccion) => {
    setOrdenPor(campo)
    setOrdenDir(direccion)
  }

  const handleLimpiarFiltros = () => {
    setFiltros({
      categoriaId: 'todos',
      colorId: null
    })
    setBusqueda('')
    setMostrarFiltros(false)
    setOrdenPor('nombre')
    setOrdenDir('asc')
  }

  const filtrosActivos = filtros.categoriaId !== 'todos' || 
                         filtros.colorId !== null || 
                         ordenPor !== 'nombre'

  if (bannerLoading || cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
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
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        
        @media (max-width: 768px) {
          .ynk-banner-title { font-size: 2rem; }
          .ynk-editor-overlay { top: 60px; }
        }
      `}</style>

      {/* Banner */}
      <div className="ynk-catalogo-banner" style={{ backgroundImage: `url(${bannerImage})` }}>
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
                onChange={(e) => setBusqueda(e.target.value)}
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
                  <span style={{ background: 'rgba(255,255,255,0.3)', color: 'white', fontSize: '0.7rem', borderRadius: '40px', padding: '0.1rem 0.5rem', marginLeft: '0.25rem' }}>
                    activos
                  </span>
                )}
                <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: mostrarFiltros ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>

              {user && isEditor && (
                <button onClick={() => setShowEditor(true)} className="ynk-btn-primary">
                  <Palette size={16} /> Diseñar Catálogo
                </button>
              )}

              <div style={{ display: 'flex', gap: '0.25rem', background: 'white', borderRadius: '40px', border: '1.5px solid #e5dfd7', padding: '0.25rem' }}>
                <button
                  onClick={() => setVista('grid')}
                  style={{
                    padding: '0.4rem 0.6rem', borderRadius: '40px', border: 'none', cursor: 'pointer',
                    background: vista === 'grid' ? '#c47d3e' : 'transparent',
                    color: vista === 'grid' ? 'white' : '#9a8f84',
                    transition: 'all 0.2s'
                  }}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setVista('list')}
                  style={{
                    padding: '0.4rem 0.6rem', borderRadius: '40px', border: 'none', cursor: 'pointer',
                    background: vista === 'list' ? '#c47d3e' : 'transparent',
                    color: vista === 'list' ? 'white' : '#9a8f84',
                    transition: 'all 0.2s'
                  }}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Panel de filtros con ordenamiento */}
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

          {/* Contador de resultados */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
            <Sparkles size={16} style={{ color: '#c47d3e', animation: 'sparkle 1.5s ease infinite' }} />
            <span style={{ fontWeight: 700, color: '#c47d3e', fontSize: '1.2rem' }}>{telasFiltradas.length}</span>
            telas encontradas
            {ordenPor !== 'nombre' && (
              <span style={{ fontSize: '0.75rem', color: '#9a8f84', marginLeft: '0.5rem' }}>
                (ordenado por {ordenPor} {ordenDir === 'asc' ? 'ascendente' : 'descendente'})
              </span>
            )}
          </div>

          {/* Grid de telas */}
          {telasFiltradas.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: vista === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
              gap: '1.5rem'
            }}>
              {telasFiltradas.map(tela => (
                <TarjetaTela key={tela.id} tela={tela} onClick={setTelaSeleccionada} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f8f4ef', borderRadius: '24px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔍</div>
              <p style={{ color: '#4b5563', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No se encontraron telas</p>
              <p style={{ color: '#9a8f84', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Intenta con otros filtros o palabras de búsqueda</p>
              <button onClick={handleLimpiarFiltros} className="ynk-btn-primary" style={{ margin: '0 auto' }}>
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

      {/* Modal detalle de tela */}
      <Modal isOpen={!!telaSeleccionada} onClose={() => setTelaSeleccionada(null)}>
        {telaSeleccionada && (
          <DetalleTelaModal tela={telaSeleccionada} onClose={() => setTelaSeleccionada(null)} />
        )}
      </Modal>

      {/* Editor de catálogo fashion */}
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