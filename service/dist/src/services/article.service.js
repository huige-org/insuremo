"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.articleService = void 0;
const database_1 = require("../config/database");
const TABLE_NAME = 'articles';
exports.articleService = {
    async findAll(params = {}) {
        const supabase = (0, database_1.getSupabaseClient)();
        const { page = 1, pageSize = 10, keyword = '', status } = params;
        let query = supabase.from(TABLE_NAME).select('*', { count: 'exact' });
        if (keyword) {
            query = query.ilike('title', `%${keyword}%`);
        }
        if (status) {
            query = query.eq('status', status);
        }
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, to);
        if (error)
            throw error;
        const total = count || 0;
        const meta = {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        };
        return {
            list: data,
            meta,
        };
    },
    async findById(id) {
        const supabase = (0, database_1.getSupabaseClient)();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw error;
        return data;
    },
    async create(dto, authorId) {
        const supabase = (0, database_1.getSupabaseClient)();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert({
            ...dto,
            author_id: authorId,
            tags: dto.tags || [],
        })
            .select()
            .single();
        if (error)
            throw error;
        return data;
    },
    async update(id, dto) {
        const supabase = (0, database_1.getSupabaseClient)();
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(dto)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    },
    async delete(id) {
        const supabase = (0, database_1.getSupabaseClient)();
        const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);
        if (error)
            throw error;
    },
};
