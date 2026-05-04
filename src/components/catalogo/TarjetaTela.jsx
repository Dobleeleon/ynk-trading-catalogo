import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function TarjetaTela({ tela, onClick }) {
  const [imagenActual, setImagenActual] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [inView, setInView] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const cardRef = useRef(null)
  
  const todasLasImagenes = tela.imagenes_tela || []
  const tieneMultiplesImagenes = todasLasImagenes.length > 1
  
  // Intersection Observer para lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    
    if (cardRef.current) {
      observer.observe(cardRef.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  const siguienteImagen = (e) => {
    e.stopPropagation()
    if (todasLasImagenes.length > 0) {
      setImagenActual((prev) => (prev + 1) % todasLasImagenes.length)
      setImageLoaded(false)
      setImageError(false)
    }
  }
  
  const anteriorImagen = (e) => {
    e.stopPropagation()
    if (todasLasImagenes.length > 0) {
      setImagenActual((prev) => (prev - 1 + todasLasImagenes.length) % todasLasImagenes.length)
      setImageLoaded(false)
      setImageError(false)
    }
  }
  
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
    <div 
      ref={cardRef}
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
        {/* Skeleton loader mientras carga la imagen */}
        {!imageLoaded && inView && !imageError && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #f0ebe4 25%, #e8e2da 50%, #f0ebe4 75%)',
            backgroundSize: '600px 100%',
            animation: 'ynk-shimmer-anim 1.4s ease infinite',
            zIndex: 1
          }} />
        )}
        
        {inView && imagenActualUrl && !imageError ? (
          <>
            <img 
              src={imagenActualUrl} 
              alt={tela.nombre}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                transition: 'transform 0.5s ease, opacity 0.3s',
                pointerEvents: 'none',
                opacity: imageLoaded ? 1 : 0
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
            {tieneMultiplesImagenes && (
              <div style={{ position: 'absolute', bottom: '8px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '6px', zIndex: 2, padding: '4px' }}>
                {todasLasImagenes.map((_, idx) => (
                  <div key={idx} style={{ width: idx === imagenActual ? '20px' : '6px', height: '6px', borderRadius: '3px', background: idx === imagenActual ? '#c47d3e' : 'rgba(255,255,255,0.6)', transition: 'all 0.3s ease' }} />
                ))}
              </div>
            )}
            {tieneMultiplesImagenes && (
              <>
                <button onClick={anteriorImagen} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', transition: 'all 0.3s ease', zIndex: 2 }}>
                  <ChevronLeft size={18} />
                </button>
                <button onClick={siguienteImagen} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', transition: 'all 0.3s ease', zIndex: 2 }}>
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
            color: '#9a8f84',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span style={{ fontSize: '0.8rem' }}>Sin imagen</span>
          </div>
        )}
        
        {tela.destacado && (
          <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#c47d3e', color: 'white', fontSize: '0.7rem', padding: '0.25rem 0.75rem', borderRadius: '20px', fontWeight: '600', zIndex: 2 }}>
            Destacado
          </span>
        )}
        
        {tieneMultiplesImagenes && !imageError && (
          <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'white', fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: '500', zIndex: 2 }}>
            {imagenActual + 1} / {todasLasImagenes.length}
          </span>
        )}
      </div>
      
      <div style={{ padding: '1rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#c47d3e', marginBottom: '0.5rem', letterSpacing: '0.03em' }}>
          {tela.referencia || 'REF: N/A'}
        </div>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1a2332', marginBottom: '0.5rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {tela.nombre}
        </h3>
        
        {/* Peso y Ancho */}
        {(tela.peso || tela.ancho) && (
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginBottom: '0.75rem',
            fontSize: '0.7rem',
            color: '#6b7280'
          }}>
            {tela.peso && (
              <div style={{ 
                background: '#f8f4ef', 
                padding: '0.2rem 0.5rem', 
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <strong>Peso:</strong> {typeof tela.peso === 'number' ? tela.peso.toFixed(2) : tela.peso} onz
              </div>
            )}
            {tela.ancho && (
              <div style={{ 
                background: '#f8f4ef', 
                padding: '0.2rem 0.5rem', 
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <strong>Ancho:</strong> {tela.ancho} cm
              </div>
            )}
          </div>
        )}
        
        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {tela.composicion || ''}
        </div>
        
        {tela.tela_colores?.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            {tela.tela_colores.slice(0, 6).map(tc => (
              <div key={tc.colores.id} style={{ width: '24px', height: '24px', borderRadius: '50%', background: tc.colores.codigo_hex, border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} title={tc.colores.nombre} />
            ))}
            {tela.tela_colores.length > 6 && (
              <span style={{ fontSize: '0.7rem', color: '#9a8f84', alignSelf: 'center' }}>
                +{tela.tela_colores.length - 6}
              </span>
            )}
          </div>
        )}
        
        {tela.stock > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.65rem', color: '#3e5f73', background: '#e8f0f5', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
              Stock: {tela.stock} m
            </span>
          </div>
        )}
      </div>
    </div>
  )
}