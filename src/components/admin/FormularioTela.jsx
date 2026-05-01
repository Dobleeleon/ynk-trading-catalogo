import React, { useState, useEffect } from 'react'
import { Upload, Check, X, Trash2, Star } from 'lucide-react'
import { telaService } from '../../services/api'
import toast from 'react-hot-toast'

export function FormularioTela({ tela, categorias, colores, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: tela?.nombre || '',
    descripcion: tela?.descripcion || '',
    referencia: tela?.referencia || '',
    item: tela?.item || '',
    composicion: tela?.composicion || '',
    peso: tela?.peso || '',
    ancho: tela?.ancho || '',
    espec_tec: tela?.espec_tec || '',
    categoria_id: tela?.categoria_id || '',
    precio: tela?.precio || '',
    stock: tela?.stock || 0,
    colores: tela?.tela_colores?.map(tc => tc.colores.id) || [],
    imagenes: []
  })
  
  const [uploading, setUploading] = useState(false)
  const [imagenesExistentes, setImagenesExistentes] = useState([])
  const [imagenesNuevasPreview, setImagenesNuevasPreview] = useState([])
  const [imagenesNuevasUrls, setImagenesNuevasUrls] = useState([])
  const [eliminando, setEliminando] = useState(false)

  // Cargar imágenes existentes cuando se edita una tela
  useEffect(() => {
    if (tela?.imagenes_tela && tela.imagenes_tela.length > 0) {
      console.log('Imágenes cargadas:', tela.imagenes_tela)
      setImagenesExistentes(tela.imagenes_tela.map((img) => ({
        id: img.id,
        url: img.imagen_url,
        esPrincipal: img.es_principal
      })))
    }
  }, [tela])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleColorToggle = (colorId) => {
    if (formData.colores.includes(colorId)) {
      setFormData({ ...formData, colores: formData.colores.filter(c => c !== colorId) })
    } else {
      setFormData({ ...formData, colores: [...formData.colores, colorId] })
    }
  }

  const handleImagenes = async (e) => {
    const archivos = Array.from(e.target.files)
    if (archivos.length === 0) return
    
    setUploading(true)
    
    const nuevasPreviews = archivos.map(f => URL.createObjectURL(f))
    setImagenesNuevasPreview([...imagenesNuevasPreview, ...nuevasPreviews])
    
    const nuevasUrls = []
    for (const archivo of archivos) {
      try {
        const url = await telaService.subirImagen(archivo)
        nuevasUrls.push({ 
          url, 
          esPrincipal: imagenesExistentes.length === 0 && imagenesNuevasUrls.length === 0 && nuevasUrls.length === 0
        })
      } catch (error) {
        toast.error(`Error al subir ${archivo.name}`)
      }
    }
    
    setImagenesNuevasUrls([...imagenesNuevasUrls, ...nuevasUrls])
    setFormData({ 
      ...formData, 
      imagenes: [...formData.imagenes, ...nuevasUrls] 
    })
    setUploading(false)
    e.target.value = ''
  }

  // Eliminar imagen existente (de la base de datos)
  const eliminarImagenExistente = async (imagen) => {
    console.log('Imagen a eliminar:', imagen)
    
    // Verificar que la imagen tiene un ID válido
    if (!imagen || !imagen.id) {
      console.error('ID de imagen no válido:', imagen)
      toast.error('No se puede eliminar: ID de imagen no válido')
      return
    }
    
    if (!confirm('¿Eliminar esta imagen permanentemente?')) return
    
    setEliminando(true)
    try {
      console.log('Eliminando imagen con ID:', imagen.id)
      // Eliminar de la base de datos
      await telaService.eliminarImagen(imagen.id)
      
      // Eliminar de la lista local
      setImagenesExistentes(prev => prev.filter(img => img.id !== imagen.id))
      
      toast.success('Imagen eliminada correctamente')
    } catch (error) {
      console.error('Error al eliminar imagen:', error)
      toast.error('Error al eliminar la imagen')
    } finally {
      setEliminando(false)
    }
  }

  // Eliminar imagen nueva (aún no guardada)
  const eliminarImagenNueva = (index) => {
    const nuevasPreviews = [...imagenesNuevasPreview]
    nuevasPreviews.splice(index, 1)
    setImagenesNuevasPreview(nuevasPreviews)
    
    const nuevasUrls = [...imagenesNuevasUrls]
    nuevasUrls.splice(index, 1)
    setImagenesNuevasUrls(nuevasUrls)
    
    const nuevasImagenes = [...formData.imagenes]
    nuevasImagenes.splice(index, 1)
    setFormData({ ...formData, imagenes: nuevasImagenes })
    
    toast.success('Imagen eliminada de la lista')
  }

  const marcarComoPrincipal = (index, esExistente = false) => {
    if (esExistente) {
      // Marcar como principal en imágenes existentes
      const nuevasExistentes = imagenesExistentes.map((img, i) => ({
        ...img,
        esPrincipal: i === index
      }))
      setImagenesExistentes(nuevasExistentes)
    } else {
      // Marcar como principal en imágenes nuevas
      const nuevasUrls = imagenesNuevasUrls.map((img, i) => ({
        ...img,
        esPrincipal: i === index
      }))
      setImagenesNuevasUrls(nuevasUrls)
      setFormData({ ...formData, imagenes: nuevasUrls })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.nombre || !formData.categoria_id || !formData.precio) {
      toast.error('Por favor completa los campos obligatorios')
      return
    }
    
    try {
      let telaId = tela?.id
      
      const telaData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        referencia: formData.referencia,
        item: formData.item,
        composicion: formData.composicion,
        peso: formData.peso,
        ancho: formData.ancho,
        espec_tec: formData.espec_tec,
        categoria_id: formData.categoria_id,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock) || 0
      }
      
      if (!tela) {
        const nuevaTela = await telaService.crear(telaData)
        telaId = nuevaTela.id
      } else {
        await telaService.actualizar(tela.id, telaData)
        await telaService.eliminarColoresTela(tela.id)
      }
      
      // Subir nuevas imágenes
      for (const imagen of formData.imagenes) {
        await telaService.agregarImagen(telaId, imagen.url, imagen.esPrincipal)
      }
      
      // Actualizar imágenes existentes (cambiar principal si es necesario)
      for (const imagen of imagenesExistentes) {
        await telaService.actualizarImagen(imagen.id, imagen.esPrincipal)
      }
      
      for (const colorId of formData.colores) {
        await telaService.agregarColor(telaId, colorId)
      }
      
      toast.success(tela ? 'Tela actualizada' : 'Tela creada exitosamente')
      onSave()
    } catch (error) {
      console.error(error)
      toast.error('Error al guardar la tela')
    }
  }

  // Determinar la imagen principal para mostrar
  const imagenesPrincipales = [...imagenesExistentes, ...imagenesNuevasUrls]
  const tieneImagenPrincipal = imagenesPrincipales.some(img => img.esPrincipal)
  const tieneImagenes = imagenesExistentes.length > 0 || imagenesNuevasUrls.length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la tela *</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
          <input type="text" name="referencia" value={formData.referencia} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Ej: DYS25-508" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
          <input type="text" name="item" value={formData.item} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Ej: 10023" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Composición</label>
          <input type="text" name="composicion" value={formData.composicion} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Ej: 65%R / 31%N / 4%SP" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Peso</label>
          <input type="text" name="peso" value={formData.peso} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Ej: 370 G/M²" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ancho</label>
          <input type="text" name="ancho" value={formData.ancho} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Ej: 160 CM" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Espec. Técnica</label>
          <input type="text" name="espec_tec" value={formData.espec_tec} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Ej: 40SR(+)70/40" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3" className="w-full px-3 py-2 border rounded-lg" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
          <select name="categoria_id" value={formData.categoria_id} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg">
            <option value="">Seleccionar</option>
            {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
          <input type="number" name="precio" value={formData.precio} onChange={handleChange} required step="0.01" className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
          <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Colores disponibles</label>
        <div className="flex flex-wrap gap-2">
          {colores.map(color => (
            <button
              key={color.id}
              type="button"
              onClick={() => handleColorToggle(color.id)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${formData.colores.includes(color.id) ? 'border-[#c47d3e] scale-110' : 'border-gray-300'}`}
              style={{ backgroundColor: color.codigo_hex }}
              title={color.nombre}
            >
              {formData.colores.includes(color.id) && <Check size={12} className="mx-auto text-white" />}
            </button>
          ))}
        </div>
      </div>

      {/* Imágenes existentes */}
      {imagenesExistentes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes actuales</label>
          <div className="grid grid-cols-4 gap-2">
            {imagenesExistentes.map((img, idx) => (
              <div key={img.id} className="relative group">
                <img src={img.url} alt="Preview" className="w-full h-24 object-cover rounded-lg" />
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                  <button 
                    type="button" 
                    onClick={() => marcarComoPrincipal(idx, true)} 
                    className="p-1 bg-yellow-500 rounded hover:bg-yellow-600 transition" 
                    title="Marcar como principal"
                  >
                    <Star size={14} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => eliminarImagenExistente(img)} 
                    className="p-1 bg-red-500 rounded hover:bg-red-600 transition" 
                    title="Eliminar"
                    disabled={eliminando}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {img.esPrincipal && <span className="absolute top-1 left-1 text-xs bg-[#c47d3e] text-white px-1 rounded">Principal</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subir nuevas imágenes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Agregar nuevas imágenes</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-[#c47d3e] transition" onClick={() => document.getElementById('imagenesInput').click()}>
          <Upload size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Haz clic para subir imágenes</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WEBP (Máx 5MB)</p>
          <input id="imagenesInput" type="file" multiple accept="image/*" onChange={handleImagenes} className="hidden" />
        </div>
        
        {uploading && <p className="text-sm text-[#c47d3e] mt-2">Subiendo imágenes...</p>}
        
        {imagenesNuevasPreview.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Nuevas imágenes</label>
            <div className="grid grid-cols-4 gap-2">
              {imagenesNuevasPreview.map((preview, idx) => (
                <div key={idx} className="relative group">
                  <img src={preview} alt="Preview" className="w-full h-24 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    <button 
                      type="button" 
                      onClick={() => marcarComoPrincipal(idx, false)} 
                      className="p-1 bg-yellow-500 rounded hover:bg-yellow-600 transition" 
                      title="Marcar como principal"
                    >
                      <Star size={14} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => eliminarImagenNueva(idx)} 
                      className="p-1 bg-red-500 rounded hover:bg-red-600 transition" 
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {imagenesNuevasUrls[idx]?.esPrincipal && !tieneImagenPrincipal && 
                    <span className="absolute top-1 left-1 text-xs bg-[#c47d3e] text-white px-1 rounded">Principal</span>
                  }
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Indicador de imagen principal */}
      {tieneImagenes && !tieneImagenPrincipal && (
        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
          ⚠️ No hay imagen principal seleccionada. Marca una imagen como principal para que aparezca en el catálogo.
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button type="submit" className="flex-1 bg-[#1a2332] text-white py-2 rounded-lg hover:bg-[#c47d3e] transition" disabled={uploading || eliminando}>
          {tela ? 'Actualizar' : 'Crear'} Tela
        </button>
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
          Cancelar
        </button>
      </div>
    </form>
  )
}