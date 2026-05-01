import React, { useState } from 'react'
import { Edit, Trash2 } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { colorService } from '../../services/api'
import toast from 'react-hot-toast'

export function AdminColores({ colores, onColorCreado, onColorActualizado, onColorEliminado }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [colorEditando, setColorEditando] = useState(null)
  const [formData, setFormData] = useState({ nombre: '', codigo_hex: '#000000' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (colorEditando) {
        await colorService.actualizar(colorEditando.id, formData)
        onColorActualizado()
        toast.success('Color actualizado')
      } else {
        await colorService.crear(formData)
        onColorCreado()
        toast.success('Color creado')
      }
      setModalOpen(false)
      setColorEditando(null)
      setFormData({ nombre: '', codigo_hex: '#000000' })
    } catch (error) {
      toast.error('Error al guardar el color')
    }
  }

  const handleEliminar = async (color) => {
    if (confirm(`¿Eliminar ${color.nombre}?`)) {
      await colorService.eliminar(color.id)
      onColorEliminado()
      toast.success('Color eliminado')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-steel-blue">Colores</h3>
        <button onClick={() => { setColorEditando(null); setFormData({ nombre: '', codigo_hex: '#000000' }); setModalOpen(true) }} className="btn-primary text-sm">
          + Nuevo Color
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {colores.map(color => (
          <div key={color.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: color.codigo_hex }} />
              <span className="text-sm">{color.nombre}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setColorEditando(color); setFormData(color); setModalOpen(true) }} className="text-blue-500 hover:text-blue-700">
                <Edit size={14} />
              </button>
              <button onClick={() => handleEliminar(color)} className="text-red-500 hover:text-red-700">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={colorEditando ? 'Editar Color' : 'Nuevo Color'}>
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
            <label className="block text-sm font-medium mb-1">Código HEX</label>
            <input
              type="color"
              value={formData.codigo_hex}
              onChange={(e) => setFormData({ ...formData, codigo_hex: e.target.value })}
              className="w-full h-10 rounded-lg"
            />
          </div>
          <button type="submit" className="w-full btn-primary">{colorEditando ? 'Actualizar' : 'Crear'}</button>
        </form>
      </Modal>
    </div>
  )
}