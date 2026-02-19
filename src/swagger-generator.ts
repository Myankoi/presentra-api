import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        title: 'Presentra API',
        description: 'API Documentation for Presentra School Attendance System',
    },
    host: 'localhost:3000',
    schemes: ['http'],
    securityDefinitions: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
        }
    }
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/index.ts'];

/* NOTE: If you are using the express Router, you must pass in the 
   'endpointsFiles' only the root file where the route starts,
   such as index.js, app.js, routes.js, ... */

swaggerAutogen()(outputFile, endpointsFiles, doc);
