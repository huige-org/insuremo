"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.default = void 0;
const express_1 = __importDefault(require("express"));
const app_1 = __importDefault(require("./app"));
// Create express server for Vercel
const server = (0, express_1.default)();
server.use(app_1.default);
// Export for Vercel
const handler = server;
exports.default = handler;
exports.handler = handler;
