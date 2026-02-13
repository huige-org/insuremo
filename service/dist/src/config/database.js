"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeSupabaseConnection = exports.getSupabaseClient = exports.createSupabaseClient = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("./env");
const logger_1 = require("./logger");
let supabaseClient = null;
const createSupabaseClient = () => {
    if (!supabaseClient) {
        supabaseClient = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
            db: {
                schema: "public",
            },
        });
        logger_1.logger.info("Supabase client initialized");
    }
    return supabaseClient;
};
exports.createSupabaseClient = createSupabaseClient;
const getSupabaseClient = () => {
    // 在Vercel环境下，每次请求都创建新的连接
    if (process.env.VERCEL) {
        return (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
            db: {
                schema: "public",
            },
        });
    }
    if (!supabaseClient) {
        return (0, exports.createSupabaseClient)();
    }
    return supabaseClient;
};
exports.getSupabaseClient = getSupabaseClient;
const closeSupabaseConnection = async () => {
    if (supabaseClient && !process.env.VERCEL) {
        supabaseClient = null;
        logger_1.logger.info("Supabase connection closed");
    }
};
exports.closeSupabaseConnection = closeSupabaseConnection;
