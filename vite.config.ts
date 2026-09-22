import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'hanziDB.csv', 'vocabDB.csv'],
      manifest: {
        name: 'Mandarin Graded Reader',
        short_name: 'MandarinReader',
        description: 'Mandarin Graded Reader V2',
        theme_color: '#667eea',
        background_color: '#f5f7fa',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,csv}']
      }
    })
  ]
})
