import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      minHeight: '100vh',
      background: '#f8f4ef',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .ynk-login-card {
          background: white;
          border-radius: 24px;
          padding: 3rem;
          width: 100%;
          max-width: 420px;
          border: 1px solid #e5dfd7;
          box-shadow: 0 20px 60px rgba(0,0,0,0.06);
        }

        .ynk-login-logo {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #1a2332;
          margin-bottom: 0.3rem;
        }

        .ynk-login-logo span { color: #c47d3e; font-style: italic; }

        .ynk-login-subtitle {
          font-size: 0.85rem;
          color: #9a8f84;
          margin-bottom: 2.5rem;
          letter-spacing: 0.03em;
        }

        .ynk-input-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 600;
          color: #1a2332;
          margin-bottom: 0.4rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .ynk-input {
          width: 100%;
          padding: 0.85rem 1rem;
          border: 1.5px solid #e5dfd7;
          border-radius: 12px;
          font-size: 0.9rem;
          font-family: 'DM Sans', sans-serif;
          color: #1a2332;
          background: #fdfcfb;
          transition: all 0.2s ease;
          outline: none;
          box-sizing: border-box;
        }

        .ynk-input:focus {
          border-color: #c47d3e;
          box-shadow: 0 0 0 3px rgba(196,125,62,0.1);
          background: white;
        }

        .ynk-input::placeholder { color: #c9c3b8; }

        .ynk-pw-wrap { position: relative; }
        .ynk-pw-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          color: #9a8f84;
          padding: 0;
          line-height: 1;
        }

        .ynk-btn-login {
          width: 100%;
          padding: 0.95rem;
          background: #1a2332;
          color: white;
          border: none;
          border-radius: 40px;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 0.5rem;
        }

        .ynk-btn-login:hover:not(:disabled) {
          background: #c47d3e;
          transform: translateY(-2px);
        }

        .ynk-btn-login:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ynk-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.82rem;
          margin-bottom: 1rem;
        }

        .ynk-divider {
          border: none;
          border-top: 1px solid #e5dfd7;
          margin: 2rem 0 1.5rem;
        }

        .ynk-back-link {
          display: block;
          text-align: center;
          font-size: 0.8rem;
          color: #9a8f84;
          text-decoration: none;
          transition: color 0.2s;
        }

        .ynk-back-link:hover { color: #c47d3e; }
      `}</style>

      <div className="ynk-login-card">
        {/* Logo */}
        <div className="ynk-login-logo">
          YNK <span>Trading</span>
        </div>
        <p className="ynk-login-subtitle">Panel de administración · Acceso restringido</p>

        {/* Error */}
        {error && <div className="ynk-error">⚠️ {error}</div>}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label className="ynk-input-label" htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="usuario@ejemplo.com"
              required
              className="ynk-input"
              autoComplete="email"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="ynk-input-label" htmlFor="password">Contraseña</label>
            <div className="ynk-pw-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="ynk-input"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="ynk-pw-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="ynk-btn-login" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión →'}
          </button>
        </form>

        <hr className="ynk-divider" />
        <a href="/" className="ynk-back-link">← Volver al sitio</a>
      </div>
    </div>
  )
}
