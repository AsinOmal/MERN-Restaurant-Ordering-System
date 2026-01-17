const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FoodFlow Restaurant Ordering API',
      version: '1.0.0',
      description: 'REST API for FoodFlow restaurant ordering system with real-time features',
      contact: {
        name: 'API Support',
        email: 'support@foodflow.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:5001/api',
        description: 'Development server',
      },
      {
        url: 'https://api.foodflow.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
            role: {
              type: 'string',
              enum: ['customer', 'staff', 'owner', 'admin'],
              description: 'User role',
            },
          },
        },
        Restaurant: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            cuisineTypes: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            rating: {
              type: 'number',
              minimum: 0,
              maximum: 5,
            },
          },
        },
        MenuItem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            restaurant: {
              type: 'string',
              description: 'Restaurant ID',
            },
            name: {
              type: 'string',
            },
            price: {
              type: 'number',
              minimum: 0,
            },
            category: {
              type: 'string',
            },
            available: {
              type: 'boolean',
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            customer: {
              type: 'string',
            },
            restaurant: {
              type: 'string',
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  menuItem: {
                    type: 'string',
                  },
                  quantity: {
                    type: 'integer',
                    minimum: 1,
                  },
                },
              },
            },
            totalAmount: {
              type: 'number',
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'],
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to API routes for annotations
};

module.exports = swaggerJsdoc(options);
