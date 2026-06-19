import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronUp, ChevronDown, ZoomIn, Ruler, Weight, FlaskConical } from 'lucide-react'

export function DetalleTelaModal({ tela, onClose }) {
  const [imagenActual, setImagenActual] = useState(0)
  const [imagenCargada, setImagenCargada] = useState(false)
  const [imagenError, setImagenError] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const touchStartY = useRef(0)
  const touchEndY = useRef(0)
  const imageRef = useRef(null)
  
  const todasLasImagenes = tela.imagenes_tela || []
  const tieneMultiplesImagenes = todasLasImagenes.length > 1
  const MAX_VISIBLE_THUMBS = 5
  
  // Resetear estado cuando cambia la imagen
  useEffect(() => {
    setImagenCargada(false)
    setImagenError(false)
    setIsZoomed(false)
  }, [imagenActual])
  
  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowUp' && tieneMultiplesImagenes) {
        e.preventDefault()
        anteriorImagen()
      }
      if (e.key === 'ArrowDown' && tieneMultiplesImagenes) {
        e.preventDefault()
        siguienteImagen()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tieneMultiplesImagenes, imagenActual])
  
  const siguienteImagen = useCallback((e) => {
    e?.stopPropagation()
    if (todasLasImagenes.length > 0) {
      setImagenActual((prev) => (prev + 1) % todasLasImagenes.length)
    }
  }, [todasLasImagenes.length])
  
  const anteriorImagen = useCallback((e) => {
    e?.stopPropagation()
    if (todasLasImagenes.length > 0) {
      setImagenActual((prev) => (prev - 1 + todasLasImagenes.length) % todasLasImagenes.length)
    }
  }, [todasLasImagenes.length])
  
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX
    touchEndY.current = e.touches[0].clientY
  }
  
  const handleTouchEnd = (e) => {
    if (!tieneMultiplesImagenes) return
    const diffX = touchStartX.current - touchEndX.current
    const diffY = touchStartY.current - touchEndY.current
    
    // Solo si el swipe es más horizontal que vertical (para no interferir con scroll)
    if (Math.abs(diffX) < 50 && Math.abs(diffY) < 50) return
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Swipe horizontal
      if (diffX > 0) {
        siguienteImagen(e)
      } else {
        anteriorImagen(e)
      }
    }
    
    touchStartX.current = 0
    touchEndX.current = 0
    touchStartY.current = 0
    touchEndY.current = 0
  }
  
  const handleMouseMove = (e) => {
    if (!isZoomed) return
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }
  
  const toggleZoom = (e) => {
    e.stopPropagation()
    setIsZoomed(!isZoomed)
  }
  
  const imagenActualUrl = todasLasImagenes[imagenActual]?.imagen_url || null
  
  // Calcular thumbnails visibles
  const startThumb = Math.max(0, Math.min(
    imagenActual - Math.floor(MAX_VISIBLE_THUMBS / 2),
    todasLasImagenes.length - MAX_VISIBLE_THUMBS
  ))
  const visibleThumbs = todasLasImagenes.slice(startThumb, startThumb + MAX_VISIBLE_THUMBS)

  return (
    <>
      <style>{`
        .detalle-modal {
          display: flex;
          flex-direction: column;
          max-height: 85vh;
          overflow-y: auto;
          padding-right: 0.5rem;
          scrollbar-width: thin;
          scrollbar-color: #d5cdc2 transparent;
        }
        .detalle-modal::-webkit-scrollbar {
          width: 5px;
        }
        .detalle-modal::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }
        .detalle-modal::-webkit-scrollbar-thumb {
          background: #d5cdc2;
          border-radius: 10px;
        }

        /* ═══════════════════════════════════════════
           LAYOUT PRINCIPAL: IMAGEN + THUMBNAILS
           ═══════════════════════════════════════════ */
        .detalle-galeria-wrapper {
          display: flex;
          gap: 16px;
          margin-bottom: 1.5rem;
          min-height: 420px;
          max-height: 55vh;
        }

        /* ── Imagen principal (más grande) ── */
        .detalle-galeria {
          flex: 1;
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          background: #f5f2ed;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Skeleton loader */
        .detalle-skeleton {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            #f0ebe4 25%,
            #e8e2da 50%,
            #f0ebe4 75%
          );
          background-size: 600px 100%;
          animation: detalle-shimmer 1.5s ease-in-out infinite;
          z-index: 1;
        }
        @keyframes detalle-shimmer {
          0% { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }

        .detalle-imagen {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease;
          opacity: 0;
          cursor: zoom-in;
        }
        .detalle-imagen.loaded {
          opacity: 1;
        }
        .detalle-imagen.zoomed {
          transform: scale(2.5);
          cursor: zoom-out;
        }

        /* Contador arriba a la derecha */
        .detalle-contador {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 3;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(10px);
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.4rem 0.9rem;
          border-radius: 20px;
          letter-spacing: 0.04em;
        }

        /* Botón zoom abajo a la derecha */
        .detalle-zoom-btn {
          position: absolute;
          bottom: 16px;
          right: 16px;
          z-index: 3;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(10px);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .detalle-zoom-btn:hover {
          background: rgba(0,0,0,0.75);
          transform: scale(1.1);
          border-color: rgba(255,255,255,0.6);
        }

        /* Estado sin imagen */
        .detalle-sin-imagen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 100%;
          color: #b8b0a4;
          gap: 0.75rem;
        }

        /* ═══════════════════════════════════════════
           THUMBNAILS LATERALES (DERECHA)
           ═══════════════════════════════════════════ */
        .detalle-thumbnails-col {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 80px;
          flex-shrink: 0;
          position: relative;
        }

        /* Botones de navegación vertical */
        .detalle-nav-vert {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 32px;
          border-radius: 10px;
          border: 1.5px solid #e5dfd7;
          background: white;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.25s ease;
          flex-shrink: 0;
        }
        .detalle-nav-vert:hover {
          background: #fef9f4;
          border-color: #c47d3e;
          color: #c47d3e;
        }
        .detalle-nav-vert:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          background: #f9f7f4;
        }

        /* Contenedor de thumbnails */
        .detalle-thumbs-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
          overflow: hidden;
        }

        .detalle-thumb {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          border: 2.5px solid transparent;
          opacity: 0.5;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          flex-shrink: 0;
          position: relative;
          background: #f5f2ed;
        }
        .detalle-thumb:hover {
          opacity: 0.85;
          transform: scale(1.05);
          border-color: #e5dfd7;
        }
        .detalle-thumb.active {
          opacity: 1;
          border-color: #c47d3e;
          box-shadow: 0 0 0 4px rgba(196,125,62,0.12);
        }
        .detalle-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* ── Información ── */
        .detalle-header {
          margin-bottom: 1.5rem;
        }
        .detalle-referencia {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.82rem;
          font-weight: 700;
          color: #c47d3e;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 0.4rem;
          background: #fef9f4;
          padding: 0.3rem 0.85rem;
          border-radius: 8px;
        }
        .detalle-item {
          font-size: 0.78rem;
          color: #b0a89c;
          font-weight: 500;
          margin-bottom: 0.75rem;
        }
        .detalle-nombre {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.7rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 0.75rem;
          line-height: 1.2;
        }
        .detalle-descripcion {
          color: #6b7280;
          line-height: 1.7;
          margin-bottom: 1.25rem;
          font-size: 0.9rem;
        }

        /* ── Especificaciones ── */
        .detalle-especificaciones {
          background: #faf8f5;
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 1.25rem;
          border: 1px solid #ede8df;
        }
        .detalle-especificaciones h3 {
          font-family: 'Playfair Display', serif;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 1rem;
          font-size: 1rem;
        }
        .detalle-grid-especs {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .detalle-espec-item {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
        }
        .detalle-espec-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c47d3e;
          flex-shrink: 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .detalle-espec-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: #9a8f84;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.15rem;
        }
        .detalle-espec-value {
          font-size: 0.88rem;
          font-weight: 600;
          color: #1a1a2e;
        }

        /* ── Colores ── */
        .detalle-colores h3 {
          font-family: 'Playfair Display', serif;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 0.75rem;
          font-size: 1rem;
        }
        .detalle-colores-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
        }
        .detalle-color-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #faf8f5;
          padding: 0.4rem 0.75rem 0.4rem 0.4rem;
          border-radius: 30px;
          border: 1px solid #ede8df;
          transition: all 0.25s ease;
        }
        .detalle-color-item:hover {
          border-color: #c47d3e;
          background: #fef9f4;
          transform: translateY(-1px);
        }
        .detalle-color-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.12);
          flex-shrink: 0;
        }
        .detalle-color-nombre {
          font-size: 0.78rem;
          font-weight: 500;
          color: #1a1a2e;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .detalle-galeria-wrapper {
            flex-direction: column;
            min-height: auto;
            max-height: none;
            gap: 12px;
          }
          .detalle-galeria {
            aspect-ratio: 1/1;
            min-height: 300px;
          }
          .detalle-thumbnails-col {
            flex-direction: row;
            width: 100%;
            height: 72px;
            overflow-x: auto;
            gap: 8px;
            padding-bottom: 4px;
          }
          .detalle-nav-vert {
            display: none;
          }
          .detalle-thumbs-list {
            flex-direction: row;
            overflow-x: auto;
            overflow-y: hidden;
          }
          .detalle-thumb {
            width: 64px;
            height: 64px;
            aspect-ratio: auto;
            flex-shrink: 0;
          }
          .detalle-nombre {
            font-size: 1.4rem;
          }
          .detalle-grid-especs {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="detalle-modal">
        {/* ═══════════════════════════════════════════
           GALERÍA + THUMBNAILS LATERALES
           ═══════════════════════════════════════════ */}
        <div className="detalle-galeria-wrapper">
          
          {/* ── Imagen principal ── */}
          <div 
            className="detalle-galeria"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setIsZoomed(false)}
          >
            {/* Skeleton */}
            {!imagenCargada && !imagenError && (
              <div className="detalle-skeleton" />
            )}
            
            {imagenActualUrl && !imagenError ? (
              <>
                <img 
                  ref={imageRef}
                  src={imagenActualUrl} 
                  alt={tela.nombre || 'Tela'}
                  onLoad={() => setImagenCargada(true)}
                  onError={() => setImagenError(true)}
                  onClick={toggleZoom}
                  className={`detalle-imagen ${imagenCargada ? 'loaded' : ''} ${isZoomed ? 'zoomed' : ''}`}
                  style={isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : {}}
                />
                
                {/* Contador */}
                {tieneMultiplesImagenes && (
                  <span className="detalle-contador">
                    {imagenActual + 1} / {todasLasImagenes.length}
                  </span>
                )}
                
                {/* Botón zoom */}
                <button 
                  className="detalle-zoom-btn"
                  onClick={toggleZoom}
                  aria-label={isZoomed ? 'Alejar' : 'Acercar'}
                >
                  <ZoomIn size={20} />
                </button>
              </>
            ) : (
              <div className="detalle-sin-imagen">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" opacity="0.2" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Imagen no disponible</span>
              </div>
            )}
          </div>
          
          {/* ── Thumbnails laterales (columna derecha) ── */}
          {tieneMultiplesImagenes && (
            <div className="detalle-thumbnails-col">
              {/* Botón arriba */}
              <button 
                className="detalle-nav-vert"
                onClick={anteriorImagen}
                disabled={imagenActual === 0}
                aria-label="Imagen anterior"
              >
                <ChevronUp size={18} />
              </button>
              
              {/* Lista de thumbnails */}
              <div className="detalle-thumbs-list">
                {visibleThumbs.map((img, idx) => {
                  const realIndex = startThumb + idx
                  return (
                    <div 
                      key={realIndex} 
                      className={`detalle-thumb ${realIndex === imagenActual ? 'active' : ''}`}
                      onClick={() => setImagenActual(realIndex)}
                    >
                      <img 
                        src={img.imagen_url} 
                        alt={`${tela.nombre} - ${realIndex + 1}`}
                        loading="lazy"
                      />
                    </div>
                  )
                })}
              </div>
              
              {/* Botón abajo */}
              <button 
                className="detalle-nav-vert"
                onClick={siguienteImagen}
                disabled={imagenActual === todasLasImagenes.length - 1}
                aria-label="Imagen siguiente"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          )}
        </div>
        
        {/* ═══════════════════════════════════════════
           INFORMACIÓN
           ═══════════════════════════════════════════ */}
        <div className="detalle-header">
          <div className="detalle-referencia">
            {tela.referencia || 'REF: N/A'}
          </div>
          {tela.item && (
            <p className="detalle-item">Item: {tela.item}</p>
          )}
          <h2 className="detalle-nombre">
            {tela.nombre || 'Sin nombre'}
          </h2>
          {tela.descripcion && (
            <p className="detalle-descripcion">
              {tela.descripcion}
            </p>
          )}
        </div>
        
        {/* ═══════════════════════════════════════════
           ESPECIFICACIONES
           ═══════════════════════════════════════════ */}
        <div className="detalle-especificaciones">
          <h3>Especificaciones Técnicas</h3>
          <div className="detalle-grid-especs">
            {tela.composicion && (
              <div className="detalle-espec-item">
                <div className="detalle-espec-icon">
                  <FlaskConical size={18} />
                </div>
                <div>
                  <div className="detalle-espec-label">Composición</div>
                  <div className="detalle-espec-value">{tela.composicion}</div>
                </div>
              </div>
            )}
            {tela.peso && (
              <div className="detalle-espec-item">
                <div className="detalle-espec-icon">
                  <Weight size={18} />
                </div>
                <div>
                  <div className="detalle-espec-label">Peso</div>
                  <div className="detalle-espec-value">
                    {typeof tela.peso === 'number' ? tela.peso.toFixed(2) : tela.peso} oz
                  </div>
                </div>
              </div>
            )}
            {tela.ancho && (
              <div className="detalle-espec-item">
                <div className="detalle-espec-icon">
                  <Ruler size={18} />
                </div>
                <div>
                  <div className="detalle-espec-label">Ancho</div>
                  <div className="detalle-espec-value">{tela.ancho} cm</div>
                </div>
              </div>
            )}
            {tela.espec_tec && (
              <div className="detalle-espec-item">
                <div className="detalle-espec-icon">
                  <FlaskConical size={18} />
                </div>
                <div>
                  <div className="detalle-espec-label">Espec. Técnica</div>
                  <div className="detalle-espec-value">{tela.espec_tec}</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* ═══════════════════════════════════════════
           COLORES
           ═══════════════════════════════════════════ */}
        {tela.tela_colores?.length > 0 && (
          <div className="detalle-colores">
            <h3>Colores disponibles ({tela.tela_colores.length})</h3>
            <div className="detalle-colores-grid">
              {tela.tela_colores.map(tc => (
                <div 
                  key={tc.colores.id} 
                  className="detalle-color-item"
                  title={tc.colores.nombre}
                >
                  <div 
                    className="detalle-color-circle"
                    style={{ background: tc.colores.codigo_hex }}
                  />
                  <span className="detalle-color-nombre">
                    {tc.colores.nombre}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}