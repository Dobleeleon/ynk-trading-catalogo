import React, { useState } from 'react'
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
  const [imagenesPreview, setImagenesPreview] = useState([])
  const [imagenesUrls, setImagenesUrls] = useState([])

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
    setImagenesPreview([...imagenesPreview, ...nuevasPreviews])
    
    const nuevasUrls = []
    for (const archivo of archivos) {
      try {
        const url = await telaService.subirImagen(archivo)
        nuevasUrls.push({ 
          url, 
          esPrincipal: imagenesUrls.length === 0 && nuevasUrls.length === 0 
        })
      } catch (error) {
        toast.error(`Error al subir ${archivo.name}`)
      }
    }
    
    setImagenesUrls([...imagenesUrls, ...nuevasUrls])
    setFormData({ 
      ...formData, 
      imagenes: [...formData.imagenes, ...nuevasUrls] 
    })
    setUploading(false)
    e.target.value = ''
  }

  const eliminarImagen = (index) => {
    const nuevasPreviews = [...imagenesPreview]
    nuevasPreviews.splice(index, 1)
    setImagenesPreview(nuevasPreviews)
    
    const nuevasUrls = [...imagenesUrls]
    nuevasUrls.splice(index, 1)
    setImagenesUrls(nuevasUrls)
    
    const nuevasImagenes = [...formData.imagenes]
    nuevasImagenes.splice(index, 1)
    setFormData({ ...formData, imagenes: nuevasImagenes })
  }

  const marcarComoPrincipal = (index) => {
    const nuevasUrls = imagenesUrls.map((img, i) => ({
      ...img,
      esPrincipal: i === index
    }))
    setImagenesUrls(nuevasUrls)
    setFormData({ ...formData, imagenes: nuevasUrls })
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
      
      for (const imagen of formData.imagenes) {
        await telaService.agregarImagen(telaId, imagen.url, imagen.esPrincipal)
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
              className={`w-8 h-8 rounded-full border-2 transition-all ${formData.colores.includes(color.id) ? 'border-carrot-orange scale-110' : 'border-gray-300'}`}
              style={{ backgroundColor: color.codigo_hex }}
              title={color.nombre}
            >
              {formData.colores.includes(color.id) && <Check size={12} className="mx-auto text-white" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-carrot-orange" onClick={() => document.getElementById('imagenesInput').click()}>
          <Upload size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Haz clic o arrastra imágenes aquí</p>
          <input id="imagenesInput" type="file" multiple accept="image/*" onChange={handleImagenes} className="hidden" />
        </div>
        
        {uploading && <p className="text-sm text-carrot-orange mt-2">Subiendo imágenes...</p>}
        
        {imagenesPreview.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {imagenesPreview.map((preview, idx) => (
              <div key={idx} className="relative group">
                <img src={preview} alt="Preview" className="w-full h-24 object-cover rounded-lg" />
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2">
                  <button type="button" onClick={() => marcarComoPrincipal(idx)} className="p-1 bg-yellow-500 rounded" title="Principal">
                    <Star size={14} />
                  </button>
                  <button type="button" onClick={() => eliminarImagen(idx)} className="p-1 bg-red-500 rounded" title="Eliminar">
                    <Trash2 size={14} />
                  </button>
                </div>
                {imagenesUrls[idx]?.esPrincipal && <span className="absolute top-1 left-1 text-xs bg-carrot-orange text-white px-1 rounded">Principal</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button type="submit" className="flex-1 btn-primary">{tela ? 'Actualizar' : 'Crear'} Tela</button>
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
      </div>
    </form>
  )
}