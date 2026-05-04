import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Navbar } from './components/layout/Navbar'  // Ruta corregida
import { Home } from './pages/Home'
import { Catalogo } from './pages/Catalogo'
import { AdminPanel } from './pages/AdminPanel'
import { Login } from './pages/Login'
import { Contacto } from './pages/Contacto'

function App() {
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