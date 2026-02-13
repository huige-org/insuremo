# Insuremo.com 官网还原 - Next.js 项目详细构建方案

## 📋 项目概述

本方案旨在使用 **Next.js 16+** 完整还原 [https://insuremo.com/en/](https://insuremo.com/en/) 官方网站。

**技术栈：**
- **框架**: Next.js 16+ (App Router)
- **样式**: Tailwind CSS + CSS Modules
- **组件库**: React 19+
- **类型检查**: TypeScript
- **数据获取**: Server Components + Server Functions
- **缓存策略**: Cache Components (ISR/SSG)
- **部署**: Vercel

---

## 🏗️ 项目架构分析

### 1. 网站结构概览

#### 页面层级结构
```
└── 首页 (/)
    ├── 顶部导航栏 (Header)
    ├── 英雄区块 (Hero Section)
    ├── 功能展示区 (Features Section)
    ├── 产品介绍区 (Products Section)
    ├── 客户案例区 (Case Studies Section)
    ├── 定价区 (Pricing Section)
    ├── CTA 区块 (Call-to-Action)
    └── 页脚 (Footer)
```

#### CSS 类名设计
- 使用 BEM 命名规范或 Tailwind CSS
- 响应式设计 (mobile-first approach)
- 断点: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)

#### 资源清单
- **样式表**: CSS/SCSS 文件（包含全局样式和组件样式）
- **图片资源**: Logo、Hero 背景、案例图片等
- **字体**: 自定义字体或系统字体栈

---

## 📁 项目目录结构设计

```
insure-official/
├── .next/                          # Next.js 构建输出
├── app/                            # App Router 目录
│   ├── layout.tsx                 # 根布局（全局样式、导航）
│   ├── page.tsx                   # 首页
│   ├── globals.css                # 全局样式
│   ├── api/                       # API 路由
│   │   ├── contact/route.ts       # 联系表单 API
│   │   └── subscribe/route.ts     # 邮件订阅 API
│   └── (sections)/                # 按功能分组的路由组
│       ├── about/page.tsx         # 关于页面
│       ├── products/page.tsx      # 产品页面
│       └── contact/page.tsx       # 联系页面
│
├── components/                     # 可复用组件
│   ├── Header/
│   │   ├── Header.tsx             # 头部组件
│   │   ├── Navigation.tsx         # 导航菜单
│   │   └── Header.module.css      # 样式
│   ├── Hero/
│   │   ├── Hero.tsx               # 英雄区块
│   │   ├── Hero.module.css
│   │   └── HeroBackground.tsx     # 背景组件
│   ├── Features/
│   │   ├── Features.tsx            # 功能展示
│   │   ├── FeatureCard.tsx         # 单个功能卡片
│   │   └── Features.module.css
│   ├── Products/
│   │   ├── Products.tsx
│   │   ├── ProductCard.tsx
│   │   └── Products.module.css
│   ├── Pricing/
│   │   ├── Pricing.tsx
│   │   ├── PricingTier.tsx
│   │   └── Pricing.module.css
│   ├── Testimonials/
│   │   ├── Testimonials.tsx
│   │   ├── TestimonialCard.tsx
│   │   └── Testimonials.module.css
│   ├── CTA/
│   │   ├── CTA.tsx                # 行动召唤区块
│   │   └── CTA.module.css
│   ├── Footer/
│   │   ├── Footer.tsx
│   │   ├── FooterColumn.tsx
│   │   └── Footer.module.css
│   └── Common/
│       ├── Button.tsx             # 通用按钮
│       ├── Container.tsx          # 容器组件
│       ├── Section.tsx            # 区块包装器
│       └── Common.module.css
│
├── lib/                            # 工具函数和数据获取
│   ├── api.ts                     # API 调用函数
│   ├── constants.ts               # 常量定义
│   ├── types.ts                   # TypeScript 类型定义
│   └── utils.ts                   # 通用工具函数
│
├── public/                         # 静态资源
│   ├── images/
│   │   ├── logo.svg
│   │   ├── hero-bg.jpg
│   │   ├── products/
│   │   │   ├── product-1.jpg
│   │   │   ├── product-2.jpg
│   │   │   └── product-3.jpg
│   │   └── testimonials/
│   ├── fonts/
│   │   └── custom-font.woff2
│   └── icons/
│       ├── check.svg
│       ├── arrow.svg
│       └── mail.svg
│
├── styles/                        # 全局样式（可选）
│   ├── variables.css              # CSS 变量
│   ├── typography.css             # 排版样式
│   └── animations.css             # 动画效果
│
├── hooks/                         # 自定义 React hooks
│   ├── useMediaQuery.ts           # 响应式查询
│   ├── useScroll.ts               # 滚动监听
│   └── useIntersectionObserver.ts # 交叉观察器
│
├── config/                        # 配置文件
│   ├── siteConfig.ts              # 网站配置
│   ├── navConfig.ts               # 导航菜单配置
│   └── themeConfig.ts             # 主题/颜色配置
│
├── .env.local                     # 环境变量（本地）
├── .env.example                   # 环境变量示例
├── next.config.ts                 # Next.js 配置
├── tailwind.config.ts             # Tailwind CSS 配置
├── tsconfig.json                  # TypeScript 配置
├── package.json                   # 项目依赖
└── README.md                      # 项目文档
```

