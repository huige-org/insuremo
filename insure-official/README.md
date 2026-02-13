# Insuremo 官网 - Next.js 项目

快速、透明、安全的在线保险平台官方网站。

## 🚀 快速开始

### 前置条件
- Node.js 18+
- npm 或 yarn 包管理器

### 安装依赖

\`\`\`bash
npm install
\`\`\`

### 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000) 查看结果。

### 构建生产版本

\`\`\`bash
npm run build
npm start
\`\`\`

## 📁 项目结构

```
insure-official/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 首页
│   ├── globals.css          # 全局样式
│   └── api/                 # API 路由
├── components/              # React 组件
│   ├── Header/
│   ├── Hero/
│   ├── Features/
│   ├── Products/
│   ├── Testimonials/
│   ├── Pricing/
│   ├── CTA/
│   ├── Footer/
│   └── Common/
├── lib/                     # 工具函数和类型
├── public/                  # 静态资源
├── styles/                  # 全局样式
└── config/                  # 配置文件
```

## 🎨 技术栈

- **框架**: Next.js 16+
- **样式**: CSS Modules + Tailwind CSS
- **类型**: TypeScript
- **部署**: Vercel

## 📖 主要功能

- ✅ 响应式设计（移动优先）
- ✅ SEO 优化
- ✅ 性能优化
- ✅ 暗黑模式支持（可扩展）
- ✅ 国际化支持（可扩展）
- ✅ 邮件订阅功能
- ✅ 联系表单

## 🔧 配置文件

### 环境变量

复制 `.env.example` 为 `.env.local` 并配置：

\`\`\`bash
cp .env.example .env.local
\`\`\`

### 重要文件

- `next.config.ts` - Next.js 配置
- `tailwind.config.ts` - Tailwind CSS 配置
- `tsconfig.json` - TypeScript 配置
- `postcss.config.js` - PostCSS 配置

## 📱 响应式断点

- **sm**: 640px
- **md**: 768px  
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

## 🎯 下一步

1. 添加真实的产品数据
2. 集成支付系统
3. 添加后端 API
4. 实现用户认证
5. 设置分析和监控
6. 部署到 Vercel

## 📚 文档

- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com)
- [React 文档](https://react.dev)

## 🏢 部署

该项目经过优化以在 Vercel 上部署。详见 `PROJECT_PLAN.md` 中的部署方案。

## 📄 许可证

MIT
