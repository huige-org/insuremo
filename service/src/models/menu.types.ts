export interface Menu {
  id: string;
  parent_id: string | null;
  name: string;
  code: string;
  path: string | null;
  icon: string | null;
  sort_order: number;
  type: 'directory' | 'menu' | 'button';
  permission: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CreateMenuDTO {
  parent_id?: string | null;
  name: string;
  code: string;
  path?: string;
  icon?: string;
  sort_order?: number;
  type: 'directory' | 'menu' | 'button';
  permission?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateMenuDTO {
  parent_id?: string | null;
  name?: string;
  path?: string;
  icon?: string;
  sort_order?: number;
  type?: 'directory' | 'menu' | 'button';
  permission?: string;
  status?: 'active' | 'inactive';
}

export interface MenuTreeItem extends Menu {
  title: string;
  children: MenuTreeItem[];
}

export interface MenuResponse {
  id: string;
  parent_id: string | null;
  name: string;
  code: string;
  path: string | null;
  icon: string | null;
  sort_order: number;
  type: string;
  permission: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}
