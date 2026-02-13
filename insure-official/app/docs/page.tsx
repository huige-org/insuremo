"use client";

/**
 * Docs 页面
 * API 文档和开发者指南
 */

import React, { useState } from "react";
import { PageLayout, Breadcrumb, Section } from "@/components/Layouts";
import styles from "./page.module.css";

export default function DocsPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "getting-started",
  );

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Documentation", href: "/docs", active: true },
  ];

  const docSections = [
    {
      id: "getting-started",
      title: "Getting Started",
      content: [
        {
          title: "Introduction",
          description:
            "Welcome to InsureMO API documentation. This guide will help you integrate insurance APIs into your application.",
        },
        {
          title: "Authentication",
          description:
            "Learn how to authenticate your API requests using API keys and OAuth 2.0.",
        },
        {
          title: "API Keys",
          description:
            "Generate and manage your API keys for secure API access.",
        },
      ],
    },
    {
      id: "api-reference",
      title: "API Reference",
      content: [
        {
          title: "Insurance APIs",
          description:
            "Comprehensive documentation for General, Life, Health, Commercial, Group and Microinsurance APIs.",
        },
        {
          title: "Non-Insurance APIs",
          description:
            "Workflow management, document generation, communication, and payment integration APIs.",
        },
        {
          title: "Error Handling",
          description:
            "Understanding error codes and best practices for error handling.",
        },
      ],
    },
    {
      id: "integrations",
      title: "Integrations & SDKs",
      content: [
        {
          title: "SDKs",
          description: "Official SDKs for Python, JavaScript, Java, and Go.",
        },
        {
          title: "Webhooks",
          description:
            "Set up webhooks to receive real-time notifications about policy changes.",
        },
        {
          title: "Postman Collection",
          description:
            "Import our API collection into Postman for easy testing.",
        },
      ],
    },
    {
      id: "best-practices",
      title: "Best Practices",
      content: [
        {
          title: "Performance",
          description:
            "Tips for optimizing API performance and reducing latency.",
        },
        {
          title: "Security",
          description:
            "Security best practices for handling sensitive insurance data.",
        },
        {
          title: "Rate Limiting",
          description: "Understanding rate limits and quota management.",
        },
      ],
    },
  ];

  return (
    <PageLayout
      breadcrumb={<Breadcrumb items={breadcrumbItems} />}
      title="Documentation"
      subtitle="API Reference and Developer Guide"
      maxWidth="2xl"
    >
      <Section padding="lg">
        <div className={styles.container}>
          {/* Sidebar Navigation */}
          <div className={styles.sidebar}>
            <h3 className={styles.sidebarTitle}>Documentation</h3>
            <nav className={styles.sidebarNav}>
              {docSections.map((section) => (
                <div key={section.id}>
                  <button
                    className={`${styles.navItem} ${expandedSection === section.id ? styles.active : ""}`}
                    onClick={() =>
                      setExpandedSection(
                        expandedSection === section.id ? null : section.id,
                      )
                    }
                  >
                    <span>{section.title}</span>
                    <span className={styles.arrow}>▾</span>
                  </button>
                  {expandedSection === section.id && (
                    <div className={styles.subItems}>
                      {section.content.map((item, idx) => (
                        <div key={idx} className={styles.subItem}>
                          {item.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className={styles.content}>
            {expandedSection &&
              docSections.find((s) => s.id === expandedSection) && (
                <div>
                  <h2 className={styles.sectionTitle}>
                    {docSections.find((s) => s.id === expandedSection)?.title}
                  </h2>

                  <div className={styles.articles}>
                    {docSections
                      .find((s) => s.id === expandedSection)
                      ?.content.map((article, idx) => (
                        <article key={idx} className={styles.article}>
                          <h3 className={styles.articleTitle}>
                            {article.title}
                          </h3>
                          <p className={styles.articleDescription}>
                            {article.description}
                          </p>
                          <a href="#" className={styles.readMore}>
                            Read More →
                          </a>
                        </article>
                      ))}
                  </div>
                </div>
              )}

            {!expandedSection && (
              <div className={styles.welcome}>
                <h2>Welcome to Documentation</h2>
                <p>
                  Select a section from the left menu to get started with
                  InsureMO API documentation.
                </p>
                <div className={styles.quickLinks}>
                  <h3>Quick Links</h3>
                  <ul>
                    <li>
                      <a href="#">API Keys & Authentication</a>
                    </li>
                    <li>
                      <a href="#">Insurance APIs</a>
                    </li>
                    <li>
                      <a href="#">Non-Insurance APIs</a>
                    </li>
                    <li>
                      <a href="#">SDKs & Libraries</a>
                    </li>
                    <li>
                      <a href="#">Webhooks</a>
                    </li>
                    <li>
                      <a href="#">Code Examples</a>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section padding="xl" backgroundColor="var(--primary-light)">
        <div className={styles.ctaSection}>
          <h2>Need Help?</h2>
          <p>
            Can't find what you're looking for? Contact our developer support
            team or check out our API status page.
          </p>
          <div className={styles.ctaButtons}>
            <button className={styles.primaryButton}>Contact Support</button>
            <button className={styles.secondaryButton}>API Status</button>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
}
