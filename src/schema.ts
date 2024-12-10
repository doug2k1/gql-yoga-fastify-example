import { FastifyReply, FastifyRequest } from 'fastify'
import { createSchema } from 'graphql-yoga'

export const schema = createSchema<{
  req: FastifyRequest
  reply: FastifyReply
}>({
  typeDefs: /* GraphQL */ `
    type Query {
      hello: String
    }
  `,
  resolvers: {
    Query: {
      hello: () => 'world',
    },
  },
})
