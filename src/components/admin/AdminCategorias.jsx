import React, { useState } from 'react'
import { Edit, Trash2 } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { categoriaService } from '../../services/api'
import toast from 'react-hot-toast'

export function AdminCategorias({ categorias, onCategoriaCreada, onCategoriaActualizada, onCategoriaEliminada }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [categoriaEditando, setCategoriaEditando] = useState(null)
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', icono: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (categoriaEditando) {
        await categoriaService.actualizar(categoriaEditando.id, formData)
        onCategoriaActualizada()
        toast.success('Categoría actualizada')
      } else {
        await categoriaService.crear(formData)
        onCategoriaCreada()
        toast.success('Categoría creada')
      }
      setModalOpen(false)
      setCategoriaEditando(null)
      setFormData({ nombre: '', descripcion: '', icono: '' })
    } catch (error) {
      toast.error('Error al guardar la categoría')
    }
  }

  const handleEliminar = async (categoria) => {
    if (confirm(`¿Eliminar categoría ${categoria.nombre}?`)) {
      await categoriaService.eliminar(categoria.id)
      onCategoriaEliminada()
      toast.success('Categoría eliminada')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-steel-blue">Categorías</h3>
        <button onClick={() => { setCategoriaEditando(null); setFormData({ nombre: '', descripcion: '', icono: '' }); setModalOpen(true) }} className="btn-primary text-sm">
          + Nueva Categoría
        </button>
      </div>
      <div className="space-y-2">
        {categorias.map(cat => (
          <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">{cat.nombre}</p>
              <p className="text-sm text-gray-500">{cat.descripcion}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setCategoriaEditando(cat); setFormData(cat); setModalOpen(true) }} className="text-blue-500">
                <Edit size={18} />
              </button>
              <button onClick={() => handleEliminar(cat)} className="text-red-500">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={categoriaEditando ? 'Editar Categoría' : 'Nueva Categoría'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows="2"
            />
          </div>
          <button type="submit" className="w-full btn-primary">{categoriaEditando ? 'Actualizar' : 'Crear'}</button>
        </form>
      </Modal>
    </div>
  )
}