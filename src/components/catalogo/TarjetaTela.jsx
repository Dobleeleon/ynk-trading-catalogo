import React from 'react'

export function TarjetaTela({ tela, onClick }) {
  const imagenPrincipal = tela.imagenes_tela?.find(img => img.es_principal) || tela.imagenes_tela?.[0]
  
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
      {/* Imagen */}
      <div style={{ 
        position: 'relative',
        height: '240px', 
        overflow: 'hidden',
        background: '#f5f5f0'
      }}>
        {imagenPrincipal ? (
          <img 
            src={imagenPrincipal.imagen_url} 
            alt={tela.nombre}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              transition: 'transform 0.5s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
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
            fontWeight: '600'
          }}>
            Destacado
          </span>
        )}
      </div>
      
      {/* Contenido */}
      <div style={{ padding: '1rem' }}>
        <div style={{ 
          fontSize: '0.7rem', 
          color: '#9a8f84', 
          marginBottom: '0.25rem',
          letterSpacing: '0.05em'
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
      </div>
    </div>
  )
}