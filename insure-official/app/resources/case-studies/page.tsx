/**
 * Resources 页面 - Case Studies
 * 展示客户案例
 */

import {
  PageLayout,
  Breadcrumb,
  Section,
  ContentGrid,
  type ContentCardData,
} from "@/components/Layouts";
import { publicApi, transformCase } from "@/lib/api";
import styles from "./page.module.css";

export const metadata = {
  title: "Case Studies - InsureMO",
  description: "Real-world success stories from our customers",
};

export default async function CaseStudiesPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Resources", href: "/resources" },
    { label: "Case Studies", href: "/resources/case-studies", active: true },
  ];

  let caseStudies: ContentCardData[] = [];
  let fallbackData = true;

  try {
    const data = await publicApi.getCases();
    caseStudies = data.map(transformCase);
    fallbackData = data.length === 0;
  } catch (error) {
    console.error('Failed to fetch cases:', error);
    fallbackData = true;
  }

  if (fallbackData) {
    caseStudies = [
      {
        id: 1,
        title: "Ergo: DevOps Application Platform",
        description:
          "Transforming the Insurance Landscape with Agile and Scalable Solutions. InsureMO DevOps platform accelerated product launches.",
        link: "#",
        linkText: "Read case study",
      },
      {
        id: 2,
        title: "Aegon Life India: Digital Channels",
        description:
          "Embracing Digital Channels for Enhanced Customer Experience. Aegon Life India integrated InsureMO to accelerate digital product launch.",
        link: "#",
        linkText: "Read case study",
      },
      {
        id: 3,
        title: "VSure: On-Demand Digital Insurance",
        description:
          "Pioneering accessible and inclusive insurance. VSure leveraged InsureMO to become Malaysia's first on-demand digital insurer.",
        link: "#",
        linkText: "Read case study",
      },
      {
        id: 4,
        title: "India's Largest Insurer: Faster Time-to-Market",
        description:
          "Achieving faster time-to-market across digital channels. InsureMO architecture enables rapid channel onboarding and lower costs.",
        link: "#",
        linkText: "Read case study",
      },
    ];
  }

  return (
    <PageLayout
      breadcrumb={<Breadcrumb items={breadcrumbItems} />}
      title="Case Studies"
      subtitle="Real-world success stories from our customers"
      maxWidth="2xl"
    >
      <Section padding="lg">
        <p className={styles.introText}>
          Discover how leading insurance companies and digital insurers have
          transformed their businesses with InsureMO. From core modernization to
          digital distribution, see how we deliver measurable results.
        </p>
      </Section>

      <Section padding="lg">
        <ContentGrid items={caseStudies} columns={2} gap="lg" />
      </Section>

      <Section padding="xl" backgroundColor="var(--primary-light)">
        <div className={styles.ctaSection}>
          <h2>Want to see how InsureMO can help your business?</h2>
          <p>
            Schedule a demo with our product team to explore tailored solutions.
          </p>
          <button className={styles.scheduleBtn}>Schedule a Demo</button>
        </div>
      </Section>
    </PageLayout>
  );
}
