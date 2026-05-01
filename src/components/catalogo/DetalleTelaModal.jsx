import React, { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function DetalleTelaModal({ tela, onClose }) {
  const [imagenActual, setImagenActual] = useState(0)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  
  const todasLasImagenes = tela.imagenes_tela || []
  const tieneMultiplesImagenes = todasLasImagenes.length > 1
  
  const siguienteImagen = (e) => {
    e?.stopPropagation()
    if (todasLasImagenes.length > 0) {
      setImagenActual((prev) => (prev + 1) % todasLasImagenes.length)
    }
  }
  
  const anteriorImagen = (e) => {
    e?.stopPropagation()
    if (todasLasImagenes.length > 0) {
      setImagenActual((prev) => (prev - 1 + todasLasImagenes.length) % todasLasImagenes.length)
    }
  }
  
  // Manejo de swipe táctil
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }
  
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX
  }
  
  const handleTouchEnd = (e) => {
    if (!tieneMultiplesImagenes) return
    
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) < 50) return
    
    if (diff > 0) {
      siguienteImagen(e)
    } else {
      anteriorImagen(e)
    }
    
    touchStartX.current = 0
    touchEndX.current = 0
  }
  
  const imagenActualUrl = todasLasImagenes[imagenActual]?.imagen_url || null

  return (
    <div>
      {/* Sección de imágenes con slider y soporte táctil */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div 
          style={{ 
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            background: '#f5f5f0',
            aspectRatio: '1/1'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {imagenActualUrl ? (
            <>
              <img 
                src={imagenActualUrl} 
                alt={tela.nombre}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  pointerEvents: 'none'
                }}
              />
              
              {/* Botones de navegación - visibles en desktop y táctiles grandes */}
              {tieneMultiplesImagenes && (
                <>
                  <button
                    onClick={anteriorImagen}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.6)',
                      backdropFilter: 'blur(4px)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      zIndex: 2
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={siguienteImagen}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.6)',
                      backdropFilter: 'blur(4px)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'white',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: '#9a8f84'
            }}>
              Sin imagen
            </div>
          )}
          
          {/* Contador de imágenes */}
          {tieneMultiplesImagenes && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              color: 'white',
              fontSize: '0.75rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontWeight: '500',
              zIndex: 2
            }}>
              {imagenActual + 1} / {todasLasImagenes.length}
            </div>
          )}
          
          {/* Dots indicadores */}
          {tieneMultiplesImagenes && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              zIndex: 2
            }}>
              {todasLasImagenes.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    setImagenActual(idx)
                  }}
                  style={{
                    width: idx === imagenActual ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: idx === imagenActual ? '#c47d3e' : 'rgba(255,255,255,0.6)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Miniaturas - horizontal scrollable */}
        {tieneMultiplesImagenes && (
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '12px',
            overflowX: 'auto',
            paddingBottom: '4px',
            WebkitOverflowScrolling: 'touch'
          }}>
            {todasLasImagenes.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setImagenActual(idx)}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: idx === imagenActual ? '2px solid #c47d3e' : '2px solid transparent',
                  opacity: idx === imagenActual ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
              >
                <img 
                  src={img.imagen_url} 
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Información de la tela */}
      <div>
        <div style={{ 
          fontSize: '1rem', 
          fontWeight: '700',
          color: '#c47d3e', 
          marginBottom: '0.5rem',
          letterSpacing: '0.03em'
        }}>
          {tela.referencia || 'Referencia: N/A'}
        </div>
        
        <p style={{ fontSize: '0.85rem', color: '#9a8f84', marginBottom: '0.75rem' }}>
          Item: {tela.item || 'N/A'}
        </p>
        
        <h2 style={{ 
          fontSize: '1.6rem', 
          fontWeight: 700, 
          color: '#1a2332', 
          marginBottom: '0.75rem', 
          fontFamily: "'Playfair Display', serif" 
        }}>
          {tela.nombre}
        </h2>
        
        <p style={{ color: '#6b7280', lineHeight: 1.7, marginBottom: '1.25rem', fontSize: '0.9rem' }}>
          {tela.descripcion || 'Sin descripción'}
        </p>

        {/* Especificaciones Técnicas */}
        <div style={{ background: '#f8f4ef', borderRadius: '14px', padding: '1rem', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 600, color: '#1a2332', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
            Especificaciones Técnicas
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
            {[
              ['Composición', tela.composicion],
              ['Peso', tela.peso],
              ['Ancho', tela.ancho],
              ['Espec. Técnica', tela.espec_tec]
            ].map(([label, val]) => (
              <div key={label}>
                <span style={{ color: '#9a8f84', display: 'block' }}>{label}</span>
                <p style={{ fontWeight: 600, color: '#1a2332' }}>{val || 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Colores disponibles */}
        {tela.tela_colores?.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 600, color: '#1a2332', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Colores disponibles
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {tela.tela_colores.map(tc => (
                <div 
                  key={tc.colores.id} 
                  title={tc.colores.nombre}
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: tc.colores.codigo_hex, 
                    border: '2px solid white', 
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)' 
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}