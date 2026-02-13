/**
 * Platform 页面
 * 展示保险 API 平台信息
 */

import React from "react";
import {
  PageLayout,
  Breadcrumb,
  Section,
  ContentGrid,
} from "@/components/Layouts";
import styles from "./page.module.css";

export const metadata = {
  title: "Platform - InsureMO",
  description: "Insurance API Platform - Digital Insurance Solutions",
};

export default function PlatformPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Platform", href: "/platform", active: true },
  ];

  const platformCards = [
    {
      id: 1,
      title: "Insurance APIs",
      description:
        "General, Life, Health, Commercial, Group and Microinsurance APIs for comprehensive insurance solutions.",
      link: "#",
      linkText: "Learn more",
    },
    {
      id: 2,
      title: "Non-Insurance APIs",
      description:
        "Workflow management, document generation, communication, and payment integration APIs.",
      link: "#",
      linkText: "Learn more",
    },
    {
      id: 3,
      title: "Utility Admin",
      description:
        "Product configuration, DevOps tools, and API management for complete platform control.",
      link: "#",
      linkText: "Learn more",
    },
  ];

  return (
    <PageLayout
      breadcrumb={<Breadcrumb items={breadcrumbItems} />}
      title="Platform Components"
      subtitle="Comprehensive Insurance API Solutions"
      maxWidth="2xl"
    >
      <Section padding="lg">
        <div className={styles.introSection}>
          <p className={styles.introText}>
            InsureMO Platform provides enterprise-grade APIs and components for
            building digital insurance solutions. Our modular architecture
            enables fast integration and seamless scalability.
          </p>
        </div>
      </Section>

      <Section padding="lg" backgroundColor="var(--gray-50)" border>
        <h2 className={styles.sectionTitle}>Key Platform Components</h2>
        <ContentGrid items={platformCards} columns={3} gap="lg" />
      </Section>

      <Section padding="lg">
        <h2 className={styles.sectionTitle}>Why Choose InsureMO?</h2>
        <ul className={styles.featuresList}>
          <li>
            <strong>Fast Integration:</strong> RESTful APIs with comprehensive
            documentation
          </li>
          <li>
            <strong>Enterprise Grade:</strong> 99.9% uptime SLA, global CDN
            distribution
          </li>
          <li>
            <strong>Scalable:</strong> Microservices architecture supporting
            unlimited growth
          </li>
          <li>
            <strong>Secure:</strong> Bank-level encryption and compliance
            certifications
          </li>
          <li>
            <strong>Developer Friendly:</strong> SDKs in multiple languages,
            sandbox environment
          </li>
        </ul>
      </Section>

      <Section padding="lg" backgroundColor="var(--primary-light)" border>
        <div className={styles.ctaSection}>
          <h2>Ready to Transform Your Insurance Business?</h2>
          <p>Contact our sales team to explore how InsureMO can help.</p>
          <button className={styles.ctaButton}>Get Started</button>
        </div>
      </Section>
    </PageLayout>
  );
}
