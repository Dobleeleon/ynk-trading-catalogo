import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'

export function TarjetaTela({ tela, onClick }) {
  const [imagenActual, setImagenActual] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [inView, setInView] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const cardRef = useRef(null)
  const imageRef = useRef(null)
  
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
  
  // Auto-rotación suave de imágenes cuando está en hover
  useEffect(() => {
    if (!isHovered || !tieneMultiplesImagenes) return
    
    const interval = setInterval(() => {
      setImagenActual(prev => {
        setImageLoaded(false)
        setImageError(false)
        return (prev + 1) % todasLasImagenes.length
      })
    }, 2500)
    
    return () => clearInterval(interval)
  }, [isHovered, tieneMultiplesImagenes, todasLasImagenes.length])
  
  const cambiarImagen = useCallback((direccion, e) => {
    e.stopPropagation()
    if (!tieneMultiplesImagenes) return
    
    setImagenActual(prev => {
      setImageLoaded(false)
      setImageError(false)
      if (direccion === 'next') {
        return (prev + 1) % todasLasImagenes.length
      }
      return (prev - 1 + todasLasImagenes.length) % todasLasImagenes.length
    })
  }, [tieneMultiplesImagenes, todasLasImagenes.length])
  
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
    
    e.stopPropagation()
    if (diff > 0) {
      cambiarImagen('next', e)
    } else {
      cambiarImagen('prev', e)
    }
    touchStartX.current = 0
    touchEndX.current = 0
  }
  
  const handleCardClick = (e) => {
    // No abrir el detalle si se hizo swipe
    if (Math.abs(touchStartX.current - touchEndX.current) > 50) return
    onClick(tela)
  }
  
  const imagenActualUrl = todasLasImagenes[imagenActual]?.imagen_url || null

  return (
    <>
      <style>{`
        .tela-card {
          background: white;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid #ede8df;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
          animation: cardAppear 0.5s ease both;
        }
        .tela-card:hover {
          transform: translateY(-6px);
          box-shadow: 
            0 20px 35px rgba(0,0,0,0.08),
            0 0 0 1px rgba(196,125,62,0.12);
          border-color: rgba(196,125,62,0.2);
        }
        @keyframes cardAppear {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .tela-card-image-wrap {
          position: relative;
          height: 250px;
          overflow: hidden;
          background: #f5f2ed;
        }
        
        /* Skeleton shimmer */
        .tela-card-skeleton {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            #f0ebe4 25%,
            #e8e2da 50%,
            #f0ebe4 75%
          );
          background-size: 600px 100%;
          animation: shimmer 1.5s ease-in-out infinite;
          z-index: 1;
        }
        @keyframes shimmer {
          0% { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }

        .tela-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s ease;
          opacity: 0;
        }
        .tela-card-image.loaded {
          opacity: 1;
        }
        .tela-card:hover .tela-card-image {
          transform: scale(1.06);
        }

        /* Efecto shine */
        .tela-card-shine {
          position: absolute;
          top: 0;
          left: -75%;
          width: 60%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.13),
            transparent
          );
          transform: skewX(-20deg);
          transition: left 0.7s ease;
          z-index: 2;
          pointer-events: none;
        }
        .tela-card:hover .tela-card-shine {
          left: 125%;
        }

        /* Overlay inferior */
        .tela-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0,0,0,0.35) 0%,
            transparent 50%
          );
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 1;
          pointer-events: none;
        }
        .tela-card:hover .tela-card-overlay {
          opacity: 1;
        }

        /* ── Botones de navegación MÁS GRANDES ── */
        .tela-card-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 4;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.4);
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(10px);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          pointer-events: none;
        }
        .tela-card-image-wrap:hover .tela-card-nav-btn {
          opacity: 1;
          pointer-events: auto;
        }
        .tela-card-nav-btn:hover {
          background: rgba(0,0,0,0.7);
          border-color: rgba(255,255,255,0.7);
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        .tela-card-nav-btn:active {
          transform: translateY(-50%) scale(0.95);
        }
        .tela-card-nav-btn.prev {
          left: 12px;
        }
        .tela-card-nav-btn.next {
          right: 12px;
        }

        /* Dots indicadores */
        .tela-card-dots {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
          z-index: 3;
          padding: 5px 10px;
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .tela-card-image-wrap:hover .tela-card-dots {
          opacity: 1;
        }
        .tela-card-dot {
          width: 6px;
          height: 6px;
          border-radius: 3px;
          background: rgba(255,255,255,0.5);
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          cursor: pointer;
        }
        .tela-card-dot.active {
          width: 20px;
          background: white;
          box-shadow: 0 0 8px rgba(255,255,255,0.4);
        }

        /* Badge destacado */
        .tela-card-badge-featured {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 4px;
          background: linear-gradient(135deg, #c47d3e, #d4954e);
          color: white;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          letter-spacing: 0.04em;
          box-shadow: 0 2px 8px rgba(196,125,62,0.3);
          transition: transform 0.3s ease;
        }
        .tela-card:hover .tela-card-badge-featured {
          transform: translateY(-2px) scale(1.02);
        }

        /* Contador de imágenes */
        .tela-card-counter {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 3;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(8px);
          color: white;
          font-size: 0.65rem;
          font-weight: 600;
          padding: 0.25rem 0.6rem;
          border-radius: 12px;
          letter-spacing: 0.03em;
          transition: opacity 0.3s ease;
          opacity: 0;
        }
        .tela-card:hover .tela-card-counter {
          opacity: 1;
        }

        /* Color dots en la imagen */
        .tela-card-colors-preview {
          position: absolute;
          bottom: 12px;
          right: 12px;
          z-index: 3;
          display: flex;
          gap: 4px;
          transition: transform 0.3s ease;
        }
        .tela-card:hover .tela-card-colors-preview {
          transform: translateY(-3px);
        }
        .tela-card-color-mini {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          transition: transform 0.3s ease;
        }
        .tela-card:hover .tela-card-color-mini {
          transform: scale(1.2);
        }

        /* Estado sin imagen */
        .tela-card-no-image {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #b8b0a4;
          gap: 0.5rem;
        }

        /* Cuerpo de la card */
        .tela-card-body {
          padding: 1.15rem 1.3rem 1.3rem;
        }
        .tela-card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.35rem;
        }
        .tela-card-category {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #c47d3e;
        }
        .tela-card-ref {
          font-size: 0.68rem;
          color: #b0a89c;
          font-weight: 500;
        }
        .tela-card-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0.3rem 0 0.5rem;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.3s ease;
        }
        .tela-card:hover .tela-card-name {
          color: #c47d3e;
        }

        /* Chips de peso y ancho */
        .tela-card-chips {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.65rem;
          flex-wrap: wrap;
        }
        .tela-card-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.6rem;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 500;
          color: #6b7280;
          background: #f8f5f0;
        }
        .tela-card-chip strong {
          color: #1a1a2e;
          font-weight: 600;
        }

        /* Composición */
        .tela-card-composition {
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.7rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
        }

        /* Colores en el cuerpo */
        .tela-card-colors-list {
          display: flex;
          gap: 0.35rem;
          flex-wrap: wrap;
          margin-bottom: 0.25rem;
        }
        .tela-card-color-circle {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.12);
          transition: transform 0.25s ease;
          cursor: default;
        }
        .tela-card-color-circle:hover {
          transform: scale(1.25);
        }
        .tela-card-colors-more {
          font-size: 0.68rem;
          color: #9a8f84;
          align-self: center;
          font-weight: 600;
        }

        /* Footer simple */
        .tela-card-footer {
          padding-top: 0.65rem;
          border-top: 1px solid #f3efe8;
          margin-top: 0.5rem;
        }
        .tela-card-action-hint {
          font-size: 0.7rem;
          color: #b0a89c;
          opacity: 0;
          transform: translateX(-5px);
          transition: all 0.3s ease;
        }
        .tela-card:hover .tela-card-action-hint {
          opacity: 1;
          transform: translateX(0);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .tela-card-image-wrap {
            height: 220px;
          }
          .tela-card-nav-btn {
            opacity: 1;
            width: 36px;
            height: 36px;
          }
          .tela-card-dots {
            opacity: 1;
          }
          .tela-card-counter {
            opacity: 1;
          }
        }
      `}</style>

      <div 
        ref={cardRef}
        className="tela-card"
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          animationDelay: `${Math.random() * 0.3}s` 
        }}
      >
        <div 
          className="tela-card-image-wrap"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Skeleton */}
          {!imageLoaded && inView && !imageError && (
            <div className="tela-card-skeleton" />
          )}
          
          {/* Imagen */}
          {inView && imagenActualUrl && !imageError ? (
            <>
              <img 
                ref={imageRef}
                src={imagenActualUrl} 
                alt={tela.nombre || 'Tela'}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className={`tela-card-image ${imageLoaded ? 'loaded' : ''}`}
              />
              
              {/* Shine effect */}
              <div className="tela-card-shine" />
              
              {/* Overlay inferior */}
              <div className="tela-card-overlay" />
              
              {/* Botones de navegación GRANDES */}
              {tieneMultiplesImagenes && (
                <>
                  <button 
                    className="tela-card-nav-btn prev"
                    onClick={(e) => cambiarImagen('prev', e)}
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button 
                    className="tela-card-nav-btn next"
                    onClick={(e) => cambiarImagen('next', e)}
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
              
              {/* Dots indicadores */}
              {tieneMultiplesImagenes && (
                <div className="tela-card-dots">
                  {todasLasImagenes.map((_, idx) => (
                    <div
                      key={idx}
                      className={`tela-card-dot ${idx === imagenActual ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setImagenActual(idx)
                        setImageLoaded(false)
                        setImageError(false)
                      }}
                    />
                  ))}
                </div>
              )}
              
              {/* Colores preview en imagen */}
              {tela.tela_colores?.length > 0 && (
                <div className="tela-card-colors-preview">
                  {tela.tela_colores.slice(0, 4).map(tc => (
                    <div
                      key={tc.colores.id}
                      className="tela-card-color-mini"
                      style={{ background: tc.colores.codigo_hex }}
                      title={tc.colores.nombre}
                    />
                  ))}
                </div>
              )}
              
              {/* Contador de imágenes */}
              {tieneMultiplesImagenes && (
                <span className="tela-card-counter">
                  {imagenActual + 1}/{todasLasImagenes.length}
                </span>
              )}
            </>
          ) : (
            <div className="tela-card-no-image">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" opacity="0.3" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span style={{ fontSize: '0.78rem' }}>Sin imagen disponible</span>
            </div>
          )}
          
          {/* Badge destacado */}
          {tela.destacado && (
            <span className="tela-card-badge-featured">
              <Sparkles size={12} />
              Destacado
            </span>
          )}
        </div>
        
        {/* Cuerpo de la card */}
        <div className="tela-card-body">
          <div className="tela-card-meta">
            <span className="tela-card-category">
              {tela.categoria?.nombre || 'Tela'}
            </span>
            <span className="tela-card-ref">
              {tela.referencia || 'REF: N/A'}
            </span>
          </div>
          
          <h3 className="tela-card-name">
            {tela.nombre || 'Sin nombre'}
          </h3>
          
          {/* Chips de peso y ancho */}
          {(tela.peso || tela.ancho) && (
            <div className="tela-card-chips">
              {tela.peso && (
                <span className="tela-card-chip">
                  <strong>Peso:</strong> 
                  {typeof tela.peso === 'number' ? tela.peso.toFixed(2) : tela.peso} oz
                </span>
              )}
              {tela.ancho && (
                <span className="tela-card-chip">
                  <strong>Ancho:</strong> {tela.ancho} cm
                </span>
              )}
            </div>
          )}
          
          {/* Composición */}
          {tela.composicion && (
            <p className="tela-card-composition">
              {tela.composicion}
            </p>
          )}
          
          {/* Colores */}
          {tela.tela_colores?.length > 0 && (
            <div className="tela-card-colors-list">
              {tela.tela_colores.slice(0, 5).map(tc => (
                <div
                  key={tc.colores.id}
                  className="tela-card-color-circle"
                  style={{ background: tc.colores.codigo_hex }}
                  title={tc.colores.nombre}
                />
              ))}
              {tela.tela_colores.length > 5 && (
                <span className="tela-card-colors-more">
                  +{tela.tela_colores.length - 5}
                </span>
              )}
            </div>
          )}
          
          {/* Footer simple - solo hint */}
          <div className="tela-card-footer">
            <span className="tela-card-action-hint">
              Ver detalle →
            </span>
          </div>
        </div>
      </div>
    </>
  )
}