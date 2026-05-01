import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    allowedHosts: [
      'shaggy-peaches-dance.loca.lt', // El dominio que te dio el error
      '.loca.lt'                      // Esto permite cualquier otro de localtunnel por si cambia
    ]
  }
})