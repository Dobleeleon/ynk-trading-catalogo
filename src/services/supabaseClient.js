import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY

// Cliente normal
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente admin
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// ─────────────────────────────────────────────
// USUARIOS
// ─────────────────────────────────────────────

export async function getAllUsers() {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error en getAllUsers:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Excepción en getAllUsers:', error)
    return []
  }
}

export async function createNewUser(email, password, fullName, role) {
  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    })

    if (authError) throw authError

    // Esperar a que el trigger cree el perfil
    await new Promise(resolve => setTimeout(resolve, 500))

    // Actualizar rol si es necesario
    if (authData.user && role && role !== 'user') {
      await supabaseAdmin
        .from('profiles')
        .update({ role })
        .eq('id', authData.user.id)
    }

    return { success: true, user: authData.user }
  } catch (error) {
    console.error('Error en createNewUser:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteUser(userId) {
  try {
    // Eliminar de auth (profiles se elimina automáticamente por ON DELETE CASCADE)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (authError) throw authError

    return { success: true }
  } catch (error) {
    console.error('Error en deleteUser:', error)
    return { success: false, error: error.message }
  }
}

export async function updateUser(userId, updates) {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: updates.full_name,
        role: updates.role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error en updateUser:', error)
    return { success: false, error: error.message }
  }
}

// ─────────────────────────────────────────────
// SITE SETTINGS
// ─────────────────────────────────────────────

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=85'

export async function getSiteSetting(key) {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle()

    if (error || !data) return DEFAULT_BANNER
    return data.value
  } catch {
    return DEFAULT_BANNER
  }
}

export async function getSiteSettings(keys) {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', keys)

    if (error || !data) return {}

    return data.reduce((acc, row) => {
      acc[row.key] = row.value
      return acc
    }, {})
  } catch {
    return {}
  }
}

export async function setSiteSetting(key, value) {
  try {
    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error en setSiteSetting:', error)
    return { success: false, error: error.message }
  }
}