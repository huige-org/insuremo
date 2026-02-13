/**
 * Resources 页面 - Whitepapers
 * 展示行业白皮书和研究报告
 */

import {
  PageLayout,
  Breadcrumb,
  Section,
  ContentGrid,
  type ContentCardData,
} from "@/components/Layouts";
import { publicApi, transformArticle } from "@/lib/api";
import styles from "./page.module.css";

export const metadata = {
  title: "Whitepapers - InsureMO",
  description:
    "Download comprehensive whitepapers and industry research reports",
};

export default async function WhitepapersPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Resources", href: "/resources/case-studies" },
    { label: "Whitepapers", href: "/resources/whitepapers", active: true },
  ];

  let whitepapers: ContentCardData[] = [];
  let fallbackData = true;

  try {
    const articles = await publicApi.getArticles();
    whitepapers = articles.map(transformArticle);
    fallbackData = articles.length === 0;
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    fallbackData = true;
  }

  if (fallbackData) {
    whitepapers = [
      {
        id: 1,
        title: "The Future of Digital Insurance",
        description:
          "Explore how digital transformation is reshaping the insurance industry and what it means for your business strategy.",
        link: "#",
        linkText: "Download PDF",
      },
      {
        id: 2,
        title: "API-First Insurance Strategy",
        description:
          "Learn how to build a scalable API ecosystem to power your insurance platform and enable seamless integrations.",
        link: "#",
        linkText: "Download PDF",
      },
      {
        id: 3,
        title: "Global Insurance Trends 2025",
        description:
          "Key insights on emerging markets, regulatory changes, and technology adoption in the global insurance sector.",
        link: "#",
        linkText: "Download PDF",
      },
      {
        id: 4,
        title: "Modernizing Legacy Systems",
        description:
          "Best practices for migrating from legacy insurance systems to cloud-native, API-driven architectures.",
        link: "#",
        linkText: "Download PDF",
      },
      {
        id: 5,
        title: "Customer Experience in InsurTech",
        description:
          "How leading insurers are leveraging technology to deliver superior customer experiences across all touchpoints.",
        link: "#",
        linkText: "Download PDF",
      },
      {
        id: 6,
        title: "Data Analytics for Insurance",
        description:
          "Harness the power of data analytics to improve risk assessment, pricing, and customer retention strategies.",
        link: "#",
        linkText: "Download PDF",
      },
    ];
  }

  return (
    <PageLayout
      breadcrumb={<Breadcrumb items={breadcrumbItems} />}
      title="Industry Whitepapers"
      subtitle="Research-backed insights and strategic guidance for insurance innovators"
    >
      <Section>
        <ContentGrid items={whitepapers} />
      </Section>
    </PageLayout>
  );
}
