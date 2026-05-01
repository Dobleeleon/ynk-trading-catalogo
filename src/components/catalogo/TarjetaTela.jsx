import React, { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function TarjetaTela({ tela, onClick }) {
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
    e.stopPropagation()
    if (!tieneMultiplesImagenes) return
    
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) < 50) return // Umbral mínimo de 50px
    
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
    <div 
      onClick={() => onClick(tela)}
      style={{
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #e5dfd7',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'
        e.currentTarget.style.borderColor = '#c47d3e'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
        e.currentTarget.style.borderColor = '#e5dfd7'
      }}
    >
      {/* Imagen con slider y soporte táctil */}
      <div 
        style={{ 
          position: 'relative',
          height: '240px', 
          overflow: 'hidden',
          background: '#f5f5f0'
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
                transition: 'transform 0.5s ease',
                pointerEvents: 'none'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
            
            {/* Indicador de múltiples imágenes */}
            {tieneMultiplesImagenes && (
              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                gap: '6px',
                zIndex: 2,
                padding: '4px'
              }}>
                {todasLasImagenes.map((_, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: idx === imagenActual ? '20px' : '6px',
                      height: '6px',
                      borderRadius: '3px',
                      background: idx === imagenActual ? '#c47d3e' : 'rgba(255,255,255,0.6)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
            )}
            
            {/* Botones de navegación - solo visibles en desktop */}
            {tieneMultiplesImagenes && (
              <>
                <button
                  onClick={anteriorImagen}
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    zIndex: 2
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={siguienteImagen}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    zIndex: 2
                  }}
                >
                  <ChevronRight size={18} />
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
        
        {/* Badge de destacado */}
        {tela.destacado && (
          <span style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: '#c47d3e',
            color: 'white',
            fontSize: '0.7rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontWeight: '600',
            zIndex: 2
          }}>
            Destacado
          </span>
        )}
        
        {/* Contador de imágenes */}
        {tieneMultiplesImagenes && (
          <span style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            color: 'white',
            fontSize: '0.65rem',
            padding: '0.2rem 0.5rem',
            borderRadius: '12px',
            fontWeight: '500',
            zIndex: 2
          }}>
            {imagenActual + 1} / {todasLasImagenes.length}
          </span>
        )}
      </div>
      
      {/* Contenido */}
      <div style={{ padding: '1rem' }}>
        <div style={{ 
          fontSize: '0.85rem', 
          fontWeight: '700',
          color: '#c47d3e', 
          marginBottom: '0.5rem',
          letterSpacing: '0.03em'
        }}>
          {tela.referencia || 'REF: N/A'}
        </div>
        
        <h3 style={{ 
          fontSize: '1rem', 
          fontWeight: '700', 
          color: '#1a2332',
          marginBottom: '0.5rem',
          lineHeight: 1.3,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {tela.nombre}
        </h3>
        
        <div style={{ 
          fontSize: '0.75rem', 
          color: '#6b7280',
          marginBottom: '0.75rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {tela.composicion || ''}
        </div>
        
        {/* Colores disponibles */}
        {tela.tela_colores?.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            {tela.tela_colores.slice(0, 6).map(tc => (
              <div 
                key={tc.colores.id}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: tc.colores.codigo_hex,
                  border: '2px solid white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
                title={tc.colores.nombre}
              />
            ))}
            {tela.tela_colores.length > 6 && (
              <span style={{ fontSize: '0.7rem', color: '#9a8f84', alignSelf: 'center' }}>
                +{tela.tela_colores.length - 6}
              </span>
            )}
          </div>
        )}
        
        {tela.stock > 0 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-start',
            marginTop: '0.5rem'
          }}>
            <span style={{ 
              fontSize: '0.65rem', 
              color: '#3e5f73',
              background: '#e8f0f5',
              padding: '0.2rem 0.6rem',
              borderRadius: '12px'
            }}>
              Stock: {tela.stock} m
            </span>
          </div>
        )}
      </div>
    </div>
  )
}