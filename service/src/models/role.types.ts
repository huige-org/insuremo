export interface Role {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_system: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CreateRoleDTO {
  name: string;
  code: string;
  description?: string;
  is_system?: boolean;
  status?: 'active' | 'inactive';
}

export interface UpdateRoleDTO {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

export interface RoleResponse {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_system: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  menus: string[];
  user_count: number;
}
