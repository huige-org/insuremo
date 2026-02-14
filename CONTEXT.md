# 项目上下文记忆

## 工作区概述

多项目 monorepo，包含三个子项目：
- **admin-system**: 后台管理系统 (Vue3 + Element Plus + Vite)
- **insure-official**: 官方网站 (Next.js 16 + React 19 + Tailwind CSS)
- **service**: 后端服务 (Node.js + Express + Supabase + Redis)

## 技术栈

### admin-system
- Vue 3 + Vite + Element Plus
- 开发端口: http://localhost:5173

### service
- Express + TypeScript + Supabase + Redis + JWT
- 部署: Railway
- 开发端口: http://localhost:3001

### insure-official
- Next.js 16 + React 19 + Tailwind CSS

## 项目结构

```
insure-admin/
├── admin-system/src/
│   ├── api/index.js        # API 调用
│   ├── components/RichEditor/
│   ├── layouts/MainLayout.vue
│   ├── router/index.js
│   ├── stores/user.js
│   └── views/
│       ├── content/        # ArticleResource, CaseResource, VideoResource
│       ├── permission/     # UserManage, RoleManage, MenuManage
│       ├── Profile.vue     # 个人中心
│       └── Password.vue    # 修改密码
├── service/src/
│   ├── controllers/        # auth, upload, user
│   ├── middlewares/        # auth, error
│   ├── routes/            # auth, upload, user, role
│   └── services/
└── insure-official/app/
```

## 关键 API

- `POST /api/v1/auth/login` - 登录
- `GET /api/v1/auth/me` - 当前用户
- `PUT /api/v1/auth/profile` - 更新资料
- `POST /api/v1/auth/change-password` - 修改密码
- `POST /api/v1/upload/image` - 上传图片
- `POST /api/v1/upload/video` - 上传视频

## 最新修改

1. 上传接口响应格式: `{ errno: 0, data: { url, alt, href } }`
2. 完成 Profile.vue 和 Password.vue 页面
3. 用户信息返回 full_name, avatar_url, phone
4. Vite base: '/' 修复 SPA 路由刷新 404
5. 后端 auth middleware 添加 full_name, avatar_url, phone 到 req.user
6. Profile.vue 调用 API 回填用户信息
7. 修复 updateProfileSchema 中 avatar_url 验证 (移除 url() 验证)
8. 修复 ContentGrid 富文本渲染: 添加 isRichText 字段，200字限制，超出显示...
9. 案例详情页封面图: 固定高度 400px，object-fit: cover
10. 修复按钮 focus 黑色边框: style.css 中移除 outline

## 开发环境配置

### admin-system .env.development
```
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

### service .env
```
PORT=3001
NODE_ENV=development
```

## 执行记录

### 2026-02-14
- 配置 admin-system 开发环境使用本地 service (VITE_API_BASE_URL)
- 启动 service: `cd service && npx ts-node --project tsconfig.json src/app.ts`
- 修复 TypeScript 编译错误: auth.middleware.ts 中添加 full_name, avatar_url, phone 到查询字段
- 修复上传接口响应适配: ArticleResource.vue, CaseResource.vue, VideoResource.vue 使用 `res.errno === 0 ? res.data?.url : res.url`
- 创建 Profile.vue 和 Password.vue 个人中心页面
- 创建 CONTEXT.md 上下文记忆文件
- 修复 Profile.vue 回填信息: 改为调用 API 获取最新用户信息
- 修复 updateProfileSchema: avatar_url 移除 url() 验证 (400 错误)
- 修复 ContentGrid 富文本渲染: 添加 isRichText 字段，200字限制，超出显示...
- 案例详情页封面图: 固定高度 400px，object-fit: cover (case-studies/[id]/page.tsx)
- 修复按钮 focus 黑色边框: style.css 中移除 outline
- 启动官网: `cd insure-official && npm run dev` (http://localhost:3000)
