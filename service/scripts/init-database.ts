import { config } from 'dotenv';
config();

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function createTables() {
  console.log('Creating database tables...\n');

  // Create profiles table
  const { error: profilesError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        avatar_url TEXT,
        phone VARCHAR(50),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
        email_verified BOOLEAN DEFAULT false,
        last_login_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });

  if (profilesError) {
    console.error('Error creating profiles table:', profilesError);
  } else {
    console.log('✓ Profiles table created');
  }

  // Create roles table
  const { error: rolesError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        is_system BOOLEAN DEFAULT false,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });

  if (rolesError) {
    console.error('Error creating roles table:', rolesError);
  } else {
    console.log('✓ Roles table created');
  }

  // Create user_roles table
  const { error: userRolesError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (user_id, role_id)
      );
    `
  });

  if (userRolesError) {
    console.error('Error creating user_roles table:', userRolesError);
  } else {
    console.log('✓ User roles table created');
  }

  // Create menus table
  const { error: menusError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS menus (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        parent_id UUID REFERENCES menus(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        path VARCHAR(255),
        icon VARCHAR(100),
        sort_order INTEGER DEFAULT 0,
        type VARCHAR(20) CHECK (type IN ('directory', 'menu', 'button')),
        permission VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });

  if (menusError) {
    console.error('Error creating menus table:', menusError);
  } else {
    console.log('✓ Menus table created');
  }

  // Create role_menus table
  const { error: roleMenusError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS role_menus (
        role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
        menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (role_id, menu_id)
      );
    `
  });

  if (roleMenusError) {
    console.error('Error creating role_menus table:', roleMenusError);
  } else {
    console.log('✓ Role menus table created');
  }

  // Create videos table
  const { error: videosError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS videos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        cover_url TEXT,
        video_url TEXT NOT NULL,
        duration INTEGER,
        category VARCHAR(100),
        tags TEXT[] DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
        view_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        share_count INTEGER DEFAULT 0,
        author_id UUID REFERENCES profiles(id),
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });

  if (videosError) {
    console.error('Error creating videos table:', videosError);
  } else {
    console.log('✓ Videos table created');
  }

  // Create articles table
  const { error: articlesError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS articles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        summary TEXT,
        content TEXT NOT NULL,
        cover_url TEXT,
        category VARCHAR(100),
        tags TEXT[] DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
        view_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        share_count INTEGER DEFAULT 0,
        author_id UUID REFERENCES profiles(id),
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });

  if (articlesError) {
    console.error('Error creating articles table:', articlesError);
  } else {
    console.log('✓ Articles table created');
  }

  // Create cases table
  const { error: casesError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS cases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        summary TEXT,
        content TEXT NOT NULL,
        cover_url TEXT,
        category VARCHAR(100),
        tags TEXT[] DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
        view_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        share_count INTEGER DEFAULT 0,
        author_id UUID REFERENCES profiles(id),
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });

  if (casesError) {
    console.error('Error creating cases table:', casesError);
  } else {
    console.log('✓ Cases table created');
  }

  console.log('\n✓ All tables created successfully!\n');
}

async function createDefaultRoles() {
  console.log('Creating default roles...\n');

  const roles = [
    {
      name: '超级管理员',
      code: 'superadmin',
      description: '系统超级管理员，拥有所有权限',
      is_system: true,
    },
    {
      name: '管理员',
      code: 'admin',
      description: '系统管理员',
      is_system: true,
    },
    {
      name: '用户',
      code: 'user',
      description: '普通用户',
      is_system: true,
    },
    {
      name: '编辑',
      code: 'editor',
      description: '内容编辑',
      is_system: false,
    },
  ];

  for (const role of roles) {
    const { error } = await supabase
      .from('roles')
      .upsert(role, { onConflict: 'code' });

    if (error) {
      console.error(`Error creating role ${role.code}:`, error);
    } else {
      console.log(`✓ Role created: ${role.name} (${role.code})`);
    }
  }

  console.log('\n✓ Default roles created!\n');
}

