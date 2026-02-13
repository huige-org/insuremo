"use client";

/**
 * Section - 内容区块组件
 * 用于包裹各种页面区块，提供一致的间距和布局
 */

import React from "react";
import styles from "./Section.module.css";

interface SectionProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  backgroundColor?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  padding?: "sm" | "md" | "lg" | "xl";
  border?: boolean;
  borderColor?: string;
}

export default function Section({
  id,
  children,
  className = "",
  backgroundColor = "transparent",
  maxWidth = "xl",
  padding = "lg",
  border = false,
  borderColor = "var(--gray-200)",
}: SectionProps) {
  return (
    <section
      id={id}
      className={`${styles.section} ${styles[`padding-${padding}`]} ${styles[`maxWidth-${maxWidth}`]} ${className}`}
      style={{
        backgroundColor,
        borderTop: border ? `1px solid ${borderColor}` : undefined,
      }}
    >
      <div className={styles.container}>{children}</div>
    </section>
  );
}