---

## 🎨 核心组件设计方案

### 1. Header 组件 (Header.tsx)

**功能:**
- 响应式导航菜单
- Logo 和品牌
- 移动端汉堡菜单
- 联系按钮/CTA

**设计特点:**
- Sticky 导航栏（滚动时保持顶部）
- 支持深色/浅色主题
- 平滑滚动动画

**核心代码示例:**

```tsx
// app/components/Header/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from './Navigation';
import styles from './Header.module.css';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <Image
            src="/images/logo.svg"
            alt="Insuremo"
            width={150}
            height={40}
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <Navigation />

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className={styles.mobileMenu}>
            <Navigation />
          </nav>
        )}
      </div>
    </header>
  );
}
```

**CSS 样式示例 (Header.module.css):**

```css
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: white;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  padding: 1rem 0;
}

.header.scrolled {
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.logo img {
  height: auto;
  width: auto;
}

.mobileMenuBtn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  flex-direction: column;
  gap: 6px;
}

.mobileMenuBtn span {
  width: 25px;
  height: 3px;
  background-color: #333;
  transition: all 0.3s ease;
  border-radius: 2px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mobileMenuBtn {
    display: flex;
  }

  .container {
    padding: 0 1rem;
  }
}
```

### 2. Hero 组件 (Hero.tsx)

**功能:**
- 全屏/半屏专业背景
- 文案和 CTA 按钮
- 响应式文本大小
- 视差滚动效果（可选）

**核心代码示例:**

```tsx
// app/components/Hero/Hero.tsx
import styles from './Hero.module.css';
import Button from '@/components/Common/Button';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* 背景图片 */}
      <div className={styles.backgroundContainer}>
        <Image
          src="/images/hero-bg.jpg"
          alt="Hero background"
          fill
          quality={90}
          priority
          className={styles.backgroundImage}
        />
        <div className={styles.overlay}></div>
      </div>

      {/* 内容区域 */}
      <div className={styles.content}>
        <div className={styles.container}>
          <h1 className={styles.title}>
            保险不应该那么复杂
          </h1>
          <p className={styles.subtitle}>
            我们简化了保险购买流程，让您专注于最重要的事情
          </p>
          <div className={styles.ctaGroup}>
            <Button href="/contact" variant="primary">
              立即开始
            </Button>
            <Button href="/learn-more" variant="secondary">
              了解更多
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**CSS 样式示例:**

```css
/* app/components/Hero/Hero.module.css */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.backgroundContainer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.backgroundImage {
  object-fit: cover;
  object-position: center;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.2) 100%
  );
  z-index: 1;
}

