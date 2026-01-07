import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'GEMINI_API_KEY', 'WEATHER_API_KEY', 'GOOGLE_MAPS_API_KEY'],
})
