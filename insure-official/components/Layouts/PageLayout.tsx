"use client";

/**
 * PageLayout - 通用页面布局组件
 * 用于产品页、解决方案页等内部页面
 */

import React from "react";
import styles from "./PageLayout.module.css";

interface PageLayoutProps {
  breadcrumb?: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  backgroundColor?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export default function PageLayout({
  breadcrumb,
  title,
  subtitle,
  children,
  backgroundColor = "#ffffff",
  maxWidth = "xl",
}: PageLayoutProps) {
  return (
    <div className={styles.layout} style={{ backgroundColor }}>
      {/* Breadcrumb */}
      {breadcrumb && <div className={styles.breadcrumb}>{breadcrumb}</div>}

      {/* Page Header */}
      <div className={styles.header}>
        <div className={styles.container}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>

      {/* Main Content */}
      <div className={`${styles.content} ${styles[`maxWidth-${maxWidth}`]}`}>
        {children}
      </div>
    </div>
  );
}
