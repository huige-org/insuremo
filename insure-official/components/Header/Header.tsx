"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navigation from "./Navigation";
import styles from "./Header.module.css";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>Insuremo</span>
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.desktopNav}>
          <Navigation />
        </div>

        {/* CTA Button */}
        <Link href="/contact" className={styles.ctaButton}>
          Get Started
        </Link>

        {/* Mobile Menu Button */}
        <button
          className={`${styles.mobileMenuBtn} ${isMobileMenuOpen ? styles.active : ""}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className={styles.mobileMenu}>
            <Navigation />
            <Link href="/contact" className={styles.mobileCTA}>
              Get Started
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
