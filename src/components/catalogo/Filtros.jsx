import React, { useState } from 'react'
import { Filter, X, Weight, Tag, Palette } from 'lucide-react'

export function Filtros({ categorias, colores, filtros, onFiltroChange, onLimpiarFiltros }) {
  const [showFilters, setShowFilters] = useState(false)
  
  // Opciones de peso
  const opcionesPeso = [
    { label: 'Todos', value: 'todos' },
    { label: 'Menos de 10 oz', value: '0-10' },
    { label: '10 - 11 oz', value: '10-11' },
    { label: '11 - 12 oz', value: '11-12' },
    { label: '12 - 13 oz', value: '12-13' },
    { label: 'Más de 13 oz', value: '13+' }
  ]
  
  const filtrosActivos = filtros.categoriaId !== 'todos' || 
                         filtros.colorId || 
                         (filtros.pesoRange && filtros.pesoRange !== 'todos')
  
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      {/* Botón móvil */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="w-full md:hidden flex items-center justify-between text-[#1a2332] font-semibold py-2"
      >
        <span className="flex items-center gap-2">
          <Filter size={20} />
          Filtros
          {filtrosActivos && (
            <span className="bg-[#c47d3e] text-white text-xs rounded-full px-2 py-0.5">
              Activos
            </span>
          )}
        </span>
        <svg className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Panel de filtros */}
      <div className={`${showFilters ? 'block' : 'hidden'} md:block mt-4 md:mt-0 space-y-6`}>
        
        {/* Cabecera con limpiar filtros */}
        {filtrosActivos && (
          <div className="flex justify-end">
            <button
              onClick={onLimpiarFiltros}
              className="text-sm text-[#c47d3e] hover:text-[#a0642e] flex items-center gap-1 transition-colors"
            >
              <X size={14} />
              Limpiar filtros
            </button>
          </div>
        )}
        
        {/* Filtro por Categoría */}
        <div>
          <h4 className="font-semibold text-[#1a2332] mb-3 flex items-center gap-2">
            <Tag size={16} className="text-[#c47d3e]" />
            Categorías
          </h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="categoria"
                checked={filtros.categoriaId === 'todos'}
                onChange={() => onFiltroChange('categoriaId', 'todos')}
                className="w-4 h-4 text-[#c47d3e] focus:ring-[#c47d3e] focus:ring-offset-0"
              />
              <span className={`text-sm ${filtros.categoriaId === 'todos' ? 'text-[#c47d3e] font-medium' : 'text-[#6b7280]'}`}>
                Todas las categorías
              </span>
            </label>
            {categorias.map(cat => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="categoria"
                  checked={filtros.categoriaId === cat.id}
                  onChange={() => onFiltroChange('categoriaId', cat.id)}
                  className="w-4 h-4 text-[#c47d3e] focus:ring-[#c47d3e] focus:ring-offset-0"
                />
                <span className={`text-sm ${filtros.categoriaId === cat.id ? 'text-[#c47d3e] font-medium' : 'text-[#6b7280]'}`}>
                  {cat.nombre}
                </span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Filtro por Color */}
        <div>
          <h4 className="font-semibold text-[#1a2332] mb-3 flex items-center gap-2">
            <Palette size={16} className="text-[#c47d3e]" />
            Colores
          </h4>
          <div className="flex flex-wrap gap-2">
            {colores.map(color => (
              <button
                key={color.id}
                onClick={() => onFiltroChange('colorId', color.id === filtros.colorId ? null : color.id)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  filtros.colorId === color.id ? 'border-[#c47d3e] scale-110 shadow-md' : 'border-white shadow-sm'
                }`}
                style={{ backgroundColor: color.codigo_hex }}
                title={color.nombre}
              />
            ))}
          </div>
        </div>
        
        {/* Filtro por Peso */}
        <div>
          <h4 className="font-semibold text-[#1a2332] mb-3 flex items-center gap-2">
            <Weight size={16} className="text-[#c47d3e]" />
            Peso (oz)
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {opcionesPeso.map(opcion => (
              <button
                key={opcion.value}
                onClick={() => onFiltroChange('pesoRange', opcion.value)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  filtros.pesoRange === opcion.value
                    ? 'bg-[#c47d3e] text-white'
                    : 'bg-gray-100 text-[#6b7280] hover:bg-gray-200'
                }`}
              >
                {opcion.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Indicador de filtros activos */}
        {filtrosActivos && (
          <div className="pt-4 border-t border-[#e5dfd7]">
            <p className="text-xs text-[#9a8f84] text-center">
              Filtros activos aplicados
            </p>
          </div>
        )}
      </div>
    </div>
  )
}