import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, loadEnv, type Plugin } from 'vite'

// POST /api/card runs the Claude extraction on the dev and preview servers.
// The static build works without it: the app falls back to the offline extractor.
function cardApi(): Plugin {
  const handler = async (req: IncomingMessage, res: ServerResponse) => {
    const { claudeAvailable, extractWithClaude } = await import('./server/claude.ts')
    res.setHeader('Content-Type', 'application/json')
    if (req.method === 'GET') {
      res.end(JSON.stringify({ ai: claudeAvailable() }))
      return
    }
    if (!claudeAvailable()) {
      res.statusCode = 503
      res.end(JSON.stringify({ error: 'No Anthropic credentials on the server.' }))
      return
    }
    try {
      let body = ''
      for await (const chunk of req) body += chunk
      res.end(JSON.stringify(await extractWithClaude(JSON.parse(body))))
    } catch (e) {
      res.statusCode = 502
      res.end(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }))
    }
  }
  // Must return nothing: a function returned from configureServer would run as a post hook.
  const mount = (server: { middlewares: { use: (path: string, fn: typeof handler) => unknown } }) => {
    server.middlewares.use('/api/card', handler)
  }
  return { name: 'card-api', configureServer: mount, configurePreviewServer: mount }
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), 'ANTHROPIC_'))
  return {
    base: './',
    plugins: [react(), cardApi()],
  }
})
