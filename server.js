const fastify = require('fastify')({ logger: { level: 'error' } })
const Next = require('next')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'

function fastifyNext(fastify, opts, next) {
  const app = Next({ dev })
  app.prepare().then(() => {
    if (dev) {
      fastify.get('/_next/*', (req, reply) => {
        return app.handleRequest(req.req, reply.res).then(() => {
          reply.sent = true
        })
      })
    }

    fastify.get('/*', (req, reply) => {
      return app.handleRequest(req.req, reply.res).then(() => {
        reply.sent = true
      })
    })

    fastify.setNotFoundHandler((req, reply) => {
      return app.render404(req.req, reply.res).then(() => {
        reply.sent = true
      })
    })

    next()
  })
}

fastify.register(fastifyNext)
fastify.listen(port, err => {
  if (err) throw err
  console.log(`> Server listenging on http://localhost:${port}`)
})
