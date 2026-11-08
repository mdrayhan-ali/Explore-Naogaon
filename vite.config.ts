import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/** Local-only stand-in for api/downloads.ts so the counter can be tried with `npm run dev`. It resets when the dev server restarts. */
function devDownloadCounter(): Plugin {
  let count = 0
  return {
    name: 'dev-download-counter',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/downloads', (req, res) => {
        if (req.method === 'POST') count += 1
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-store')
        res.end(JSON.stringify({ count }))
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devDownloadCounter()],
})