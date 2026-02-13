export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  status: 'active' | 'inactive' | 'banned';
  email_verified: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  roleIds?: string[];
}

export interface UpdateUserDTO {
  email?: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  status?: 'active' | 'inactive' | 'banned';
  roleIds?: string[];
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  status: string;
  email_verified: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  roles: string[];
}
