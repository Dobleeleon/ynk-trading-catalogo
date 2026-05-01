import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Navbar } from './components/layout/Navbar'
import { Home } from './pages/Home'
import { Catalogo } from './pages/Catalogo'
import { AdminPanel } from './pages/AdminPanel'
import { Login } from './pages/Login'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main style={{ paddingTop: '70px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1a2332', color: '#fff', borderRadius: '12px' } }} />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App