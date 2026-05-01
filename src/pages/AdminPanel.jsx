import React, { useState, useEffect } from 'react'
import { telaService, categoriaService, colorService } from '../services/api'
import { FormularioTela } from '../components/admin/FormularioTela'
import { AdminCategorias } from '../components/admin/AdminCategorias'
import { AdminColores } from '../components/admin/AdminColores'
import { AdminUsuarios } from '../components/admin/AdminUsuarios'
import { useAuth } from '../context/AuthContext'
import { getSiteSettings, setSiteSetting } from '../services/supabaseClient'
import { LogOut, Users, Search, Filter, ChevronDown } from 'lucide-react'
import {
  Edit, Trash2, Package, Layers, Palette,
  Image as ImageIcon, Upload, Save, X, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=85'
const FORMATOS_SOPORTADOS = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
  'image/webp', 'image/tiff', 'image/bmp', 'image/svg+xml'
]
const FORMATOS_EXTENSIONES = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff', '.tif', '.bmp', '.svg']

export function AdminPanel() {
  const { user, profile, isAdmin, isEditor, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('telas')
  const [telas, setTelas] = useState([])
  const [telasFiltradas, setTelasFiltradas] = useState([])
  const [busquedaTelas, setBusquedaTelas] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos')
  const [pesoFiltro, setPesoFiltro] = useState('todos')
  const [ordenPor, setOrdenPor] = useState('nombre')
  const [ordenDir, setOrdenDir] = useState('asc')
  const [categorias, setCategorias] = useState([])
  const [colores, setColores] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [telaEditando, setTelaEditando] = useState(null)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  // Banners
  const [homePreview, setHomePreview] = useState(DEFAULT_BANNER)
  const [catalogoPreview, setCatalogoPreview] = useState(DEFAULT_BANNER)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState({ home: false, catalogo: false })
  const [loadingBanners, setLoadingBanners] = useState(true)

  // Opciones de peso
  const opcionesPeso = [
    { label: 'Todos', value: 'todos' },
    { label: 'Menos de 10 oz', value: '0-10' },
    { label: '10 - 11 oz', value: '10-11' },
    { label: '11 - 12 oz', value: '11-12' },
    { label: '12 - 13 oz', value: '12-13' },
    { label: 'Más de 13 oz', value: '13+' }
  ]

  // Opciones de ordenamiento
  const opcionesOrden = [
    { label: 'Nombre', value: 'nombre' },
    { label: 'Referencia', value: 'referencia' },
    { label: 'Categoría', value: 'categoria' },
    { label: 'Peso', value: 'peso' },
    { label: 'Stock', value: 'stock' },
    { label: 'Fecha creación', value: 'created_at' }
  ]

  // Tabs disponibles según rol
  const allTabs = [
    { id: 'telas', label: 'Telas', icon: Package, roles: ['admin', 'editor'] },
    { id: 'categorias', label: 'Categorías', icon: Layers, roles: ['admin'] },
    { id: 'colores', label: 'Colores', icon: Palette, roles: ['admin', 'editor'] },
    { id: 'usuarios', label: 'Usuarios', icon: Users, roles: ['admin'] },
    { id: 'apariencia', label: 'Apariencia', icon: ImageIcon, roles: ['admin'] },
  ]

  const tabs = allTabs.filter(tab => tab.roles.includes(profile?.role))

  useEffect(() => {
    cargarDatos()
    cargarBanners()
  }, [])

  // Filtrar y ordenar telas
  useEffect(() => {
    let filtradas = [...telas]

    // Búsqueda por texto
    if (busquedaTelas.trim() !== '') {
      filtradas = filtradas.filter(tela =>
        tela.nombre?.toLowerCase().includes(busquedaTelas.toLowerCase()) ||
        tela.referencia?.toLowerCase().includes(busquedaTelas.toLowerCase()) ||
        tela.item?.toLowerCase().includes(busquedaTelas.toLowerCase()) ||
        tela.categorias?.nombre?.toLowerCase().includes(busquedaTelas.toLowerCase())
      )
    }

    // Filtro por categoría
    if (categoriaFiltro !== 'todos') {
      filtradas = filtradas.filter(tela => tela.categoria_id === parseInt(categoriaFiltro))
    }

    // Filtro por peso
    if (pesoFiltro !== 'todos') {
      filtradas = filtradas.filter(tela => {
        const pesoNum = parseFloat(tela.peso)
        if (isNaN(pesoNum)) return false
        switch(pesoFiltro) {
          case '0-10': return pesoNum < 10
          case '10-11': return pesoNum >= 10 && pesoNum < 11
          case '11-12': return pesoNum >= 11 && pesoNum < 12
          case '12-13': return pesoNum >= 12 && pesoNum < 13
          case '13+': return pesoNum >= 13
          default: return true
        }
      })
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
        case 'categoria':
          valA = a.categorias?.nombre || ''
          valB = b.categorias?.nombre || ''
          break
        case 'peso':
          valA = parseFloat(a.peso) || 0
          valB = parseFloat(b.peso) || 0
          break
        case 'stock':
          valA = a.stock || 0
          valB = b.stock || 0
          break
        default:
          valA = a.created_at || ''
          valB = b.created_at || ''
      }
      if (ordenDir === 'asc') {
        return valA > valB ? 1 : -1
      } else {
        return valA < valB ? 1 : -1
      }
    })

    setTelasFiltradas(filtradas)
  }, [busquedaTelas, categoriaFiltro, pesoFiltro, ordenPor, ordenDir, telas])

  // Si el tab activo ya no está disponible para el rol, resetear
  useEffect(() => {
    if (tabs.length > 0 && !tabs.find(t => t.id === activeTab)) {
      setActiveTab(tabs[0].id)
    }
  }, [profile])

  const cargarDatos = async () => {
    try {
      const [telasData, categoriasData, coloresData] = await Promise.all([
        telaService.obtenerTodas(),
        categoriaService.obtenerTodas(),
        colorService.obtenerTodos()
      ])
      setTelas(telasData)
      setTelasFiltradas(telasData)
      setCategorias(categoriasData)
      setColores(coloresData)
    } catch {
      toast.error('Error al cargar datos')
    }
  }

  const cargarBanners = async () => {
    setLoadingBanners(true)
    try {
      const settings = await getSiteSettings(['home_banner', 'catalogo_banner'])
      setHomePreview(settings.home_banner || DEFAULT_BANNER)
      setCatalogoPreview(settings.catalogo_banner || DEFAULT_BANNER)
    } catch {
      setHomePreview(DEFAULT_BANNER)
      setCatalogoPreview(DEFAULT_BANNER)
    } finally {
      setLoadingBanners(false)
    }
  }

  const handleEliminarTela = async (id) => {
    if (!isAdmin && !isEditor) {
      toast.error('No tienes permisos para eliminar telas')
      return
    }
    if (confirm('¿Eliminar esta tela? Esta acción no se puede deshacer.')) {
      try {
        await telaService.eliminar(id)
        toast.success('Tela eliminada')
        cargarDatos()
      } catch (error) {
        toast.error('Error al eliminar la tela')
      }
    }
  }

  const handleOrdenar = (campo) => {
    if (ordenPor === campo) {
      setOrdenDir(ordenDir === 'asc' ? 'desc' : 'asc')
    } else {
      setOrdenPor(campo)
      setOrdenDir('asc')
    }
  }

  const limpiarFiltros = () => {
    setBusquedaTelas('')
    setCategoriaFiltro('todos')
    setPesoFiltro('todos')
    setMostrarFiltros(false)
  }

  const validarFormatoImagen = (file) => {
    const tipoValido = FORMATOS_SOPORTADOS.includes(file.type)
    const extension = '.' + file.name.split('.').pop().toLowerCase()
    const extensionValida = FORMATOS_EXTENSIONES.includes(extension)
    if (!tipoValido && !extensionValida) {
      toast.error(`Formato no soportado. Permitidos: ${FORMATOS_EXTENSIONES.join(', ')}`)
      return false
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagen demasiado grande. Máximo 5MB')
      return false
    }
    return true
  }

  const convertirImagenABase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const maxWidth = 1200
          if (img.width > maxWidth) {
            const canvas = document.createElement('canvas')
            canvas.width = maxWidth
            canvas.height = (img.height * maxWidth) / img.width
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            resolve(canvas.toDataURL('image/jpeg', 0.8))
          } else {
            resolve(event.target.result)
          }
        }
        img.onerror = () => reject(new Error('Error al cargar la imagen'))
        img.src = event.target.result
      }
      reader.onerror = () => reject(new Error('Error al leer el archivo'))
      reader.readAsDataURL(file)
    })
  }

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0]
    if (!file) return
    if (!validarFormatoImagen(file)) return

    setUploading(prev => ({ ...prev, [type]: true }))
    try {
      const dataUrl = await convertirImagenABase64(file)
      if (type === 'home') {
        setHomePreview(dataUrl)
      } else {
        setCatalogoPreview(dataUrl)
      }
      toast.success('Imagen cargada — recuerda guardar los cambios')
    } catch {
      toast.error('Error al procesar la imagen')
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }))
    }
  }

  const saveImages = async () => {
    if (!isAdmin) {
      toast.error('No tienes permisos para guardar imágenes')
      return
    }
    setSaving(true)
    try {
      const [r1, r2] = await Promise.all([
        setSiteSetting('home_banner', homePreview),
        setSiteSetting('catalogo_banner', catalogoPreview)
      ])
      if (!r1.success || !r2.success) throw new Error('Error al guardar')
      toast.success('Imágenes guardadas para todos los usuarios ✓')
    } catch {
      toast.error('Error al guardar las imágenes')
    } finally {
      setSaving(false)
    }
  }

  const resetToDefault = () => {
    setHomePreview(DEFAULT_BANNER)
    setCatalogoPreview(DEFAULT_BANNER)
    toast.success('Imágenes restauradas a las predeterminadas')
  }

  const filtrosActivos = categoriaFiltro !== 'todos' || pesoFiltro !== 'todos' || busquedaTelas

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#fff', color: '#1a2332' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .ynk-admin-header { background: linear-gradient(135deg,#1a2332 0%,#2a3545 100%); padding:3rem 2rem; text-align:center; margin-bottom:2rem; }
        .ynk-admin-title { font-family:'Playfair Display',serif; font-size:2.5rem; font-weight:700; color:white; margin-bottom:0.5rem; }
        .ynk-admin-subtitle { color:rgba(255,255,255,0.7); font-size:1rem; }
        .ynk-container { max-width:1280px; margin:0 auto; padding:0 2rem 3rem; }
        .ynk-tabs { display:flex; gap:0.5rem; border-bottom:1px solid #e5dfd7; margin-bottom:2rem; flex-wrap:wrap; }
        .ynk-tab-btn { display:flex; align-items:center; gap:0.5rem; padding:0.75rem 1.5rem; font-size:0.9rem; font-weight:600; color:#6b7280; background:transparent; border:none; cursor:pointer; transition:all 0.3s ease; border-radius:8px 8px 0 0; }
        .ynk-tab-btn:hover { color:#c47d3e; background:#f8f4ef; }
        .ynk-tab-btn.active { color:#c47d3e; border-bottom:2px solid #c47d3e; }
        .ynk-section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem; }
        .ynk-section-title { font-size:1.5rem; font-weight:600; color:#1a2332; }
        .ynk-search-box { position:relative; flex:1; min-width:200px; }
        .ynk-search-input { width:100%; padding:0.6rem 1rem 0.6rem 2.5rem; border:1.5px solid #e5dfd7; border-radius:40px; font-size:0.85rem; outline:none; transition:all 0.2s; }
        .ynk-search-input:focus { border-color:#c47d3e; }
        .ynk-search-icon { position:absolute; left:0.8rem; top:50%; transform:translateY(-50%); color:#9a8f84; }
        .ynk-filtros-bar { display:flex; flex-wrap:wrap; gap:1rem; align-items:center; margin-bottom:1rem; }
        .ynk-filtro-select { padding:0.5rem 1rem; border:1.5px solid #e5dfd7; border-radius:40px; font-size:0.85rem; background:white; cursor:pointer; outline:none; }
        .ynk-filtro-select:focus { border-color:#c47d3e; }
        .ynk-btn-primary { background:#1a2332; color:white; padding:0.6rem 1.2rem; border-radius:40px; font-size:0.8rem; font-weight:600; border:none; cursor:pointer; transition:all 0.3s ease; display:flex; align-items:center; gap:0.5rem; }
        .ynk-btn-primary:hover { background:#c47d3e; transform:translateY(-2px); }
        .ynk-btn-primary:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
        .ynk-btn-secondary { background:#f8f4ef; color:#1a2332; padding:0.6rem 1.2rem; border-radius:40px; font-size:0.8rem; font-weight:600; border:1px solid #e5dfd7; cursor:pointer; transition:all 0.3s ease; display:flex; align-items:center; gap:0.5rem; }
        .ynk-btn-secondary:hover { border-color:#c47d3e; color:#c47d3e; }
        .ynk-table { width:100%; background:white; border-radius:16px; overflow:hidden; border:1px solid #e5dfd7; }
        .ynk-table th { text-align:left; padding:1rem; background:#f8f4ef; font-weight:600; color:#1a2332; border-bottom:1px solid #e5dfd7; cursor:pointer; user-select:none; }
        .ynk-table th:hover { background:#ede8e2; }
        .ynk-table td { padding:1rem; border-bottom:1px solid #e5dfd7; color:#4b5563; }
        .ynk-table tr:hover { background:#f8f4ef; }
        .ynk-card { background:white; border-radius:20px; border:1px solid #e5dfd7; padding:1.5rem; }
        .ynk-image-preview { width:100%; height:180px; background-size:cover; background-position:center; border-radius:12px; margin-bottom:1rem; }
        .ynk-upload-area { border:2px dashed #e5dfd7; border-radius:12px; padding:2rem; text-align:center; cursor:pointer; transition:all 0.3s ease; }
        .ynk-upload-area:hover { border-color:#c47d3e; background:#f8f4ef; }
        .ynk-upload-area.disabled { opacity:0.6; cursor:not-allowed; }
        .sort-indicator { display:inline-block; margin-left:0.25rem; font-size:0.7rem; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .animate-spin { animation:spin 1s linear infinite; }
        @media (max-width:768px) { .ynk-container { padding:0 1rem 2rem; } .ynk-admin-title { font-size:1.8rem; } .ynk-tab-btn { padding:0.5rem 1rem; font-size:0.8rem; } .ynk-table { font-size:0.8rem; } .ynk-table th, .ynk-table td { padding:0.75rem; } }
      `}</style>

      {/* Header */}
      <div className="ynk-admin-header">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', maxWidth:'1280px', margin:'0 auto' }}>
          <div>
            <h1 className="ynk-admin-title">Panel de Administración</h1>
            <p className="ynk-admin-subtitle">
              Gestiona tu catálogo de telas
              {isAdmin ? ' y la apariencia del sitio' : ''}
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ textAlign:'right' }}>
              <span style={{ color:'white', fontSize:'0.85rem', display:'block' }}>
                👋 {profile?.full_name || user?.email?.split('@')[0] || 'Usuario'}
              </span>
              <span style={{
                color: profile?.role === 'admin' ? '#c47d3e' : '#7a9ab0',
                fontSize:'0.7rem',
                letterSpacing:'0.1em',
                textTransform:'uppercase'
              }}>
                {profile?.role === 'admin' ? '● Administrador' :
                 profile?.role === 'editor' ? '● Editor' : '● Usuario'}
              </span>
            </div>
            <button onClick={logout} style={{ background:'rgba(255,255,255,0.15)', border:'none', padding:'0.5rem 1rem', borderRadius:'40px', color:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.75rem', transition:'all 0.3s ease' }}>
              <LogOut size={14} /> Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="ynk-container">
        {/* Tabs */}
        <div className="ynk-tabs">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setShowForm(false); setTelaEditando(null) }} className={`ynk-tab-btn ${activeTab === tab.id ? 'active' : ''}`}>
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        {/* ── TELAS ── */}
        {activeTab === 'telas' && (
          <div>
            <div className="ynk-section-header">
              <h2 className="ynk-section-title">Gestión de Telas</h2>
              <button onClick={() => { setShowForm(!showForm); setTelaEditando(null) }} className="ynk-btn-primary">
                {showForm ? <X size={16} /> : <Upload size={16} />}
                {showForm ? 'Cancelar' : '+ Nueva Tela'}
              </button>
            </div>

            {showForm && (
              <div className="ynk-card" style={{ marginBottom:'1.5rem' }}>
                <FormularioTela
                  tela={telaEditando}
                  categorias={categorias}
                  colores={colores}
                  onSave={() => { cargarDatos(); setShowForm(false); setTelaEditando(null) }}
                  onCancel={() => { setShowForm(false); setTelaEditando(null) }}
                />
              </div>
            )}

            {/* Barra de filtros */}
            <div className="ynk-filtros-bar">
              <div className="ynk-search-box" style={{ flex: 2 }}>
                <Search size={16} className="ynk-search-icon" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, referencia o categoría..."
                  value={busquedaTelas}
                  onChange={(e) => setBusquedaTelas(e.target.value)}
                  className="ynk-search-input"
                />
              </div>
              
              <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)} className="ynk-filtro-select">
                <option value="todos">Todas las categorías</option>
                {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
              </select>
              
              <select value={pesoFiltro} onChange={(e) => setPesoFiltro(e.target.value)} className="ynk-filtro-select">
                {opcionesPeso.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              
              <select value={ordenPor} onChange={(e) => setOrdenPor(e.target.value)} className="ynk-filtro-select">
                {opcionesOrden.map(opt => <option key={opt.value} value={opt.value}>Ordenar por: {opt.label}</option>)}
              </select>
              
              {filtrosActivos && (
                <button onClick={limpiarFiltros} className="ynk-btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  <X size={14} /> Limpiar filtros
                </button>
              )}
            </div>

            {/* Tabla de telas */}
            <div className="overflow-x-auto">
              <table className="ynk-table">
                <thead>
                  <tr>
                    <th onClick={() => handleOrdenar('nombre')}>
                      Tela {ordenPor === 'nombre' && <span className="sort-indicator">{ordenDir === 'asc' ? '↑' : '↓'}</span>}
                    </th>
                    <th onClick={() => handleOrdenar('referencia')}>
                      Referencia {ordenPor === 'referencia' && <span className="sort-indicator">{ordenDir === 'asc' ? '↑' : '↓'}</span>}
                    </th>
                    <th onClick={() => handleOrdenar('categoria')}>
                      Categoría {ordenPor === 'categoria' && <span className="sort-indicator">{ordenDir === 'asc' ? '↑' : '↓'}</span>}
                    </th>
                    <th onClick={() => handleOrdenar('peso')}>
                      Peso {ordenPor === 'peso' && <span className="sort-indicator">{ordenDir === 'asc' ? '↑' : '↓'}</span>}
                    </th>
                    <th onClick={() => handleOrdenar('stock')}>
                      Stock {ordenPor === 'stock' && <span className="sort-indicator">{ordenDir === 'asc' ? '↑' : '↓'}</span>}
                    </th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {telasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign:'center', padding:'2rem', color:'#9a8f84' }}>
                        {filtrosActivos ? 'No se encontraron telas con esos filtros' : 'No hay telas registradas'}
                      </td>
                    </tr>
                  ) : (
                    telasFiltradas.map(tela => (
                      <tr key={tela.id}>
                        <td style={{ maxWidth: '250px' }}>{tela.nombre}</td>
                        <td>{tela.referencia || 'N/A'}</td>
                        <td>{tela.categorias?.nombre}</td>
                        <td>{tela.peso || 'N/A'}</td>
                        <td>{tela.stock || 0} m</td>
                        <td>
                          <div style={{ display:'flex', gap:'0.5rem' }}>
                            <button onClick={() => { setTelaEditando(tela); setShowForm(true) }} style={{ color:'#c47d3e', background:'none', border:'none', cursor:'pointer' }} title="Editar">
                              <Edit size={16} />
                            </button>
                            {(isAdmin || isEditor) && (
                              <button onClick={() => handleEliminarTela(tela.id)} style={{ color:'#e74c3c', background:'none', border:'none', cursor:'pointer' }} title="Eliminar">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Mostrar cantidad de resultados */}
            {telasFiltradas.length > 0 && telasFiltradas.length !== telas.length && (
              <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#9a8f84', textAlign: 'center' }}>
                Mostrando {telasFiltradas.length} de {telas.length} telas
              </div>
            )}
          </div>
        )}

        {/* ── CATEGORÍAS (solo admin) ── */}
        {activeTab === 'categorias' && isAdmin && (
          <AdminCategorias
            categorias={categorias}
            onCategoriaCreada={cargarDatos}
            onCategoriaActualizada={cargarDatos}
            onCategoriaEliminada={cargarDatos}
          />
        )}

        {/* ── COLORES (admin y editor) ── */}
        {activeTab === 'colores' && (isAdmin || isEditor) && (
          <AdminColores
            colores={colores}
            onColorCreado={cargarDatos}
            onColorActualizado={cargarDatos}
            onColorEliminado={cargarDatos}
            readOnly={!isAdmin}
          />
        )}

        {/* ── USUARIOS (solo admin) ── */}
        {activeTab === 'usuarios' && isAdmin && (
          <AdminUsuarios />
        )}

        {/* ── APARIENCIA (solo admin) ── */}
        {activeTab === 'apariencia' && isAdmin && (
          <div>
            <div className="ynk-section-header">
              <h2 className="ynk-section-title">Personalización del Sitio</h2>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button onClick={resetToDefault} className="ynk-btn-secondary">Restaurar predeterminadas</button>
                <button onClick={saveImages} disabled={saving} className="ynk-btn-primary"><Save size={16} /> {saving ? 'Guardando...' : 'Guardar para todos'}</button>
              </div>
            </div>

            {loadingBanners ? (
              <div style={{ textAlign:'center', padding:'3rem', color:'#9a8f84' }}>
                <div className="animate-spin rounded-full" style={{ width:'32px', height:'32px', border:'2px solid transparent', borderBottomColor:'#c47d3e', borderRadius:'50%', margin:'0 auto 1rem' }}></div>
                Cargando imágenes actuales...
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'1.5rem' }}>
                {/* Home Banner */}
                <div className="ynk-card">
                  <h3 style={{ fontWeight:600, fontSize:'1.1rem', marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <ImageIcon size={18} style={{ color:'#c47d3e' }} />
                    Imagen de fondo — Home
                  </h3>
                  <div className="ynk-image-preview" style={{ backgroundImage:`url(${homePreview})` }} />
                  <label className={`ynk-upload-area block ${uploading.home ? 'disabled' : ''}`} style={{ display:'block' }}>
                    <input type="file" accept={FORMATOS_SOPORTADOS.join(',')} onChange={(e) => handleImageUpload(e, 'home')} style={{ display:'none' }} disabled={uploading.home} />
                    {uploading.home ? (
                      <div style={{ textAlign:'center' }}><div className="animate-spin" style={{ width:'32px', height:'32px', border:'2px solid transparent', borderBottomColor:'#c47d3e', borderRadius:'50%', margin:'0 auto 0.5rem' }}></div><p style={{ color:'#6b7280', fontSize:'0.85rem' }}>Procesando...</p></div>
                    ) : (
                      <>
                        <Upload size={24} style={{ margin:'0 auto 0.5rem', display:'block', color:'#c47d3e' }} />
                        <p style={{ color:'#6b7280', fontSize:'0.85rem' }}>Clic para cambiar imagen</p>
                        <p style={{ color:'#9a8f84', fontSize:'0.75rem', marginTop:'0.25rem' }}>JPG, PNG, WEBP, GIF, SVG · Máx 5MB</p>
                      </>
                    )}
                  </label>
                </div>

                {/* Catálogo Banner */}
                <div className="ynk-card">
                  <h3 style={{ fontWeight:600, fontSize:'1.1rem', marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <ImageIcon size={18} style={{ color:'#c47d3e' }} />
                    Imagen de fondo — Catálogo
                  </h3>
                  <div className="ynk-image-preview" style={{ backgroundImage:`url(${catalogoPreview})` }} />
                  <label className={`ynk-upload-area block ${uploading.catalogo ? 'disabled' : ''}`} style={{ display:'block' }}>
                    <input type="file" accept={FORMATOS_SOPORTADOS.join(',')} onChange={(e) => handleImageUpload(e, 'catalogo')} style={{ display:'none' }} disabled={uploading.catalogo} />
                    {uploading.catalogo ? (
                      <div style={{ textAlign:'center' }}><div className="animate-spin" style={{ width:'32px', height:'32px', border:'2px solid transparent', borderBottomColor:'#c47d3e', borderRadius:'50%', margin:'0 auto 0.5rem' }}></div><p style={{ color:'#6b7280', fontSize:'0.85rem' }}>Procesando...</p></div>
                    ) : (
                      <>
                        <Upload size={24} style={{ margin:'0 auto 0.5rem', display:'block', color:'#c47d3e' }} />
                        <p style={{ color:'#6b7280', fontSize:'0.85rem' }}>Clic para cambiar imagen</p>
                        <p style={{ color:'#9a8f84', fontSize:'0.75rem', marginTop:'0.25rem' }}>JPG, PNG, WEBP, GIF, SVG · Máx 5MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            )}

            <div style={{ marginTop:'1.5rem', padding:'1rem 1.25rem', background:'#f8f4ef', borderRadius:'12px', display:'flex', gap:'0.75rem', alignItems:'flex-start' }}>
              <AlertCircle size={18} style={{ color:'#c47d3e', flexShrink:0, marginTop:'2px' }} />
              <div style={{ fontSize:'0.82rem', color:'#6b7280' }}>
                <p style={{ fontWeight:600, marginBottom:'0.3rem' }}>Importante:</p>
                <p>Los banners se guardan en la base de datos y son visibles para <strong>todos los usuarios</strong> inmediatamente.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}