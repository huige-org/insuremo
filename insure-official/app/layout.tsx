import type { Metadata } from "next";
import { Albert_Sans, Open_Sans } from "next/font/google";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import "./globals.css";

// 导入 Google Fonts
const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-family-heading",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-family-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InsureMO - 保险中间办公平台",
  description:
    "InsureMO 提供企业级保险 API 和数字化保险平台解决方案，帮助保险公司、中介和经销商加速数字转型",
  keywords: ["保险", "API", "数字保险", "平台", "中间办公"],
  metadataBase: new URL("https://insuremo.com"),
  openGraph: {
    title: "InsureMO - 保险中间办公平台",
    description: "企业级保险 API 和数字平台解决方案",
    type: "website",
    locale: "zh_CN",
  },
  maker: "InsureMO",
  creator: "InsureMO",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      className={`${albertSans.variable} ${openSans.variable}`}
    >
      <head>
        <meta name="theme-color" content="#696969" />
        <link rel="icon" href="/favicon.ico" />
        {/* 预加载关键字体 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
