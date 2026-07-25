import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import url from 'url'
import handler from './api/audit'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'api-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const parsedUrl = url.parse(req.url || '', true)
          if (parsedUrl.pathname === '/api/audit') {
            const query = parsedUrl.query
            const mockReq = {
              query,
              method: req.method,
              headers: req.headers,
            }
            const mockRes = {
              status(statusCode: number) {
                res.statusCode = statusCode
                return this
              },
              json(data: any) {
                res.setHeader('Content-Type', 'application/json')
                res.setHeader('Access-Control-Allow-Origin', '*')
                res.end(JSON.stringify(data))
                return this
              },
              setHeader(name: string, value: string) {
                res.setHeader(name, value)
                return this
              },
              send(data: any) {
                res.end(data)
                return this
              }
            }
            try {
              await handler(mockReq as any, mockRes as any)
            } catch (err: any) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }))
            }
          } else {
            next()
          }
        })
      }
    }
  ],
})

