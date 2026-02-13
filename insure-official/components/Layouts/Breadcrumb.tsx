"use client";

/**
 * Breadcrumb - Breadcrumb Navigation Component
 * Modern design with smooth animations
 */

import React from "react";
import Link from "next/link";
import styles from "./Breadcrumb.module.css";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: string;
}

export default function Breadcrumb({
  items,
  separator = "/",
}: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
      <ol className={styles.list}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <li className={styles.item}>
              {item.href && !item.active ? (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span className={item.active ? styles.active : ""}>
                  {item.label}
                </span>
              )}
            </li>
            {index < items.length - 1 && (
              <li className={styles.separatorItem} aria-hidden="true">
                <span className={styles.separator}>{separator}</span>
              </li>
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
