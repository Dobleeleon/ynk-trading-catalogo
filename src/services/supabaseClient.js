import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY

// ═══════════════════════════════════════════
// VALIDACIÓN DE VARIABLES DE ENTORNO
// ═══════════════════════════════════════════
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Faltan variables de entorno: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY son requeridas')
}

if (!supabaseServiceKey) {
  console.warn('⚠️ VITE_SUPABASE_SERVICE_KEY no configurada. Las operaciones de admin no funcionarán.')
}

// ═══════════════════════════════════════════
// CLIENTES SUPABASE
// ═══════════════════════════════════════════

// Cliente normal (para operaciones públicas)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  },
  global: {
    headers: {
      'X-Client-Info': 'ynk-trading-catalogo'
    }
  }
})

// Cliente admin (solo para operaciones con service key)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null

// ═══════════════════════════════════════════
// VALIDACIÓN DE INPUTS
// ═══════════════════════════════════════════

/**
 * Sanitiza un string para prevenir inyecciones básicas
 */
function sanitizeString(str) {
  if (!str || typeof str !== 'string') return ''
  return str
    .replace(/[<>]/g, '')      // Eliminar tags HTML
    .replace(/['"]/g, '')      // Eliminar comillas
    .trim()
    .substring(0, 5000)         // Limitar longitud máxima
}

/**
 * Valida un email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida que un ID sea un UUID válido
 */
function isValidUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

/**
 * Valida un rol contra los permitidos
 */
const VALID_ROLES = ['user', 'editor', 'admin']
function isValidRole(role) {
  return VALID_ROLES.includes(role)
}

// ═══════════════════════════════════════════
// RATE LIMITER SIMPLE
// ═══════════════════════════════════════════
const requestCounts = new Map()
const RATE_LIMIT_WINDOW = 60000 // 1 minuto
const RATE_LIMIT_MAX = 100      // Máximo de requests por minuto

/**
 * Verifica si se ha excedido el rate limit
 */
function checkRateLimit(key = 'global') {
  const now = Date.now()
  const record = requestCounts.get(key) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW }

  if (now > record.resetAt) {
    record.count = 0
    record.resetAt = now + RATE_LIMIT_WINDOW
  }

  record.count++
  requestCounts.set(key, record)

  if (record.count > RATE_LIMIT_MAX) {
    console.warn(`⚠️ Rate limit excedido para: ${key}`)
    return false
  }
  return true
}

// ═══════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════

let healthCheckInterval = null

export function startDatabaseHealthCheck(intervalMinutes = 60) {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval)
  }

  const intervalMs = intervalMinutes * 60 * 1000

  pingDatabase()

  healthCheckInterval = setInterval(() => {
    pingDatabase()
  }, intervalMs)

  console.log(`🩺 Health check: cada ${intervalMinutes} min`)
}

export function stopDatabaseHealthCheck() {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval)
    healthCheckInterval = null
    console.log('🩺 Health check detenido')
  }
}

async function pingDatabase() {
  try {
    const start = performance.now()
    const { error } = await supabase
      .from('site_settings')
      .select('key')
      .limit(1)

    const duration = Math.round(performance.now() - start)

    if (error) {
      console.warn(`⚠️ Health check falló (${duration}ms):`, error.message)
    } else {
      console.log(`✅ Health check OK (${duration}ms)`)
    }
  } catch (err) {
    console.warn('⚠️ Health check error:', err.message)
  }
}

// ═══════════════════════════════════════════
// USUARIOS (CON VALIDACIONES)
// ═══════════════════════════════════════════

