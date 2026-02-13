"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const database_1 = require("../config/database");
const response_1 = require("../utils/response");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            (0, response_1.unauthorizedResponse)(res, 'Access token is required');
            return;
        }
        const token = authHeader.substring(7);
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        }
        catch (error) {
            (0, response_1.unauthorizedResponse)(res, 'Invalid or expired token');
            return;
        }
        const supabase = (0, database_1.getSupabaseClient)();
        const { data: user, error } = await supabase
            .from('profiles')
            .select('id, email, status')
            .eq('id', decoded.userId)
            .single();
        if (error || !user) {
            (0, response_1.unauthorizedResponse)(res, 'User not found');
            return;
        }
        if (user.status === 'banned') {
            (0, response_1.forbiddenResponse)(res, 'Account has been banned');
            return;
        }
        if (user.status === 'inactive') {
            (0, response_1.forbiddenResponse)(res, 'Account is inactive');
            return;
        }
        const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role:roles(code)')
            .eq('user_id', user.id);
        const roles = (userRoles || [])
            .map((ur) => ur.role?.code)
            .filter((code) => Boolean(code));
        req.user = {
            id: user.id,
            email: user.email,
            roles,
        };
        next();
    }
    catch (error) {
        (0, response_1.unauthorizedResponse)(res, 'Authentication failed');
    }
};
exports.authenticate = authenticate;
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            (0, response_1.unauthorizedResponse)(res, 'Authentication required');
            return;
        }
        const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
        if (!hasRole) {
            (0, response_1.forbiddenResponse)(res, 'Insufficient permissions');
            return;
        }
        next();
    };
};
exports.authorize = authorize;
const optionalAuth = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            next();
            return;
        }
        const token = authHeader.substring(7);
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            const supabase = (0, database_1.getSupabaseClient)();
            const { data: user } = await supabase
                .from('profiles')
                .select('id, email')
                .eq('id', decoded.userId)
                .single();
            if (user) {
                const { data: userRoles } = await supabase
                    .from('user_roles')
                    .select('role:roles(code)')
                    .eq('user_id', user.id);
                const roles = (userRoles || [])
                    .map((ur) => ur.role?.code)
                    .filter((code) => Boolean(code));
                req.user = {
                    id: user.id,
                    email: user.email,
                    roles,
                };
            }
        }
        catch {
            // Token invalid, but we continue without user
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
