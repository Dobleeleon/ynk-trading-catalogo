import React, { useState } from 'react'
import { Filter } from 'lucide-react'

export function Filtros({ categorias, colores, filtros, onFiltroChange }) {
  const [showFilters, setShowFilters] = useState(false)
  
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="w-full md:hidden flex items-center justify-between text-steel-blue font-semibold"
      >
        <span>Filtros</span>
        <Filter size={20} />
      </button>
      
      <div className={`${showFilters ? 'block' : 'hidden'} md:block mt-4 md:mt-0`}>
        <div className="mb-4">
          <h4 className="font-semibold text-steel-blue mb-2">Categorías</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="categoria"
                checked={filtros.categoriaId === 'todos'}
                onChange={() => onFiltroChange('categoriaId', 'todos')}
                className="text-carrot-orange"
              />
              <span className="text-sm">Todos</span>
            </label>
            {categorias.map(cat => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="categoria"
                  checked={filtros.categoriaId === cat.id}
                  onChange={() => onFiltroChange('categoriaId', cat.id)}
                  className="text-carrot-orange"
                />
                <span className="text-sm">{cat.nombre}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="font-semibold text-steel-blue mb-2">Colores</h4>
          <div className="flex flex-wrap gap-2">
            {colores.map(color => (
              <button
                key={color.id}
                onClick={() => onFiltroChange('colorId', color.id === filtros.colorId ? null : color.id)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  filtros.colorId === color.id ? 'border-carrot-orange scale-110' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color.codigo_hex }}
                title={color.nombre}
              />
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-steel-blue mb-2">Precio</h4>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filtros.precioMin || ''}
              onChange={(e) => onFiltroChange('precioMin', e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              value={filtros.precioMax || ''}
              onChange={(e) => onFiltroChange('precioMax', e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}