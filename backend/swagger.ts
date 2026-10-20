import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CMC-Global Api',
            version: '1.0.0',

        },
        tags: [
            {
                name: 'Auth',
                description: 'Authentication routes',
            },
            
        ],
        servers: [
            {
                url: '/api/',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT', // optional, just for display
                },
            },
        },
        security: [
            {
                bearerAuth: [], // apply globally
            },
        ],

    },
    apis: ['./swaggerDoc.ts'], // adjust path to match your routes
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
    app.use('/api/documentation', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'CMC-Global API',
        customfavIcon: '/files/favicon.png',
        swaggerOptions: {
            docExpansion: 'list',
            defaultModelsExpandDepth: -1,
            displayRequestDuration: true,
            persistAuthorization: true,
        }

    }));
}