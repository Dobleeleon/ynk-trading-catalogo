import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, ArrowLeft, Sparkles, Shield } from 'lucide-react'
import loginImage from '../assets/Login.png'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(formData.email, formData.password)
      navigate('/admin')
    } catch (err) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        /* ═══════════════════════════════════════════
           BASE
           ═══════════════════════════════════════════ */
        .login-page {
          font-family: 'DM Sans', -apple-system, sans-serif;
          min-height: 100vh;
          display: flex;
          background: #fcfbf9;
        }

        /* ═══════════════════════════════════════════
           PANEL IZQUIERDO - IMAGEN
           ═══════════════════════════════════════════ */
        .login-image-panel {
          flex: 1;
          background-image: url('${loginImage}');
          background-size: cover;
          background-position: center;
          position: relative;
          display: flex;
          align-items: flex-end;
          padding: 3rem;
          min-height: 100vh;
        }
        .login-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(26, 35, 50, 0.4) 0%,
            rgba(26, 35, 50, 0.2) 40%,
            rgba(26, 35, 50, 0.7) 100%
          );
        }
        .login-image-content {
          position: relative;
          z-index: 2;
          color: white;
          max-width: 420px;
        }
        .login-image-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #d4954e;
          margin-bottom: 1.25rem;
        }
        .login-image-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.2rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 0.75rem;
        }
        .login-image-title em {
          font-style: italic;
          color: #d4954e;
        }
        .login-image-desc {
          font-size: 0.9rem;
          opacity: 0.8;
          line-height: 1.6;
          font-weight: 300;
        }

        /* ═══════════════════════════════════════════
           PANEL DERECHO - FORMULARIO
           ═══════════════════════════════════════════ */
        .login-form-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: white;
        }
        .login-form-wrapper {
          width: 100%;
          max-width: 420px;
        }
        .login-back {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          color: #9a8f84;
          text-decoration: none;
          margin-bottom: 2.5rem;
          transition: color 0.2s;
          font-weight: 500;
        }
        .login-back:hover {
          color: #c47d3e;
        }
        .login-logo {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 0.3rem;
        }
        .login-logo span {
          color: #c47d3e;
          font-style: italic;
        }
        .login-subtitle {
          font-size: 0.85rem;
          color: #9a8f84;
          margin-bottom: 2.5rem;
        }
        .login-subtitle-icon {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: #fef9f4;
          padding: 0.25rem 0.65rem;
          border-radius: 20px;
          font-size: 0.72rem;
          color: #c47d3e;
          font-weight: 600;
          margin-left: 0.5rem;
        }

        /* Campos */
        .login-field {
          margin-bottom: 1.3rem;
        }
        .login-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 0.45rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .login-input-wrap {
          position: relative;
        }
        .login-input {
          width: 100%;
          padding: 0.85rem 1rem;
          border: 1.5px solid #e8e3d9;
          border-radius: 14px;
          font-size: 0.9rem;
          font-family: 'DM Sans', sans-serif;
          color: #1a1a2e;
          background: #fdfcfb;
          transition: all 0.3s ease;
          outline: none;
          box-sizing: border-box;
        }
        .login-input:focus {
          border-color: #c47d3e;
          box-shadow: 0 0 0 4px rgba(196,125,62,0.06);
          background: white;
        }
        .login-input::placeholder {
          color: #c9c3b8;
        }
        .login-input-icon {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #b0a89c;
          transition: color 0.3s;
        }
        .login-input:focus ~ .login-input-icon {
          color: #c47d3e;
        }
        .login-pw-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: #b0a89c;
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }
        .login-pw-toggle:hover {
          color: #c47d3e;
        }

        /* Botón */
        .login-btn {
          width: 100%;
          padding: 0.9rem;
          background: #1a2332;
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          margin-top: 0.75rem;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .login-btn:hover:not(:disabled) {
          background: #c47d3e;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(196,125,62,0.3);
        }
        .login-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Spinner en botón */
        .login-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: loginSpin 0.7s linear infinite;
        }
        @keyframes loginSpin {
          to { transform: rotate(360deg); }
        }

        /* Error */
        .login-error {
          background: #fef5f5;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 0.8rem 1rem;
          border-radius: 12px;
          font-size: 0.8rem;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .login-error-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #dc2626;
          flex-shrink: 0;
        }

        /* Divider */
        .login-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 2rem 0 1.5rem;
          color: #c9c3b8;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e8e3d9;
        }

        /* ═══════════════════════════════════════════
           RESPONSIVE
           ═══════════════════════════════════════════ */
        @media (max-width: 900px) {
          .login-page {
            flex-direction: column;
          }
          .login-image-panel {
            min-height: 260px;
            padding: 2rem 1.5rem;
          }
          .login-image-title {
            font-size: 1.6rem;
          }
          .login-image-desc {
            font-size: 0.82rem;
          }
          .login-form-panel {
            padding: 2rem 1.5rem;
          }
          .login-form-wrapper {
            max-width: 100%;
          }
        }
      `}</style>

      {/* ═══════════════════════════════════════════
         PANEL IZQUIERDO - IMAGEN
         ═══════════════════════════════════════════ */}
      <div className="login-image-panel">
        <div className="login-image-overlay" />
        <div className="login-image-content">
          <div className="login-image-badge">
            <Sparkles size={12} />
            Acceso Exclusivo
          </div>
          <h2 className="login-image-title">
            YNK <em>Trading</em>
          </h2>
          <p className="login-image-desc">
            Panel de administración para gestionar el catálogo de telas, 
            contenido del sitio y configuraciones.
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
         PANEL DERECHO - FORMULARIO
         ═══════════════════════════════════════════ */}
      <div className="login-form-panel">
        <div className="login-form-wrapper">
          {/* Volver */}
          <a href="/" className="login-back">
            <ArrowLeft size={16} />
            Volver al sitio
          </a>

          {/* Logo */}
          <div className="login-logo">
            YNK <span>Trading</span>
          </div>
          <p className="login-subtitle">
            Inicia sesión para acceder
            <span className="login-subtitle-icon">
              <Shield size={11} />
              Restringido
            </span>
          </p>

          {/* Error */}
          {error && (
            <div className="login-error">
              <span className="login-error-dot" />
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label" htmlFor="email">
                Correo electrónico
              </label>
              <div className="login-input-wrap">
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="usuario@ynktrading.com"
                  required
                  className="login-input"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="password">
                Contraseña
              </label>
              <div className="login-input-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="login-input"
                  autoComplete="current-password"
                  style={{ paddingRight: '2.8rem' }}
                />
                <button
                  type="button"
                  className="login-pw-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Verificando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="login-divider">Acceso restringido</div>
          <p style={{ 
            textAlign: 'center', 
            fontSize: '0.72rem', 
            color: '#b0a89c',
            lineHeight: 1.5
          }}>
            Solo personal autorizado. Si olvidaste tus credenciales, 
            contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  )
}