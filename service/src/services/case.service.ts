import { getSupabaseClient } from '../config/database';
import { Case, CreateCaseDTO, UpdateCaseDTO } from '../models/case.types';
import { PaginationMeta } from '../models/common.types';

const TABLE_NAME = 'cases';

export const caseService = {
  async findAll(params: { page?: number; pageSize?: number; keyword?: string; status?: string } = {}) {
    const supabase = getSupabaseClient();
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

    if (error) throw error;

    const total = count || 0;
    const meta: PaginationMeta = {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };

    return {
      list: data as Case[],
      meta,
    };
  },

  async findById(id: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Case;
  },

  async create(dto: CreateCaseDTO, authorId: string) {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert({
        ...dto,
        author_id: authorId,
        tags: dto.tags || [],
      })
      .select()
      .single();

    if (error) throw error;
    return data as Case;
  },

  async update(id: string, dto: UpdateCaseDTO) {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Case;
  },

  async delete(id: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);
    if (error) throw error;
  },
};
