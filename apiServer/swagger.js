// swagger.js
import swaggerAutogen from 'swagger-autogen';

const autogen = swaggerAutogen();

const doc = {
  info: {
    title: 'Logistics API',
    description: 'API documentation for the logistics backend',
  },
  host: `localhost:${process.env.PORT}`, 
  schemes: ['http'],
};

const outputFile = './swagger-output.json';
const routes = ['./server.js']; 

autogen(outputFile, routes, doc);