import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Carga el perfil completo (incluyendo role) desde la tabla profiles
  const fetchProfile = async (authUser) => {
    if (!authUser) {
      setProfile(null)
      return
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()  // Cambiado a maybeSingle para evitar error si no existe

      if (error) {
        console.error('Error cargando perfil:', error)
        setProfile(null)
      } else if (data) {
        setProfile(data)
      } else {
        // Si no existe perfil, crearlo automáticamente
        console.log('Perfil no encontrado, creando...')
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
            role: authUser.email === 'elmer.9008@gmail.com' ? 'admin' : 'user',
            created_at: new Date().toISOString()
          })
          .select()
          .maybeSingle()
        
        if (insertError) {
          console.error('Error creando perfil:', insertError)
          setProfile(null)
        } else {
          setProfile(newProfile)
        }
      }
    } catch (err) {
      console.error('Excepción cargando perfil:', err)
      setProfile(null)
    }
  }

  useEffect(() => {
    // Sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      const authUser = session?.user ?? null
      setUser(authUser)
      fetchProfile(authUser).finally(() => setLoading(false))
    })

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user ?? null
      setUser(authUser)
      fetchProfile(authUser)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error en login:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      return { success: true }
    } catch (error) {
      console.error('Error en logout:', error)
      return { success: false, error: error.message }
    }
  }

  // Helpers de rol
  const isAdmin = profile?.role === 'admin'
  const isEditor = profile?.role === 'editor' || profile?.role === 'admin'
  const role = profile?.role || null

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      role,
      isAdmin,
      isEditor,
      loading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}