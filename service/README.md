# Insure Admin Backend Service

完整的 Node.js + Supabase + Redis + Winston + Docker + PM2 后端服务。

## 技术栈

- **Node.js 20** + **TypeScript**
- **Express.js** - Web 框架
- **Supabase** - PostgreSQL 数据库
- **Redis** - 缓存与会话存储
- **Winston** - 日志记录
- **Zod** - 数据验证
- **JWT** - 身份认证
- **Swagger** - API 文档
- **Docker** - 容器化部署
- **PM2** - 进程管理

## 项目结构

```
service/
├── src/
│   ├── app.ts                    # 应用入口
│   ├── config/                   # 配置文件
│   │   ├── env.ts               # 环境变量（Zod验证）
│   │   ├── database.ts          # Supabase 客户端
│   │   ├── redis.ts             # Redis 连接
│   │   └── logger.ts            # Winston 日志配置
│   ├── controllers/              # 控制器层
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── role.controller.ts
│   │   └── menu.controller.ts
│   ├── services/                 # 服务层
│   │   ├── cache.service.ts
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── role.service.ts
│   │   └── menu.service.ts
│   ├── middlewares/              # 中间件
│   │   ├── auth.middleware.ts   # JWT 验证
│   │   ├── error.middleware.ts  # 错误处理
│   │   ├── logger.middleware.ts # 请求日志
│   │   └── rate-limit.middleware.ts # 限流
│   ├── models/                   # 类型定义
│   │   ├── user.types.ts
│   │   ├── role.types.ts
│   │   ├── menu.types.ts
│   │   ├── auth.types.ts
│   │   ├── video.types.ts
│   │   ├── article.types.ts
│   │   ├── case.types.ts
│   │   ├── common.types.ts
│   │   └── relation.types.ts
│   ├── routes/                   # 路由
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── role.routes.ts
│   │   └── menu.routes.ts
│   └── utils/                    # 工具函数
│       ├── response.ts
│       ├── validator.ts
│       └── helpers.ts
├── scripts/
│   └── init-database.ts         # 数据库初始化脚本
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── ecosystem.config.js          # PM2 配置
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .env
├── .gitignore
└── .dockerignore
```

## 统计数据

| 项目 | 数量 |
|------|------|
| **总文件数** | 46 |
| **TypeScript 文件** | 36 |
| **配置文件** | 5 |
| **Docker 文件** | 2 |
| **其他** | 3 |
| **数据库表** | 8 |
| **API 端点** | 32+ |

### 数据库表

1. `profiles` - 用户表
2. `roles` - 角色表
3. `user_roles` - 用户角色关联表
4. `menus` - 菜单表
5. `role_menus` - 角色菜单关联表
6. `videos` - 视频表
7. `articles` - 文章表
8. `cases` - 案例表

### API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/v1/auth/login | 用户登录 |
| POST | /api/v1/auth/register | 用户注册 |
| POST | /api/v1/auth/refresh | 刷新令牌 |
| POST | /api/v1/auth/logout | 用户登出 |
| GET | /api/v1/auth/me | 获取当前用户 |
| POST | /api/v1/auth/change-password | 修改密码 |
| GET | /api/v1/users | 获取用户列表 |
| POST | /api/v1/users | 创建用户 |
| GET | /api/v1/users/:id | 获取用户详情 |
| PUT | /api/v1/users/:id | 更新用户 |
| DELETE | /api/v1/users/:id | 删除用户 |
| POST | /api/v1/users/:id/roles | 分配角色 |
| DELETE | /api/v1/users/:id/roles | 移除角色 |
| GET | /api/v1/roles | 获取角色列表 |
| POST | /api/v1/roles | 创建角色 |
| GET | /api/v1/roles/:id | 获取角色详情 |
| PUT | /api/v1/roles/:id | 更新角色 |
| DELETE | /api/v1/roles/:id | 删除角色 |
| POST | /api/v1/roles/:id/menus | 分配菜单 |
| DELETE | /api/v1/roles/:id/menus | 移除菜单 |
| GET | /api/v1/menus | 获取菜单列表 |
| GET | /api/v1/menus/tree | 获取菜单树 |
| GET | /api/v1/menus/by-role | 获取角色菜单 |
| POST | /api/v1/menus | 创建菜单 |
| GET | /api/v1/menus/:id | 获取菜单详情 |
| PUT | /api/v1/menus/:id | 更新菜单 |
| DELETE | /api/v1/menus/:id | 删除菜单 |
| GET | /health | 健康检查 |
| GET | /api-docs | Swagger 文档 |

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

.env 文件需要配置以下环境变量：

### 3. 初始化数据库

```bash
npm run db:init
```

这将创建：
- 所有数据表（8个）
- 默认角色（超级管理员、管理员、用户、编辑）
- 预设菜单（首页、内容管理、权限管理）
- 管理员账号：`admin@admin.com` / `Admin@123`

### 4. 启动服务

**开发模式：**
```bash
npm run dev
```

**生产模式：**
```bash
npm run build
npm start
```

**使用 PM2：**
```bash
npm run pm2:start
```

**使用 Docker：**
```bash
# 启动服务
npm run docker:up

# 查看日志
docker-compose -f docker/docker-compose.yml logs -f

# 停止服务
npm run docker:down
```

## 服务访问

- **API 服务**: http://localhost:3001
- **API 文档**: http://localhost:3001/api-docs
- **健康检查**: http://localhost:3001/health

## 默认管理员账号

- **邮箱**: admin@admin.com
- **密码**: Admin@123
- **角色**: 超级管理员

## 可用命令

```bash
# 开发
npm run dev                    # 启动开发服务器
npm run build                  # 编译 TypeScript
npm start                      # 运行生产版本

# 数据库
npm run db:init               # 初始化数据库

# PM2 管理
npm run pm2:start             # PM2 启动
npm run pm2:stop              # PM2 停止
npm run pm2:restart           # PM2 重启
npm run pm2:delete            # PM2 删除
npm run pm2:logs              # 查看日志
npm run pm2:monit             # PM2 监控

# Docker
npm run docker:build          # 构建 Docker 镜像
npm run docker:up             # 启动 Docker 容器
npm run docker:down           # 停止 Docker 容器

# 代码质量
npm run lint                  # ESLint 检查
npm run lint:fix              # ESLint 修复

# 清理
npm run clean                 # 清理构建目录
```

## 环境变量

| 变量 | 默认值 | 描述 |
|------|--------|------|
| NODE_ENV | development | 运行环境 |
| PORT | 3001 | 服务端口 |
| API_PREFIX | /api/v1 | API 前缀 |
| SUPABASE_URL | - | Supabase URL |
| SUPABASE_ANON_KEY | - | Supabase Anon Key |
| SUPABASE_SERVICE_KEY | - | Supabase Service Key |
| REDIS_HOST | localhost | Redis 主机 |
| REDIS_PORT | 6379 | Redis 端口 |
| REDIS_PASSWORD | - | Redis 密码 |
| JWT_SECRET | - | JWT 密钥 |
| JWT_EXPIRES_IN | 24h | JWT 过期时间 |
| LOG_LEVEL | info | 日志级别 |

## 预设菜单结构

```
首页
内容管理
├── 视频管理
├── 文章管理
└── 案例管理
权限管理
├── 用户管理
├── 角色管理
└── 菜单管理
```

## 许可证

MIT
