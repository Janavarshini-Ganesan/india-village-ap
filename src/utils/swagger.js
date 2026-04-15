const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'India Village API',
      version: '1.0.0',
      description: 'Complete REST API for India village-level geographical data',
    },
    servers: [
      { url: 'https://india-village-ap.vercel.app', description: 'Production' },
      { url: 'http://localhost:3000', description: 'Local' }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key'
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    paths: {
      '/api/v1/states': {
        get: {
          summary: 'List all states',
          security: [{ ApiKeyAuth: [] }],
          responses: {
            200: { description: 'List of all Indian states' },
            401: { description: 'Invalid API key' }
          }
        }
      },
      '/api/v1/districts': {
        get: {
          summary: 'Get districts by state',
          security: [{ ApiKeyAuth: [] }],
          parameters: [{ name: 'stateId', in: 'query', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'List of districts' } }
        }
      },
      '/api/v1/subdistricts': {
        get: {
          summary: 'Get sub-districts by district',
          security: [{ ApiKeyAuth: [] }],
          parameters: [{ name: 'districtId', in: 'query', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'List of sub-districts' } }
        }
      },
      '/api/v1/villages': {
        get: {
          summary: 'Get villages by sub-district',
          security: [{ ApiKeyAuth: [] }],
          parameters: [{ name: 'subDistrictId', in: 'query', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'List of villages' } }
        }
      },
      '/api/v1/villages/search': {
        get: {
          summary: 'Search villages by name',
          security: [{ ApiKeyAuth: [] }],
          parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2 } }],
          responses: { 200: { description: 'Matching villages with hierarchy' } }
        }
      },
      '/api/v1/autocomplete': {
        get: {
          summary: 'Typeahead autocomplete',
          security: [{ ApiKeyAuth: [] }],
          parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
            { name: 'hierarchyLevel', in: 'query', schema: { type: 'string', enum: ['village', 'district', 'state'] } }
          ],
          responses: { 200: { description: 'Autocomplete results in dropdown format' } }
        }
      },
      '/api/v1/hierarchy': {
        get: {
          summary: 'Get full address hierarchy for a village',
          security: [{ ApiKeyAuth: [] }],
          parameters: [{ name: 'villageId', in: 'query', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Full hierarchy with formatted address' } }
        }
      },
      '/api/auth/register': {
        post: {
          summary: 'Register a new B2B account',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Registration successful' } }
        }
      },
      '/api/auth/login': {
        post: {
          summary: 'Login and get JWT token',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string' },
                    password: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'JWT token returned' } }
        }
      }
    }
  },
  apis: []
}

const swaggerSpec = swaggerJsdoc(options)
module.exports = swaggerSpec