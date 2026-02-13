"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./Navigation.module.css";

const navItems = [
  { label: "Platform", href: "/platform" },
  { label: "Solutions", href: "/solutions" },
  {
    label: "Resources",
    submenu: [
      {
        icon: "📄",
        label: "Whitepapers",
        description: "Industry research and strategic guides",
        href: "/resources/whitepapers",
      },
      {
        icon: "📊",
        label: "Case Studies",
        description: "Real-world success stories from customers",
        href: "/resources/case-studies",
      },
      {
        icon: "🎥",
        label: "Videos",
        description: "Tutorials and product demonstrations",
        href: "/resources/videos",
      },
    ],
  },
  { label: "Docs", href: "/docs" },
  { label: "Contact", href: "/contact" },
];

export default function Navigation() {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  return (
    <nav className={styles.nav}>
      <ul className={styles.list}>
        {navItems.map((item) => (
          <li
            key={item.href || item.label}
            className={styles.navItem}
            onMouseEnter={() => item.submenu && setOpenSubmenu(item.label)}
            onMouseLeave={() => setOpenSubmenu(null)}
          >
            {item.href ? (
              <Link href={item.href} className={styles.link}>
                {item.label}
              </Link>
            ) : (
              <button
                className={styles.link}
                onClick={() =>
                  item.submenu &&
                  setOpenSubmenu(item.label === openSubmenu ? null : item.label)
                }
              >
                {item.label}
              </button>
            )}

            {/* 下拉菜单 */}
            {item.submenu && (
              <ul
                className={`${styles.submenu} ${
                  openSubmenu === item.label ? styles.active : ""
                }`}
              >
                {item.submenu.map((subitem) => (
                  <li key={subitem.href} className={styles.submenuItem}>
                    <Link href={subitem.href} className={styles.submenuLink}>
                      <span className={styles.submenuIcon}>{subitem.icon}</span>
                      <div className={styles.submenuContent}>
                        <div className={styles.submenuTitle}>
                          {subitem.label}
                        </div>
                        <div className={styles.submenuDesc}>
                          {subitem.description}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
