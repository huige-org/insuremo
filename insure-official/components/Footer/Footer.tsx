"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Footer.module.css";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 模拟订阅请求
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    } catch (error) {
      console.error("Subscribe failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* 上部：链接和邮件订阅 */}
        <div className={styles.topSection}>
          <div className={styles.logoSection}>
            <Link href="/" className={styles.logo}>
              Insuremo
            </Link>
            <p className={styles.tagline}>
              Simplify Insurance, Secure Your Future
            </p>
          </div>

          {/* Navigation Links */}
          <div className={styles.linksGrid}>
            <div className={styles.linksColumn}>
              <h4>Products</h4>
              <ul>
                <li>
                  <Link href="/#products">Auto Insurance</Link>
                </li>
                <li>
                  <Link href="/#products">Home Insurance</Link>
                </li>
                <li>
                  <Link href="/#products">Life Insurance</Link>
                </li>
              </ul>
            </div>

            <div className={styles.linksColumn}>
              <h4>Company</h4>
              <ul>
                <li>
                  <Link href="/">About Us</Link>
                </li>
                <li>
                  <Link href="/">Blog</Link>
                </li>
                <li>
                  <Link href="/">Careers</Link>
                </li>
              </ul>
            </div>

            <div className={styles.linksColumn}>
              <h4>Support</h4>
              <ul>
                <li>
                  <Link href="/">FAQ</Link>
                </li>
                <li>
                  <Link href="/contact">Contact Us</Link>
                </li>
                <li>
                  <Link href="/">Privacy Policy</Link>
                </li>
              </ul>
            </div>

            {/* Newsletter Subscription */}
            <div className={styles.subscribeColumn}>
              <h4>Newsletter</h4>
              <form onSubmit={handleSubscribe}>
                <div className={styles.subscribeForm}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button type="submit" disabled={loading}>
                    {loading ? "..." : "Subscribe"}
                  </button>
                </div>
              </form>
              {subscribed && (
                <p className={styles.successMessage}>
                  ✓ Thank you for subscribing!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom: Social Media and Copyright */}
        <div className={styles.bottomSection}>
          <div className={styles.social}>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              title="Twitter"
            >
              𝕏
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
            >
              f
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
            >
              in
            </a>
          </div>
          <p className={styles.copyright}>
            &copy; 2024 Insuremo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
