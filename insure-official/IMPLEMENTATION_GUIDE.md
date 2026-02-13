# Insuremo Next.js 项目 - 实现指南

本文档提供了关于如何完成项目的详细实现指南和最佳实践。

## 🚀 快速部署清单

### 1. 本地开发设置

\`\`\`bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 在浏览器中打开
# http://localhost:3000
\`\`\`

### 2. 关键文件已创建

✅ **配置文件**
- `next.config.ts` - Next.js 配置
- `tailwind.config.ts` - Tailwind CSS 配置
- `tsconfig.json` - TypeScript 配置
- `postcss.config.js` - PostCSS 配置
- `package.json` - 项目依赖

✅ **应用文件**
- `app/layout.tsx` - 根布局和元数据
- `app/page.tsx` - 首页组件
- `app/globals.css` - 全局样式

✅ **核心组件** (8 个)
- Header with Navigation
- Hero Section
- Features Section
- Products Section
- Testimonials Section
- Pricing Section
- CTA Section
- Footer with Subscribe

✅ **公共组件**
- Button (可复用)

✅ **API 路由** (2 个)
- `/api/contact` - 联系表单处理
- `/api/subscribe` - 邮件订阅处理

✅ **样式**
- CSS Modules 用于组件隔离
- 全局 CSS 变量和重置
- Tailwind CSS 配置（可选）

### 3. 下一步实现任务

#### A. 数据和后端集成

\`\`\`typescript
// lib/api.ts - 数据获取函数示例
export async function getProducts() {
  // 从数据库或外部 API 获取产品列表
  const response = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/products\`);
  return response.json();
}

// 在组件中使用
async function Products() {
  const products = await getProducts();
  return (
    <section>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </section>
  );
}
\`\`\`

#### B. 表单提交处理

\`\`\`typescript
// 在 ContactForm 组件中
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    if (response.ok) {
      // 显示成功消息
      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    }
  } catch (error) {
    setError('表单提交失败');
  }
};
\`\`\`

#### C. 图片和静态资源

\`\`\`bash
# 将图片放在 public 目录
public/
├── images/
│   ├── logo.svg
│   ├── hero-bg.jpg
│   ├── products/
│   │   ├── auto.jpg
│   │   ├── home.jpg
│   │   └── life.jpg
│   └── testimonials/
│       ├── user1.jpg
│       ├── user2.jpg
│       └── user3.jpg
└── icons/
    ├── check.svg
    ├── arrow.svg
    └── mail.svg
\`\`\`

#### D. 响应式图片优化

\`\`\`tsx
import Image from 'next/image';

// 使用 Next.js Image 组件优化
<Image
  src="/images/hero-bg.jpg"
  alt="Hero background"
  fill
  quality={75}
  priority
  className={styles.backgroundImage}
/>
\`\`\`

### 4. 响应式设计验证

使用 Chrome DevTools 检查：
- [ ] 移动 (375px - 640px)
- [ ] 平板 (641px - 1024px)
- [ ] 桌面 (1025px+)
- [ ] 超宽 (1536px+)

### 5. SEO 优化

已实现：
- ✅ Meta 标签和描述
- ✅ Open Graph 标签
- ✅ 结构化标题
- ✅ Robots.txt（需要添加）

待实现：
- [ ] 生成 sitemap.xml
- [ ] 添加 schema.org 结构化数据
- [ ] 优化图片 Alt 文本
- [ ] 设置 CDN 加速

### 6. 性能优化

已实现：
- ✅ CSS Modules（零运行时 CSS-in-JS）
- ✅ 代码分割（自动）
- ✅ Next.js Image 组件
- ✅ 字体优化

待实现：
- [ ] Lazy loading 组件
- [ ] 缓存策略 (ISR/SSG)
- [ ] Minification
- [ ] GZIP 压缩

### 7. 部署准备

#### Vercel 部署（推荐）

\`\`\`bash
# 1. 推送到 GitHub
git init
git add .
git commit -m "Initial commit"
git push -u origin main

# 2. 在 Vercel 上导入项目
# https://vercel.com/import

# 3. 在 Vercel Dashboard 中配置环境变量
# NEXT_PUBLIC_API_URL=https://api.insuremo.com
\`\`\`

#### 自托管部署

\`\`\`bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 设置反向代理（Nginx）
# location / {
#   proxy_pass http://localhost:3000;
#   proxy_http_version 1.1;
#   proxy_set_header Upgrade \$http_upgrade;
#   proxy_set_header Connection 'upgrade';
# }
\`\`\`

### 8. 环境变量配置

\`\`\`bash
cp .env.example .env.local

# 编辑 .env.local
NEXT_PUBLIC_SITE_URL=https://insuremo.com
NEXT_PUBLIC_API_URL=https://api.insuremo.com
SENDGRID_API_KEY=your_key_here
STRIPE_SECRET_KEY=your_key_here
\`\`\`

### 9. 扩展功能（可选）

#### 添加博客功能

\`\`\`tsx
// app/blog/page.tsx
export default async function Blog() {
  // 从 CMS 获取文章列表
  const posts = await getPosts();
  
  return (
    <section>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </section>
  );
}
\`\`\`

#### 添加用户认证

\`\`\`typescript
// lib/auth.ts - NextAuth.js 示例配置
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // 验证凭证
        return null;
      },
    }),
  ],
};
\`\`\`

#### 添加支付集成

\`\`\`typescript
// lib/stripe.ts - Stripe 示例
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createPaymentIntent(amount: number) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'cny',
  });
  return paymentIntent;
}
\`\`\`

### 10. 测试

\`\`\`bash
# 运行 Next.js 作为本地生产构建
npm run build
npm start

# 验证页面加载时间
# Google Lighthouse, WebPageTest 等工具
\`\`\`

## 📊 项目统计

- **总组件数**: 8 个主要部分 + 许多子组件
- **CSS 文件**: 8 个 Module + 1 个全局
- **API 路由**: 2 个
- **TypeScript 覆盖**: 100%
- **响应式断点**: 4 个

## 🔗 有用的链接

- [Next.js 官方文档](https://nextjs.org/docs)
- [Vercel 部署指南](https://vercel.com/docs)
- [Web Vitals](https://web.dev/vitals/)
- [SEO 检查清单](https://web.dev/lighthouse-seo/)

## 💡 最佳实践

1. **组件结构**: 每个组件都有自己的 CSS Module，确保样式隔离
2. **类型安全**: 使用 TypeScript 接口定义组件 Props
3. **性能**: 使用 Next.js Image 优化图片
4. **可访问性**: 添加 ARIA 标签和语义 HTML
5. **错误处理**: 为 API 路由添加适当的错误处理
6. **环境变量**: 使用 .env.local 管理敏感信息
7. **版本控制**: 使用 Git 跟踪所有更改
8. **文档**: 维护代码文档和项目 README

## 🎯 性能目标

- **LCP** (最大内容绘制): < 2.5s
- **FID** (首次输入延迟): < 100ms
- **CLS** (累积布局偏移): < 0.1
- **评分**: Google Lighthouse > 90

---

**最后更新**: 2024年2月12日  
**维护者**: Your Team  
**状态**: ✅ 项目文件完成，准备开发
