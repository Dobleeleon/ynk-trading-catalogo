import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, CheckCircle } from 'lucide-react'
import { getSiteSetting } from '../services/supabaseClient'
import { Navbar } from '../components/layout/Navbar'
import toast from 'react-hot-toast'

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=85'

export function Contacto() {
  const navigate = useNavigate()
  const [bannerImage, setBannerImage] = useState(DEFAULT_BANNER)
  const [bannerLoading, setBannerLoading] = useState(true)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  })
  const [enviando, setEnviando] = useState(false)

  // Cargar banner desde Supabase
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    
    // Datos del correo
    const emailData = {
      to: 'Adrianao.ynk@gmail.com',
      from: formData.email,
      subject: `Nuevo mensaje de contacto de ${formData.nombre}`,
      message: `
        Nombre: ${formData.nombre}
        Email: ${formData.email}
        Teléfono: ${formData.telefono || 'No especificado'}
        
        Mensaje:
        ${formData.mensaje}
        
        ---
        Este mensaje fue enviado desde el formulario de contacto de YNK Trading.
        Fecha: ${new Date().toLocaleString('es-PA')}
      `
    }

    try {
      // Usar EmailJS o un servicio similar (simulado por ahora)
      // Para un sistema real, necesitarías configurar EmailJS, Resend, o un backend
      
      // Simulación de envío exitoso (reemplazar con API real)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Mensaje enviado correctamente. Te responderemos a la brevedad.')
      setFormData({ nombre: '', email: '', telefono: '', mensaje: '' })
    } catch (error) {
      console.error('Error al enviar:', error)
      toast.error('Error al enviar el mensaje. Por favor intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  const infoContacto = [
    { icon: Phone, title: 'Teléfono', content: '+57 315 062 68 85', detail: 'Lunes a Viernes 9am - 6pm' },
    { icon: Mail, title: 'Email', content: 'Adrianao.ynk@gmail.com', detail: 'Respuesta en 24 horas' },
    { icon: MapPin, title: 'Ubicación', content: 'Ciudad de Panamá', detail: 'Zona Libre de Colón' },
    { icon: Clock, title: 'Horario', content: 'Lun - Vie: 9am - 6pm', detail: 'Sábados: 9am - 1pm' }
  ]

  const valores = [
    { titulo: 'Calidad', descripcion: 'Seleccionamos los mejores materiales para garantizar la excelencia en cada producto.' },
    { titulo: 'Innovación', descripcion: 'Buscamos constantemente nuevas tendencias y tecnologías textiles.' },
    { titulo: 'Compromiso', descripcion: 'Nos dedicamos a superar las expectativas de nuestros clientes.' },
    { titulo: 'Sostenibilidad', descripcion: 'Trabajamos con proveedores que respetan el medio ambiente.' }
  ]

  if (bannerLoading) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#fff', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px', height: '48px',
              border: '3px solid #e5dfd7', borderBottomColor: '#c47d3e',
              borderRadius: '50%', animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <p style={{ color: '#6b7280' }}>Cargando...</p>
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

        .ynk-contacto-banner {
          position: relative;
          height: 400px;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .ynk-contacto-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%);
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
          color: #c47d3e;
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
          padding: 3rem 2rem;
        }
        @media (max-width: 768px) { .ynk-container { padding: 2rem 1rem; } }

        .ynk-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a2332;
          margin-bottom: 1rem;
          text-align: center;
        }
        .ynk-section-subtitle {
          text-align: center;
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto 2rem;
          font-size: 1rem;
        }

        .ynk-info-card {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
          border: 1px solid #e5dfd7;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .ynk-info-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.1);
          border-color: #c47d3e;
        }
        .ynk-info-icon {
          width: 60px;
          height: 60px;
          background: #f8f4ef;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: #c47d3e;
        }

        .ynk-formulario {
          background: #f8f4ef;
          border-radius: 24px;
          padding: 2rem;
        }
        .ynk-input {
          width: 100%;
          padding: 0.9rem 1rem;
          border: 1.5px solid #e5dfd7;
          border-radius: 12px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          background: white;
          outline: none;
          font-family: 'DM Sans', sans-serif;
        }
        .ynk-input:focus {
          border-color: #c47d3e;
          box-shadow: 0 0 0 3px rgba(196,125,62,0.1);
        }
        .ynk-textarea {
          min-height: 120px;
          resize: vertical;
        }

        .ynk-valor-card {
          text-align: center;
          padding: 1.5rem;
          background: white;
          border-radius: 16px;
          border: 1px solid #e5dfd7;
          transition: all 0.3s ease;
        }
        .ynk-valor-card:hover {
          background: #1a2332;
          transform: translateY(-4px);
        }
        .ynk-valor-card:hover .ynk-valor-title {
          color: #c47d3e;
        }
        .ynk-valor-card:hover .ynk-valor-desc {
          color: #aaa;
        }
        .ynk-valor-title {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: #1a2332;
          transition: color 0.3s;
        }
        .ynk-valor-desc {
          font-size: 0.85rem;
          color: #6b7280;
          line-height: 1.6;
          transition: color 0.3s;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <Navbar />

      {/* Banner */}
      <div className="ynk-contacto-banner" style={{ backgroundImage: `url(${bannerImage})` }}>
        <div className="ynk-banner-content">
          <h1 className="ynk-banner-title">Contacto & Sobre Nosotros</h1>
          <p className="ynk-banner-subtitle">Conoce más sobre YNK Trading y contáctanos para cualquier consulta</p>
        </div>
      </div>

      {/* Sección Sobre Nosotros */}
      <div className="ynk-container">
        <h2 className="ynk-section-title">Sobre <em style={{ color: '#c47d3e', fontStyle: 'italic' }}>YNK Trading</em></h2>
        <p className="ynk-section-subtitle">
          Somos una empresa dedicada a la importación y distribución de telas de alta calidad, 
          conectando los mejores productores globales con la industria textil panameña.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {valores.map((valor, idx) => (
            <div key={idx} className="ynk-valor-card">
              <div className="ynk-valor-title">{valor.titulo}</div>
              <div className="ynk-valor-desc">{valor.descripcion}</div>
            </div>
          ))}
        </div>

        {/* Información de contacto */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {infoContacto.map((item, idx) => (
            <div key={idx} className="ynk-info-card">
              <div className="ynk-info-icon">
                <item.icon size={28} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1a2332' }}>{item.title}</h3>
              <p style={{ color: '#c47d3e', fontWeight: 600, marginBottom: '0.25rem' }}>{item.content}</p>
              <p style={{ fontSize: '0.75rem', color: '#9a8f84' }}>{item.detail}</p>
            </div>
          ))}
        </div>

        {/* Formulario de contacto */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Información adicional */}
          <div>
            <div style={{ background: '#f8f4ef', borderRadius: '24px', padding: '2rem', height: '100%' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>
                ¿Prefieres escribirnos?
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                Completa el formulario y te responderemos a la brevedad. 
                Nuestro equipo de asesores está listo para ayudarte con tus necesidades textiles.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '32px', height: '32px', background: '#c47d3e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={16} color="white" />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#1a2332' }}>Respuesta rápida</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '32px', height: '32px', background: '#c47d3e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageCircle size={16} color="white" />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#1a2332' }}>Atención personalizada</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div>
            <form onSubmit={handleSubmit} className="ynk-formulario">
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: "'Playfair Display', serif" }}>
                Envíanos un mensaje
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre completo *"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="ynk-input"
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="email"
                  name="email"
                  placeholder="Correo electrónico *"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="ynk-input"
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="tel"
                  name="telefono"
                  placeholder="Teléfono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="ynk-input"
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <textarea
                  name="mensaje"
                  placeholder="Mensaje *"
                  value={formData.mensaje}
                  onChange={handleChange}
                  required
                  className="ynk-input ynk-textarea"
                />
              </div>
              
              <button
                type="submit"
                disabled={enviando}
                style={{
                  width: '100%',
                  background: enviando ? '#9a8f84' : '#1a2332',
                  color: 'white',
                  padding: '0.9rem',
                  border: 'none',
                  borderRadius: '40px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: enviando ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => { if (!enviando) e.target.style.background = '#c47d3e' }}
                onMouseLeave={(e) => { if (!enviando) e.target.style.background = '#1a2332' }}
              >
                {enviando ? (
                  <>
                    <div style={{
                      width: '16px', height: '16px',
                      border: '2px solid white', borderTopColor: 'transparent',
                      borderRadius: '50%', animation: 'spin 1s linear infinite'
                    }} />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Enviar mensaje
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer simplificado */}
      <footer style={{ background: '#1a2332', padding: '3rem 2rem', marginTop: '2rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#9a8f84' }}>
            © 2025 YNK Trading Panamá · Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
  )
}