async function createDefaultMenus() {
  console.log('Creating default menus...\n');

  // Home menu
  const homeMenu = {
    name: '首页',
    code: 'home',
    path: '/',
    icon: 'HomeOutlined',
    sort_order: 1,
    type: 'menu',
    permission: 'home:view',
    status: 'active',
  };

  const { error: homeError } = await supabase
    .from('menus')
    .upsert(homeMenu, { onConflict: 'code' })
    .select()
    .single();

  if (homeError) {
    console.error('Error creating home menu:', homeError);
  } else {
    console.log('✓ Menu created: 首页');
  }

  // Content management directory
  const contentDir = {
    name: '内容管理',
    code: 'content',
    icon: 'FileTextOutlined',
    sort_order: 2,
    type: 'directory',
    status: 'active',
  };

  const { data: contentData, error: contentError } = await supabase
    .from('menus')
    .upsert(contentDir, { onConflict: 'code' })
    .select()
    .single();

  if (contentError) {
    console.error('Error creating content directory:', contentError);
  } else {
    console.log('✓ Menu created: 内容管理');

    // Content management submenus
    const contentMenus = [
      {
        parent_id: contentData.id,
        name: '视频管理',
        code: 'content:videos',
        path: '/content/videos',
        icon: 'VideoCameraOutlined',
        sort_order: 1,
        type: 'menu',
        permission: 'content:videos:view',
        status: 'active',
      },
      {
        parent_id: contentData.id,
        name: '文章管理',
        code: 'content:articles',
        path: '/content/articles',
        icon: 'FileTextOutlined',
        sort_order: 2,
        type: 'menu',
        permission: 'content:articles:view',
        status: 'active',
      },
      {
        parent_id: contentData.id,
        name: '案例管理',
        code: 'content:cases',
        path: '/content/cases',
        icon: 'SolutionOutlined',
        sort_order: 3,
        type: 'menu',
        permission: 'content:cases:view',
        status: 'active',
      },
    ];

    for (const menu of contentMenus) {
      const { error } = await supabase
        .from('menus')
        .upsert(menu, { onConflict: 'code' });

      if (error) {
        console.error(`Error creating menu ${menu.code}:`, error);
      } else {
        console.log(`  ✓ Submenu created: ${menu.name}`);
      }
    }
  }

  // Permission management directory
  const permissionDir = {
    name: '权限管理',
    code: 'permission',
    icon: 'SafetyOutlined',
    sort_order: 3,
    type: 'directory',
    status: 'active',
  };

  const { data: permData, error: permError } = await supabase
    .from('menus')
    .upsert(permissionDir, { onConflict: 'code' })
    .select()
    .single();

  if (permError) {
    console.error('Error creating permission directory:', permError);
  } else {
    console.log('✓ Menu created: 权限管理');

    // Permission management submenus
    const permissionMenus = [
      {
        parent_id: permData.id,
        name: '用户管理',
        code: 'permission:users',
        path: '/permission/users',
        icon: 'UserOutlined',
        sort_order: 1,
        type: 'menu',
        permission: 'permission:users:view',
        status: 'active',
      },
      {
        parent_id: permData.id,
        name: '角色管理',
        code: 'permission:roles',
        path: '/permission/roles',
        icon: 'TeamOutlined',
        sort_order: 2,
        type: 'menu',
        permission: 'permission:roles:view',
        status: 'active',
      },
      {
        parent_id: permData.id,
        name: '菜单管理',
        code: 'permission:menus',
        path: '/permission/menus',
        icon: 'MenuOutlined',
        sort_order: 3,
        type: 'menu',
        permission: 'permission:menus:view',
        status: 'active',
      },
    ];

    for (const menu of permissionMenus) {
      const { error } = await supabase
        .from('menus')
        .upsert(menu, { onConflict: 'code' });

      if (error) {
        console.error(`Error creating menu ${menu.code}:`, error);
      } else {
        console.log(`  ✓ Submenu created: ${menu.name}`);
      }
    }
  }

  console.log('\n✓ Default menus created!\n');
}

async function createAdminUser() {
  console.log('Creating admin user...\n');

  const adminEmail = 'admin@admin.com';
  const adminPassword = 'Admin@123';

  // Check if admin exists
  const { data: existingAdmin } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', adminEmail)
    .single();

  if (existingAdmin) {
    console.log('Admin user already exists, skipping...\n');
    return;
  }

  // Hash password
  const passwordHash = await hashPassword(adminPassword);

  // Create admin user
  const { data: admin, error: adminError } = await supabase
    .from('profiles')
    .insert({
      email: adminEmail,
      password_hash: passwordHash,
      full_name: 'Administrator',
      status: 'active',
      email_verified: true,
    })
    .select()
    .single();

  if (adminError || !admin) {
    console.error('Error creating admin user:', adminError);
    return;
  }

  console.log('✓ Admin user created');

  // Get superadmin role
  const { data: superadminRole } = await supabase
    .from('roles')
    .select('id')
    .eq('code', 'superadmin')
    .single();

  if (superadminRole) {
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: admin.id,
        role_id: superadminRole.id,
      });

    if (roleError) {
      console.error('Error assigning superadmin role:', roleError);
    } else {
      console.log('✓ Superadmin role assigned to admin user');
    }
  }

  console.log('\n✓ Admin user created successfully!');
  console.log(`  Email: ${adminEmail}`);
  console.log(`  Password: ${adminPassword}\n`);
}

async function assignAllMenusToSuperadmin() {
  console.log('Assigning all menus to superadmin role...\n');

  // Get superadmin role
  const { data: superadminRole } = await supabase
    .from('roles')
    .select('id')
    .eq('code', 'superadmin')
    .single();

  if (!superadminRole) {
    console.error('Superadmin role not found');
    return;
  }

  // Get all menus
  const { data: menus } = await supabase
    .from('menus')
    .select('id');

  if (!menus || menus.length === 0) {
    console.log('No menus found');
    return;
  }

  // Assign all menus to superadmin
  const roleMenus = menus.map((menu) => ({
    role_id: superadminRole.id,
    menu_id: menu.id,
  }));

  const { error } = await supabase
    .from('role_menus')
    .upsert(roleMenus, { onConflict: 'role_id,menu_id' });

  if (error) {
    console.error('Error assigning menus to superadmin:', error);
  } else {
    console.log(`✓ Assigned ${menus.length} menus to superadmin role\n`);
  }
}

async function main() {
  console.log('========================================');
  console.log('  Database Initialization Script');
  console.log('========================================\n');

  try {
    await createTables();
    await createDefaultRoles();
    await createDefaultMenus();
    await createAdminUser();
    await assignAllMenusToSuperadmin();

    console.log('========================================');
    console.log('  Database initialization complete!');
    console.log('========================================');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

main();