.content {
  position: relative;
  z-index: 2;
  color: white;
  text-align: center;
  width: 100%;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.title {
  font-size: 4rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
  animation: fadeInUp 0.8s ease-out;
}

.subtitle {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.95;
  animation: fadeInUp 0.8s ease-out 0.2s backwards;
}

.ctaGroup {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeInUp 0.8s ease-out 0.4s backwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .hero {
    min-height: 70vh;
  }

  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .ctaGroup {
    flex-direction: column;
  }
}
```

### 3. Features 组件 (Features.tsx)

**功能:**
- 特性卡片网格布局
- 图标或插图
- 响应式列数

**核心代码示例:**

```tsx
// app/components/Features/Features.tsx
import styles from './Features.module.css';
import FeatureCard from './FeatureCard';

const features = [
  {
    id: 1,
    icon: '⚡',
    title: '快速申请',
    description: '仅需 5 分钟完成在线申请，无需繁琐文件',
  },
  {
    id: 2,
    icon: '🔒',
    title: '安全可靠',
    description: '银行级加密技术保护您的个人信息',
  },
  {
    id: 3,
    icon: '💬',
    title: '24/7 支持',
    description: '随时随地获得专业的客户服务支持',
  },
  {
    id: 4,
    icon: '✨',
    title: '透明定价',
    description: '没有隐藏费用，价格合理且有竞争力',
  },
];

export default function Features() {
  return (
    <section className={styles.features}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>为什么选择我们</h2>
          <p className={styles.subtitle}>
            提供最佳的保险解决方案和服务
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

**CSS 响应式网格:**

```css
/* app/components/Features/Features.module.css */
.features {
  padding: 4rem 0;
  background-color: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.1rem;
  color: #666;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

@media (max-width: 768px) {
  .features {
    padding: 2rem 0;
  }

  .title {
    font-size: 1.8rem;
  }

  .grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
```

### 4. Footer 组件 (Footer.tsx)

**功能:**
- 多列页脚链接
- 社交媒体链接
- 邮件订阅表单
- 版权信息

**核心代码示例:**

```tsx
// app/components/Footer/Footer.tsx
'use client';

import styles from './Footer.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 3000);
      }
    } catch (error) {
      console.error('Subscribe failed:', error);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* 上部：链接和邮件订阅 */}
        <div className={styles.topSection}>
          <div className={styles.logoSection}>
            <Link href="/">
              <Image
                src="/images/logo.svg"
                alt="Insuremo"
                width={150}
                height={40}
              />
            </Link>
            <p className={styles.tagline}>
              简化保险，保护未来
            </p>
          </div>

          {/* 导航链接 */}
          <div className={styles.linksGrid}>
            <div className={styles.linksColumn}>
              <h4>产品</h4>
              <ul>
                <li><Link href="/products/auto">汽车保险</Link></li>
                <li><Link href="/products/home">家庭保险</Link></li>
                <li><Link href="/products/life">人寿保险</Link></li>
              </ul>
            </div>

            <div className={styles.linksColumn}>
              <h4>公司</h4>
              <ul>
                <li><Link href="/about">关于我们</Link></li>
                <li><Link href="/blog">博客</Link></li>
                <li><Link href="/careers">招聘</Link></li>
              </ul>
            </div>

            <div className={styles.linksColumn}>
              <h4>支持</h4>
              <ul>
                <li><Link href="/faq">常见问题</Link></li>
                <li><Link href="/contact">联系我们</Link></li>
                <li><Link href="/privacy">隐私政策</Link></li>
              </ul>
            </div>

            {/* 邮件订阅 */}
            <div className={styles.subscribeColumn}>
              <h4>订阅新闻</h4>
              <form onSubmit={handleSubscribe}>
                <div className={styles.subscribeForm}>
                  <input
                    type="email"
                    placeholder="输入您的邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit">订阅</button>
                </div>
              </form>
              {subscribed && (
                <p className={styles.successMessage}>
                  感谢您的订阅！
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 下部：社交媒体和版权 */}
        <div className={styles.bottomSection}>
          <div className={styles.social}>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <span>𝕏</span>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <span>f</span>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <span>in</span>
            </a>
          </div>
          <p className={styles.copyright}>
            &copy; 2024 Insuremo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

**Footer CSS 样式:**

```css
/* app/components/Footer/Footer.module.css */
.footer {
  background-color: #1a1a1a;
  color: #e0e0e0;
  padding: 4rem 0 2rem;
  margin-top: 4rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.topSection {
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 3rem;
  margin-bottom: 3rem;
  padding-bottom: 3rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logoSection {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tagline {
  font-size: 0.95rem;
  color: #b0b0b0;
}

.linksGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
}

.linksColumn h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: white;
}

.linksColumn ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.linksColumn li {
  margin-bottom: 0.5rem;
}

.linksColumn a {
  color: #b0b0b0;
  text-decoration: none;
  transition: color 0.3s ease;
}

.linksColumn a:hover {
  color: white;
}

.subscribeColumn {
  min-width: 250px;
}

.subscribeForm {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.subscribeForm input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 0.95rem;
}

.subscribeForm input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.subscribeForm button {
  padding: 0.75rem 1.5rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.subscribeForm button:hover {
  background-color: #1d4ed8;
}

.successMessage {
  color: #10b981;
  font-size: 0.95rem;
  animation: slideIn 0.3s ease-out;
}

.bottomSection {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
}

.social {
  display: flex;
  gap: 1.5rem;
}

.social a {
  color: #b0b0b0;
  font-size: 1.2rem;
  transition: color 0.3s ease;
  text-decoration: none;
}

.social a:hover {
  color: white;
}

.copyright {
  font-size: 0.9rem;
  color: #808080;
}

@media (max-width: 768px) {
  .topSection {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .linksGrid {
    grid-template-columns: repeat(2, 1fr);
  }

  .bottomSection {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
```

---

## ⚙️ 关键技术实现方案

### 1. 页面布局 (Layout.tsx)

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Insuremo - 简化保险，保护未来',
  description: '快速、透明、安全的在线保险平台',
  keywords: 'insurance, 保险, 在线保险',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

### 2. 首页 (page.tsx)

```tsx
// app/page.tsx
import Hero from '@/components/Hero/Hero';
import Features from '@/components/Features/Features';
import Products from '@/components/Products/Products';
import Testimonials from '@/components/Testimonials/Testimonials';
import Pricing from '@/components/Pricing/Pricing';
import CTA from '@/components/CTA/CTA';

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Products />
      <Testimonials />
      <Pricing />
      <CTA />
    </>
  );
}
```

### 3. 响应式 CSS 基础

```css
/* app/globals.css */
:root {
  /* 颜色 */
  --primary: #2563eb;
  --primary-light: #3b82f6;
  --primary-dark: #1e40af;
  --secondary: #10b981;
  --gray-100: #f3f4f6;
  --gray-900: #111827;

  /* 排版 */
  --font-family-main: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-size-base: 1rem;
  --line-height-base: 1.5;

  /* 间距 */
  --spacing-unit: 1rem;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-family-main);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  color: var(--gray-900);
  background-color: white;
}

/* 响应式排版 */
h1 {
  font-size: clamp(2rem, 5vw, 4rem);
  line-height: 1.2;
  font-weight: 700;
}

h2 {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  line-height: 1.3;
  font-weight: 700;
}

h3 {
  font-size: clamp(1.5rem, 3vw, 2rem);
  line-height: 1.4;
  font-weight: 600;
}

p {
  margin-bottom: 1rem;
  color: #555;
}

a {
  color: var(--primary);
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: var(--primary-dark);
}

/* 按钮重置 */
button {
  font-family: inherit;
  font-size: inherit;
}

/* 容器查询支持 */
@supports (container-type: inline-size) {
  .responsive-container {
    container-type: inline-size;
  }
}
```

### 4. 数据获取方案 (Server Components)

```tsx
// app/components/Products/Products.tsx
import { getProducts } from '@/lib/api';
import ProductCard from './ProductCard';
import styles from './Products.module.css';

export default async function Products() {
  const products = await getProducts();

  return (
    <section className={styles.products}>
      <div className={styles.container}>
        <h2 className={styles.title}>我们的产品</h2>
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

**API 函数 (lib/api.ts):**

```typescript
// lib/api.ts
import { unstable_cache } from 'next/cache';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  features: string[];
  image: string;
}

// 使用 Cache Components 缓存数据
export const getProducts = unstable_cache(
  async (): Promise<Product[]> => {
    // 实际中应该从数据库或外部 API 获取
    return [
      {
        id: 1,
        name: '汽车保险',
        description: '全面的汽车保护方案',
        price: 299,
        features: ['碰撞保护', '盗窃防护', '24/7 道路救援'],
        image: '/images/products/auto.jpg',
      },
      {
        id: 2,
        name: '家庭保险',
        description: '保护您的家和财产',
        price: 399,
        features: ['房屋结构保护', '个人财产覆盖', '责任保护'],
        image: '/images/products/home.jpg',
      },
      {
        id: 3,
        name: '人寿保险',
        description: '为家人的未来提供保障',
        price: 199,
        features: ['身故保险金', '伤残保险', '医疗补助'],
        image: '/images/products/life.jpg',
      },
    ];
  },
  ['products'],
  { revalidate: 3600 } // 1 小时重新验证
);

export async function getProductById(id: number) {
  const products = await getProducts();
  return products.find((p) => p.id === id);
}
```

### 5. 联系表单 API 路由 (Route Handler)

```typescript
// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证数据
    const validatedData = contactSchema.parse(body);

    // 这里可以添加发送邮件、保存到数据库等逻辑
    console.log('Contact form submitted:', validatedData);

    return NextResponse.json(
      { success: true, message: '感谢您的联系，我们会尽快回复' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '表单提交失败，请重试' },
      { status: 400 }
    );
  }
}
```

---

## 🎯 响应式设计最佳实践

### 1. 移动优先方法

```css
/* 基础移动样式 */
.card {
  display: block;
  padding: 1rem;
  margin-bottom: 1rem;
}

/* 平板及以上 */
@media (min-width: 768px) {
  .card {
    display: inline-block;
    width: calc(50% - 0.5rem);
    margin-right: 1rem;
  }
}

/* 桌面及以上 */
@media (min-width: 1024px) {
  .card {
    width: calc(33.333% - 0.7rem);
  }
}
```

### 2. Flexbox 和 Grid 布局

```css
/* Flexbox: 导航栏 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

/* CSS Grid: 特性卡片 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}
```

### 3. 图片优化

```tsx
// 使用 Next.js Image 组件
import Image from 'next/image';

export function OptimizedImage() {
  return (
    <Image
      src="/images/hero-bg.jpg"
      alt="Hero background"
      width={1280}
      height={720}
      quality={75} // 压缩质量
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
      priority // LCP 优化
    />
  );
}
```

---

## 📦 项目初始化和依赖

### package.json

```json
{
  "name": "insure-official",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next": "^16.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "autoprefixer": "^10",
    "postcss": "^8",
    "tailwindcss": "^3"
  }
}
```

### Next.js 配置 (next.config.ts)

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 图片优化
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // 国际化
  i18n: {
    locales: ['en', 'zh-CN'],
    defaultLocale: 'zh-CN',
  },

  // 性能优化
  swcMinify: true,
  poweredByHeader: false,

  // 实验性功能（如需要）
  experimental: {
    // 缓存组件
    cacheComponents: true,
  },
};

export default nextConfig;
```

---

## 🚀 部署方案

### 部署到 Vercel

```bash
# 1. 连接 Git 仓库
git remote add origin <your-repo-url>
git push -u origin main

# 2. 在 Vercel 仪表板导入项目
# https://vercel.com/new

# 3. 配置环境变量 (如需要)
# NEXT_PUBLIC_API_URL=https://api.insuremo.com

# 4. 部署
vercel deploy --prod
```

### 性能优化检查表

- [ ] 图片已优化并使用 Next.js Image
- [ ] 代码拆分与懒加载已实现
- [ ] 缓存策略已配置 (ISR/DataCache)
- [ ] 字体已预加载
- [ ] SEO 元数据已配置
- [ ] Core Web Vitals 已优化
- [ ] 移动响应性已验证

---

## 📊 项目实施时间表

| 阶段 | 任务 | 时间 |
|------|------|------|
| 1 | 项目初始化和基础设置 | 1-2 天 |
| 2 | 创建核心组件 (Header, Hero, Footer) | 3-4 天 |
| 3 | 实现数据获取和 API 路由 | 2-3 天 |
| 4 | 响应式设计测试与优化 | 2-3 天 |
| 5 | SEO 和性能优化 | 1-2 天 |
| 6 | 测试和 QA | 2-3 天 |
| 7 | 部署和上线 | 1 天 |

**总计**: ~14-18 天

---

## 📚 参考资源

- [Next.js 官方文档](https://nextjs.org/docs)
- [React 19 新特性](https://react.dev)
- [Tailwind CSS 文档](https://tailwindcss.com)
- [Web.dev 性能最佳实践](https://web.dev)
- [MDN Web 文档](https://developer.mozilla.org)

---

## ✅ 下一步操作

1. **批准此方案** - 确认项目方向和目标
2. **设置开发环境** - 初始化 Next.js 项目和依赖
3. **创建组件库** - 逐步实现设计中的各个组件
4. **集成数据** - 连接真实数据源和 API
5. **测试和部署** - 进行全面测试并部署到 Vercel

---

**更新日期**: 2024年2月12日 | **版本**: 1.0 | **状态**: 待审核

