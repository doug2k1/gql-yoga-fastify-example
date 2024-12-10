import fastify, { FastifyReply, FastifyRequest } from 'fastify'
import { createYoga } from 'graphql-yoga'
import { schema } from './schema'

const app = fastify({ logger: true })

const yoga = createYoga<{
  req: FastifyRequest
  reply: FastifyReply
}>({
  schema,
  // Integrate Fastify logger
  logging: {
    debug: (...args) => args.forEach((arg) => app.log.debug(arg)),
    info: (...args) => args.forEach((arg) => app.log.info(arg)),
    warn: (...args) => args.forEach((arg) => app.log.warn(arg)),
    error: (...args) => args.forEach((arg) => app.log.error(arg)),
  },
})

/**
 * We pass the incoming HTTP request to GraphQL Yoga
 * and handle the response using Fastify's `reply` API
 * Learn more about `reply` https://www.fastify.io/docs/latest/Reply/
 **/
app.route({
  // Bind to the Yoga's endpoint to avoid rendering on any path
  url: yoga.graphqlEndpoint,
  method: ['GET', 'POST', 'OPTIONS'],
  handler: async (req, reply) => {
    // Second parameter adds Fastify's `req` and `reply` to the GraphQL Context
    const response = await yoga.handleNodeRequestAndResponse(req, reply, {
      req,
      reply,
    })

    response.headers.forEach((value, key) => {
      reply.header(key, value)
    })

    reply.status(response.status)
    reply.send(response.body)

    return reply
  },
})

// This will allow Fastify to forward multipart requests to GraphQL Yoga
app.addContentTypeParser('multipart/form-data', {}, (req, payload, done) =>
  done(null)
)

app.listen({ port: 4000 }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})
