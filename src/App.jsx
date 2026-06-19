import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Navbar } from './components/layout/Navbar'
import { Home } from './pages/Home'
import { Catalogo } from './pages/Catalogo'
import { AdminPanel } from './pages/AdminPanel'
import { Login } from './pages/Login'
import { Contacto } from './pages/Contacto'
import { startDatabaseHealthCheck, stopDatabaseHealthCheck } from './services/supabaseClient'

function App() {
  useEffect(() => {
    // Iniciar health check cada 60 minutos (1 hora)
    // Cambia el número para ajustar la frecuencia:
    // 60 = 1 hora, 120 = 2 horas, 1440 = 24 horas (1 día)
    startDatabaseHealthCheck(60)

    // Limpiar al desmontar
    return () => {
      stopDatabaseHealthCheck()
    }
  }, [])

  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <main style={{ paddingTop: '70px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a2332',
              color: '#fff',
              fontFamily: "'DM Sans', sans-serif",
              borderRadius: '12px',
            },
          }}
        />
      </AuthProvider>
    </Router>
  )
}

export default App