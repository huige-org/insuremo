/**
 * Solutions 页面
 * 展示行业解决方案
 */

import React from "react";
import { PageLayout, Breadcrumb, Section } from "@/components/Layouts";
import styles from "./page.module.css";

export const metadata = {
  title: "Solutions - InsureMO",
  description:
    "Industry-specific insurance solutions and transformation services",
};

export default function SolutionsPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Solutions", href: "/solutions", active: true },
  ];

  const solutions = [
    {
      id: 1,
      title: "Core Modernization",
      description:
        "Modernize legacy insurance systems with cloud-native architecture and microservices.",
      details: [
        "Replace outdated core systems",
        "Reduce operational costs by 40%",
        "Achieve faster time-to-market",
        "Improve system reliability",
      ],
    },
    {
      id: 2,
      title: "Digital Distribution",
      description:
        "Enable multi-channel digital distribution for seamless customer experiences.",
      details: [
        "Online sales platforms",
        "Mobile app integration",
        "Partner ecosystem management",
        "Real-time policy management",
      ],
    },
    {
      id: 3,
      title: "Connected Insurance",
      description:
        "Build open, connected insurance platforms for new business models.",
      details: [
        "API-first architecture",
        "Partner integrations",
        "Real-time data streaming",
        "Ecosystem orchestration",
      ],
    },
  ];

  return (
    <PageLayout
      breadcrumb={<Breadcrumb items={breadcrumbItems} />}
      title="Insurance Solutions"
      subtitle="Transform your business with industry-leading solutions"
      maxWidth="2xl"
    >
      <Section padding="lg">
        <p className={styles.introText}>
          InsureMO provides comprehensive solutions tailored to your insurance
          business needs. From core system modernization to digital
          transformation, we help you achieve your strategic goals.
        </p>
      </Section>

      {solutions.map((solution) => (
        <Section
          key={solution.id}
          padding="lg"
          backgroundColor={solution.id % 2 === 0 ? "var(--gray-50)" : undefined}
          border={solution.id % 2 === 0}
        >
          <div className={styles.solutionCard}>
            <h2 className={styles.solutionTitle}>{solution.title}</h2>
            <p className={styles.solutionDescription}>{solution.description}</p>

            <div className={styles.contentArea}>
              <div className={styles.details}>
                <h3>Key Benefits</h3>
                <ul className={styles.checkList}>
                  {solution.details.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.cta}>
                <button className={styles.learnMoreBtn}>Learn More →</button>
              </div>
            </div>
          </div>
        </Section>
      ))}

      <Section padding="xl" backgroundColor="var(--primary)">
        <div className={styles.ctaSection}>
          <h2>Ready to Accelerate Your Digital Transformation?</h2>
          <p>Let our experts guide you through the journey</p>
          <button className={styles.contactBtn}>Contact Our Team</button>
        </div>
      </Section>
    </PageLayout>
  );
}
