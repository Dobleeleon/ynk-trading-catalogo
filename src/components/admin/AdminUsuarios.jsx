import React, { useState, useEffect } from 'react'
import { getAllUsers, createNewUser, updateUser, deleteUser } from '../../services/supabaseClient'
import { Edit, Trash2, UserPlus, X, Save, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'editor'
  })

  const roles = [
    { id: 'admin',  label: 'Administrador', color: '#c47d3e', description: 'Acceso total al panel' },
    { id: 'editor', label: 'Editor',         color: '#3e5f73', description: 'Gestiona telas e imágenes' },
    { id: 'user',   label: 'Usuario',        color: '#6b7280', description: 'Sin acceso al panel' }
  ]

  useEffect(() => {
    cargarUsuarios()
  }, [])

  /* ─── Carga de usuarios ─── */
  const cargarUsuarios = async () => {
    setCargando(true)
    setError(null)
    try {
      const data = await getAllUsers()
      if (Array.isArray(data)) {
        setUsuarios(data)
      } else {
        setUsuarios([])
      }
    } catch (err) {
      console.error('Error cargando usuarios:', err)
      setError('No se pudo cargar la lista. Verifica la conexión con Supabase')
    } finally {
      setCargando(false)
    }
  }

  /* ─── Formulario ─── */
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editando) {
        const result = await updateUser(editando.id, {
          full_name: formData.full_name,
          role: formData.role
        })
        if (!result.success) throw new Error(result.error)
        toast.success('Usuario actualizado correctamente')
      } else {
        if (!formData.email || !formData.password) {
          toast.error('Email y contraseña son requeridos')
          setSaving(false)
          return
        }
        const result = await createNewUser(
          formData.email,
          formData.password,
          formData.full_name,
          formData.role
        )
        if (!result.success) throw new Error(result.error)
        toast.success('Usuario creado correctamente')
      }
      resetForm()
      // Esperar un momento y recargar
      setTimeout(() => {
        cargarUsuarios()
      }, 500)
    } catch (err) {
      console.error('Error:', err)
      toast.error(err.message || 'Error al guardar usuario')
    } finally {
      setSaving(false)
    }
  }

  /* ─── Eliminar ─── */
  const handleEliminar = async (usuario) => {
    // Proteger el último admin
    if (usuario.role === 'admin' && usuarios.filter(u => u.role === 'admin').length <= 1) {
      toast.error('No puedes eliminar el único administrador del sistema')
      return
    }
    if (!confirm(`¿Eliminar al usuario ${usuario.email}? Esta acción no se puede deshacer.`)) return

    // Guardar el ID antes de eliminar
    const userId = usuario.id
    
    setSaving(true)
    try {
      const result = await deleteUser(userId)
      if (!result.success) throw new Error(result.error)
      
      // Eliminar inmediatamente de la lista local
      setUsuarios(prev => prev.filter(u => u.id !== userId))
      toast.success('Usuario eliminado correctamente')
      
      // Cerrar el formulario si estaba editando este usuario
      if (editando?.id === userId) {
        resetForm()
      }
      
      // Recargar desde el servidor para asegurar consistencia
      setTimeout(() => {
        cargarUsuarios()
      }, 1000)
    } catch (err) {
      console.error('Error eliminando:', err)
      toast.error(err.message || 'Error al eliminar usuario')
    } finally {
      setSaving(false)
    }
  }

  /* ─── Force reload manual ─── */
  const forceReload = async () => {
    setCargando(true)
    try {
      const data = await getAllUsers()
      if (Array.isArray(data)) {
        setUsuarios(data)
      }
      toast.success('Lista actualizada')
    } catch (err) {
      toast.error('Error al recargar')
    } finally {
      setCargando(false)
    }
  }

  /* ─── Helpers ─── */
  const resetForm = () => {
    setFormData({ email: '', password: '', full_name: '', role: 'editor' })
    setEditando(null)
    setShowForm(false)
    setShowPassword(false)
  }

  const editarUsuario = (usuario) => {
    setFormData({
      email: usuario.email,
      password: '',
      full_name: usuario.full_name || '',
      role: usuario.role || 'user'
    })
    setEditando(usuario)
    setShowForm(true)
  }

  const getRoleBadge = (role) => {
    const info = roles.find(r => r.id === role)
    return { label: info?.label || role, color: info?.color || '#6b7280' }
  }

  /* ─── Loading ─── */
  if (cargando) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', gap: '1rem' }}>
        <div style={{
          width: 36, height: 36,
          border: '3px solid #e5dfd7', borderBottomColor: '#c47d3e',
          borderRadius: '50%', animation: 'spin 0.9s linear infinite'
        }} />
        <p style={{ color: '#9a8f84', fontSize: '0.9rem' }}>Cargando usuarios...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  /* ─── Error ─── */
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#e74c3c', fontWeight: 600, marginBottom: '0.5rem' }}>⚠️ Error al cargar usuarios</p>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
          {error}
        </p>
        <button
          onClick={cargarUsuarios}
          style={{
            background: '#1a2332', color: 'white', border: 'none',
            padding: '0.6rem 1.4rem', borderRadius: '40px', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '0.85rem', fontWeight: 600
          }}
        >
          <RefreshCw size={16} /> Reintentar
        </button>
      </div>
    )
  }

  /* ─── Render ─── */
  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a2332', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          Gestión de Usuarios
          <span style={{
            fontSize: '0.78rem', fontWeight: 600, padding: '0.2rem 0.75rem',
            borderRadius: '40px', background: '#f8f4ef', color: '#c47d3e', border: '1px solid #e5dfd7'
          }}>
            {usuarios.length} {usuarios.length === 1 ? 'usuario' : 'usuarios'}
          </span>
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={forceReload}
            title="Recargar lista"
            style={{
              background: '#f8f4ef', color: '#1a2332', border: '1px solid #e5dfd7',
              padding: '0.55rem 0.9rem', borderRadius: '40px', cursor: 'pointer',
              display: 'flex', alignItems: 'center'
            }}
          >
            <RefreshCw size={15} /> Refrescar
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            style={{
              background: '#1a2332', color: 'white', border: 'none',
              padding: '0.6rem 1.2rem', borderRadius: '40px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.82rem', fontWeight: 600
            }}
          >
            <UserPlus size={16} /> Nuevo Usuario
          </button>
        </div>
      </div>

      {/* ── Formulario ── */}
      {showForm && (
        <div style={{
          background: 'white', borderRadius: '20px', border: '1px solid #e5dfd7',
          padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 600, fontSize: '1.05rem', color: '#1a2332' }}>
              {editando ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}
            </h3>
            <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9a8f84' }}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>

              {/* Email */}
              <div>
                <label style={labelStyle}>Correo Electrónico{!editando && ' *'}</label>
                <input
                  type="email" name="email" value={formData.email}
                  onChange={handleChange} disabled={!!editando} required={!editando}
                  placeholder="usuario@ejemplo.com"
                  style={{ ...inputStyle, background: editando ? '#f8f4ef' : 'white', opacity: editando ? 0.75 : 1 }}
                />
              </div>

              {/* Contraseña (solo creación) */}
              {!editando && (
                <div>
                  <label style={labelStyle}>Contraseña *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'} name="password"
                      value={formData.password} onChange={handleChange} required
                      placeholder="Mínimo 6 caracteres"
                      style={{ ...inputStyle, paddingRight: '2.8rem' }}
                    />
                    <button type="button" onClick={() => setShowPassword(p => !p)}
                      style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
              )}

              {/* Nombre */}
              <div>
                <label style={labelStyle}>Nombre Completo</label>
                <input type="text" name="full_name" value={formData.full_name}
                  onChange={handleChange} placeholder="Nombre del usuario" style={inputStyle} />
              </div>

              {/* Rol */}
              <div>
                <label style={labelStyle}>Rol *</label>
                <select name="role" value={formData.role} onChange={handleChange} required style={{ ...inputStyle, cursor: 'pointer' }}>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.label} — {r.description}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Leyenda roles */}
            <div style={{ background: '#f8f4ef', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#6b7280', marginBottom: '1.25rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <span>🟠 <strong>Admin</strong>: panel completo</span>
              <span>🔵 <strong>Editor</strong>: agrega y edita telas</span>
              <span>⚪ <strong>Usuario</strong>: sin acceso al panel</span>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" disabled={saving} style={{
                background: saving ? '#9a8f84' : '#1a2332', color: 'white', border: 'none',
                padding: '0.65rem 1.5rem', borderRadius: '40px',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                fontSize: '0.85rem', fontWeight: 600
              }}>
                <Save size={15} />
                {saving ? 'Guardando...' : editando ? 'Actualizar Usuario' : 'Crear Usuario'}
              </button>
              <button type="button" onClick={resetForm} style={{
                background: '#f8f4ef', color: '#1a2332', border: '1px solid #e5dfd7',
                padding: '0.65rem 1.2rem', borderRadius: '40px', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: 600
              }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tabla ── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5dfd7' }}>
          <thead>
            <tr style={{ background: '#f8f4ef' }}>
              {['Usuario', 'Email', 'Rol', 'Registro', 'Acciones'].map(col => (
                <th key={col} style={{ textAlign: 'left', padding: '0.9rem 1rem', fontWeight: 600, color: '#1a2332', borderBottom: '1px solid #e5dfd7', fontSize: '0.83rem' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#9a8f84', fontSize: '0.9rem' }}>
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              usuarios.map(usuario => {
                const badge = getRoleBadge(usuario.role)
                const esUnicoAdmin = usuario.role === 'admin' && usuarios.filter(u => u.role === 'admin').length <= 1
                return (
                  <tr key={usuario.id}
                    style={{ borderBottom: '1px solid #f0ece6', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafaf8'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                  >
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, #1a2332, #c47d3e)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 700, fontSize: '0.9rem'
                        }}>
                          {(usuario.full_name?.charAt(0) || usuario.email?.charAt(0) || 'U').toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1a2332', fontSize: '0.9rem' }}>
                            {usuario.full_name || 'Sin nombre'}
                          </div>
                          <div style={{ fontSize: '0.73rem', color: '#9a8f84' }}>{usuario.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', color: '#4b5563', fontSize: '0.87rem' }}>
                      {usuario.email}
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: '40px',
                        fontSize: '0.74rem', fontWeight: 600,
                        background: `${badge.color}18`, color: badge.color,
                        border: `1px solid ${badge.color}35`
                      }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', color: '#6b7280', fontSize: '0.83rem' }}>
                      {usuario.created_at
                        ? new Date(usuario.created_at).toLocaleDateString('es-PA', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => editarUsuario(usuario)} title="Editar"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c47d3e', padding: '0.3rem', borderRadius: '6px' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fff8f3'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          <Edit size={16} />
                        </button>
                        {!esUnicoAdmin && (
                          <button onClick={() => handleEliminar(usuario)} title="Eliminar" disabled={saving}
                            style={{ background: 'none', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', color: '#e74c3c', padding: '0.3rem', borderRadius: '6px', opacity: saving ? 0.5 : 1 }}
                            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#fef2f2' }}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─── Estilos base ─── */
const labelStyle = {
  display: 'block', fontSize: '0.78rem', fontWeight: 600,
  color: '#1a2332', marginBottom: '0.4rem'
}

const inputStyle = {
  width: '100%', padding: '0.7rem 1rem',
  border: '1.5px solid #e5dfd7', borderRadius: '10px',
  fontSize: '0.9rem', color: '#1a2332',
  fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.2s'
}