"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const static_1 = __importDefault(require("@fastify/static"));
const formbody_1 = __importDefault(require("@fastify/formbody"));
// Legacy routes (live WhatsApp chatbot flow)
const webhook_1 = __importDefault(require("./routes/webhook"));
const viewer_1 = __importDefault(require("./routes/viewer"));
// AI Agency V3 routes
const whatsappV3_1 = __importDefault(require("./routes/whatsappV3"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
dotenv_1.default.config();
const server = (0, fastify_1.default)({ logger: true });
// Register plugins
server.register(formbody_1.default);
server.register(static_1.default, {
    root: path_1.default.join(__dirname, '../public'),
    prefix: '/public/',
});
// Register application routes
// Legacy routes (currently serving live WhatsApp users)
server.register(webhook_1.default);
server.register(viewer_1.default);
// AI Agency V3 routes
server.register(whatsappV3_1.default);
server.register(dashboard_1.default);
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const start = async () => {
    try {
        console.log('[Server Startup] Starting Gray Arc WhatsApp Website Builder server...');
        // Listening on 0.0.0.0 is required for ngrok and other tunnels to forward requests properly
        await server.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`[Server Startup] Server is online and listening at http://localhost:${PORT}`);
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
