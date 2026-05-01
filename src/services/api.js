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
    const { error } = await supabase
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
    const { error } = await supabase
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
        categorias(nombre),
        imagenes_tela(imagen_url, es_principal, orden),
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
    const { error } = await supabase
      .from('telas')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  },

  async subirImagen(archivo, carpeta = 'telas') {
    const nombreArchivo = `${Date.now()}_${archivo.name}`
    const ruta = `${carpeta}/${nombreArchivo}`
    
    const { data, error } = await supabase.storage
      .from('imagenes')
      .upload(ruta, archivo)
    
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
  }
}