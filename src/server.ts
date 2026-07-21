import fastify from 'fastify';
import dotenv from 'dotenv';
import path from 'path';
import fastifyStatic from '@fastify/static';
import formbody from '@fastify/formbody';
// Legacy routes (live WhatsApp chatbot flow)
import webhookRoutes from './routes/webhook';
import viewerRoutes from './routes/viewer';
// AI Agency V3 routes
import whatsappV3Routes from './routes/whatsappV3';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

const server = fastify({ logger: true });

// Register plugins
server.register(formbody);
server.register(fastifyStatic, {
  root: path.join(__dirname, '../public'),
  prefix: '/public/',
});

// Register application routes
// Legacy routes (currently serving live WhatsApp users)
server.register(webhookRoutes);
server.register(viewerRoutes);
// AI Agency V3 routes
server.register(whatsappV3Routes);
server.register(dashboardRoutes);

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const start = async () => {
  try {
    console.log('[Server Startup] Starting Gray Arc WhatsApp Website Builder server...');
    // Listening on 0.0.0.0 is required for ngrok and other tunnels to forward requests properly
    await server.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`[Server Startup] Server is online and listening at http://localhost:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
