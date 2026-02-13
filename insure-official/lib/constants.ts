/* 项目常量和类型定义 */

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  features: string[];
  color: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
}

export interface NavItem {
  label: string;
  href: string;
}

// 项目配置
export const siteConfig = {
  name: "Insuremo",
  description: "快速、透明、安全的在线保险平台",
  url: "https://insuremo.com",
  language: "zh-CN",
};

// 导航菜单
export const navItems: NavItem[] = [
  { label: "产品", href: "#products" },
  { label: "关于", href: "#about" },
  { label: "定价", href: "#pricing" },
  { label: "博客", href: "/blog" },
  { label: "联系", href: "/contact" },
];
