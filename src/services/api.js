import { supabase } from './supabaseClient'

export const categoriaService = {
  async obtenerTodas() {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre')
    if (error) throw error
    return data
  },

  async crear(categoria) {
    const { data, error } = await supabase
      .from('categorias')
      .insert([categoria])
      .select()
    if (error) throw error
    return data[0]
  },

  async actualizar(id, categoria) {
    const { data, error } = await supabase
      .from('categorias')
      .update(categoria)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async eliminar(id) {
    const { data, error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  }
}

export const colorService = {
  async obtenerTodos() {
    const { data, error } = await supabase
      .from('colores')
      .select('*')
      .order('nombre')
    if (error) throw error
    return data
  },

  async crear(color) {
    const { data, error } = await supabase
      .from('colores')
      .insert([color])
      .select()
    if (error) throw error
    return data[0]
  },

  async actualizar(id, color) {
    const { data, error } = await supabase
      .from('colores')
      .update(color)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async eliminar(id) {
    const { data, error } = await supabase
      .from('colores')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  }
}

export const telaService = {
  async obtenerTodas() {
    const { data, error } = await supabase
      .from('telas')
      .select(`
        *,
        categorias(id, nombre),
        imagenes_tela(id, imagen_url, es_principal, orden),
        tela_colores(
          colores(id, nombre, codigo_hex)
        )
      `)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async crear(tela) {
    const { data, error } = await supabase
      .from('telas')
      .insert([tela])
      .select()
    if (error) throw error
    return data[0]
  },

  async actualizar(id, tela) {
    const { data, error } = await supabase
      .from('telas')
      .update(tela)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async eliminar(id) {
    const { data, error } = await supabase
      .from('telas')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  },

  async subirImagen(archivo, carpeta = 'telas') {
    const nombreArchivo = `${Date.now()}_${archivo.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    const ruta = `${carpeta}/${nombreArchivo}`
    
    const { data, error } = await supabase.storage
      .from('imagenes')
      .upload(ruta, archivo, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from('imagenes')
      .getPublicUrl(ruta)
    
    return publicUrl
  },

  async agregarImagen(telaId, imagenUrl, esPrincipal = false, orden = 0) {
    const { data, error } = await supabase
      .from('imagenes_tela')
      .insert([{
        tela_id: telaId,
        imagen_url: imagenUrl,
        es_principal: esPrincipal,
        orden: orden
      }])
      .select()
    if (error) throw error
    return data[0]
  },

  async agregarColor(telaId, colorId) {
    const { data, error } = await supabase
      .from('tela_colores')
      .insert([{ tela_id: telaId, color_id: colorId }])
      .select()
    if (error) throw error
    return data[0]
  },

  async eliminarColoresTela(telaId) {
    const { error } = await supabase
      .from('tela_colores')
      .delete()
      .eq('tela_id', telaId)
    if (error) throw error
    return true
  },

  async eliminarImagen(imagenId) {
    if (!imagenId) {
      throw new Error('ID de imagen no válido')
    }
    
    // 1. Obtener la URL de la imagen para eliminarla del storage
    const { data: imagen, error: getError } = await supabase
      .from('imagenes_tela')
      .select('imagen_url')
      .eq('id', imagenId)
      .single()
    
    if (getError) {
      console.error('Error al obtener imagen:', getError)
      // Continuamos para intentar eliminar el registro aunque falle obtener la URL
    }
    
    // 2. Eliminar el registro de la base de datos
    const { error: deleteError } = await supabase
      .from('imagenes_tela')
      .delete()
      .eq('id', imagenId)
    
    if (deleteError) throw deleteError
    
    // 3. Intentar eliminar el archivo del storage (opcional, no crítico)
    if (imagen?.imagen_url) {
      try {
        // Extraer la ruta del storage desde la URL
        const urlParts = imagen.imagen_url.split('/')
        const filePath = urlParts.slice(urlParts.indexOf('imagenes') + 1).join('/')
        if (filePath) {
          await supabase.storage.from('imagenes').remove([filePath])
        }
      } catch (storageError) {
        console.warn('No se pudo eliminar del storage:', storageError)
      }
    }
    
    return true
  },

  async actualizarImagen(imagenId, esPrincipal) {
    if (!imagenId) {
      throw new Error('ID de imagen no válido')
    }
    
    const { error } = await supabase
      .from('imagenes_tela')
      .update({ es_principal: esPrincipal })
      .eq('id', imagenId)
    
    if (error) throw error
    return true
  }
}