export async function getAllUsers() {
  try {
    if (!checkRateLimit('getAllUsers')) {
      throw new Error('Demasiadas solicitudes. Intenta de nuevo en un minuto.')
    }

    const { data, error } = await supabaseAdmin
      ?.from('profiles')
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

export async function createNewUser(email, password, fullName, role = 'user') {
  try {
    if (!checkRateLimit('createNewUser')) {
      return { success: false, error: 'Demasiadas solicitudes.' }
    }

    if (!supabaseAdmin) {
      return { success: false, error: 'Cliente admin no configurado.' }
    }

    // Validar inputs
    if (!email || !isValidEmail(email)) {
      return { success: false, error: 'Email inválido.' }
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' }
    }
    if (!fullName || fullName.trim().length < 2) {
      return { success: false, error: 'El nombre debe tener al menos 2 caracteres.' }
    }
    if (!isValidRole(role)) {
      return { success: false, error: `Rol inválido. Permitidos: ${VALID_ROLES.join(', ')}` }
    }

    const sanitizedName = sanitizeString(fullName)

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true,
      user_metadata: { full_name: sanitizedName }
    })

    if (authError) throw authError

    await new Promise(resolve => setTimeout(resolve, 500))

    if (authData.user && role !== 'user') {
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
    if (!checkRateLimit('deleteUser')) {
      return { success: false, error: 'Demasiadas solicitudes.' }
    }

    if (!supabaseAdmin) {
      return { success: false, error: 'Cliente admin no configurado.' }
    }

    if (!userId || !isValidUUID(userId)) {
      return { success: false, error: 'ID de usuario inválido.' }
    }

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
    if (!checkRateLimit('updateUser')) {
      return { success: false, error: 'Demasiadas solicitudes.' }
    }

    if (!supabaseAdmin) {
      return { success: false, error: 'Cliente admin no configurado.' }
    }

    if (!userId || !isValidUUID(userId)) {
      return { success: false, error: 'ID de usuario inválido.' }
    }

    const sanitizedUpdates = {}
    
    if (updates.full_name) {
      sanitizedUpdates.full_name = sanitizeString(updates.full_name)
    }
    if (updates.role) {
      if (!isValidRole(updates.role)) {
        return { success: false, error: `Rol inválido.` }
      }
      sanitizedUpdates.role = updates.role
    }
    
    sanitizedUpdates.updated_at = new Date().toISOString()

    const { error } = await supabaseAdmin
      .from('profiles')
      .update(sanitizedUpdates)
      .eq('id', userId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error en updateUser:', error)
    return { success: false, error: error.message }
  }
}

// ═══════════════════════════════════════════
// SITE SETTINGS
// ═══════════════════════════════════════════

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=85'

// Caché en memoria para settings frecuentes
const settingsCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

export async function getSiteSetting(key) {
  try {
    // Verificar caché
    const cached = settingsCache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.value
    }

    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle()

    if (error || !data) return DEFAULT_BANNER

    // Guardar en caché
    settingsCache.set(key, { value: data.value, timestamp: Date.now() })
    
    return data.value
  } catch {
    return DEFAULT_BANNER
  }
}

export async function getSiteSettings(keys) {
  try {
    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return {}
    }

    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', keys)

    if (error || !data) return {}

    return data.reduce((acc, row) => {
      acc[row.key] = row.value
      // Actualizar caché
      settingsCache.set(row.key, { value: row.value, timestamp: Date.now() })
      return acc
    }, {})
  } catch {
    return {}
  }
}

export async function setSiteSetting(key, value) {
  try {
    if (!checkRateLimit('setSiteSetting')) {
      return { success: false, error: 'Demasiadas solicitudes.' }
    }

    if (!supabaseAdmin) {
      return { success: false, error: 'Cliente admin no configurado.' }
    }

    if (!key || typeof key !== 'string') {
      return { success: false, error: 'Key inválida.' }
    }

    // Sanitizar key
    const sanitizedKey = sanitizeString(key)
    const sanitizedValue = typeof value === 'string' ? sanitizeString(value) : value

    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert(
        { key: sanitizedKey, value: sanitizedValue, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )

    if (error) throw error

    // Invalidar caché para esta key
    settingsCache.delete(key)

    return { success: true }
  } catch (error) {
    console.error('Error en setSiteSetting:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Limpia toda la caché de settings
 */
export function clearSettingsCache() {
  settingsCache.clear()
  console.log('🧹 Caché de settings limpiada')
}