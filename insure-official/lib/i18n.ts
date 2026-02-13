/**
 * i18n 配置 - 国际化支持
 * 支持: 英文 (en), 日文 (ja), 葡萄牙文 (pt)
 */

export type Locale = "en" | "ja" | "pt";

export const defaultLocale: Locale = "en";
export const locales: Locale[] = ["en", "ja", "pt"];

// 页面的本地化路由规则
export function getLocalizedPath(locale: Locale, path: string): string {
  if (locale === defaultLocale) {
    return path;
  }
  return `/${locale}${path}`;
}

export function parseLocalizedPath(pathname: string): {
  locale: Locale;
  path: string;
} {
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 0) {
    return { locale: defaultLocale, path: "/" };
  }

  if ((locales as string[]).includes(parts[0])) {
    const locale = parts[0] as Locale;
    const path = "/" + parts.slice(1).join("/");
    return { locale, path: path || "/" };
  }

  return { locale: defaultLocale, path: pathname };
}

// 国际化内容示例
export const i18nContent = {
  en: {
    nav: {
      home: "Home",
      platform: "Platform",
      solutions: "Solutions",
      resources: "Resources",
      company: "Company",
      contact: "Contact",
    },
    cta: {
      learnMore: "Learn More",
      getStarted: "Get Started",
      contactSales: "Contact Sales",
    },
  },
  ja: {
    nav: {
      home: "ホーム",
      platform: "プラットフォーム",
      solutions: "ソリューション",
      resources: "リソース",
      company: "企業情報",
      contact: "お問い合わせ",
    },
    cta: {
      learnMore: "詳細を見る",
      getStarted: "今すぐ開始",
      contactSales: "セールスに連絡",
    },
  },
  pt: {
    nav: {
      home: "Início",
      platform: "Plataforma",
      solutions: "Soluções",
      resources: "Recursos",
      company: "Empresa",
      contact: "Contato",
    },
    cta: {
      learnMore: "Saiba Mais",
      getStarted: "Começar Agora",
      contactSales: "Falar com Vendas",
    },
  },
};

export type I18nContent = (typeof i18nContent)["en"];

export function getI18nContent(locale: Locale): I18nContent {
  return i18nContent[locale] || i18nContent[defaultLocale];
}
