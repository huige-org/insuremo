import express from "express";
import app from "./app";

// Create express server for Vercel
const server = express();
server.use(app);

// Export for Vercel
const handler = server;

export { handler as default, handler };
