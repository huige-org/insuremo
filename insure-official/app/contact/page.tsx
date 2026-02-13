"use client";

/**
 * Contact 页面
 * 联系表单和联系信息
 */

import React, { useState } from "react";
import { PageLayout, Breadcrumb, Section } from "@/components/Layouts";
import styles from "./page.module.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Contact", href: "/contact", active: true },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", company: "", message: "" });
        // Reset status after 5 seconds
        setTimeout(() => setSubmitStatus("idle"), 5000);
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      breadcrumb={<Breadcrumb items={breadcrumbItems} />}
      title="Contact Us"
      subtitle="Get in touch with our team"
      maxWidth="2xl"
    >
      <Section padding="lg">
        <div className={styles.container}>
          {/* Contact Info */}
          <div className={styles.infoSection}>
            <h2 className={styles.sectionTitle}>Get in Touch</h2>
            <p className={styles.description}>
              Have questions about InsureMO? Our team is here to help. Fill out
              the form and we'll get back to you within 24 hours.
            </p>

            <div className={styles.contactInfo}>
              <div className={styles.infoItem}>
                <h3>📧 Email</h3>
                <p>
                  <a href="mailto:sales@insuremo.com">sales@insuremo.com</a>
                </p>
              </div>

              <div className={styles.infoItem}>
                <h3>📞 Phone</h3>
                <p>
                  <a href="tel:+1-800-123-4567">+1 (800) 123-4567</a>
                </p>
              </div>

              <div className={styles.infoItem}>
                <h3>📍 Address</h3>
                <p>
                  InsureMO Headquarters
                  <br />
                  123 Tech Street
                  <br />
                  San Francisco, CA 94102
                  <br />
                  United States
                </p>
              </div>

              <div className={styles.infoItem}>
                <h3>🕒 Business Hours</h3>
                <p>
                  Monday - Friday: 9:00 AM - 6:00 PM (PST)
                  <br />
                  Saturday - Sunday: Closed
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Send us a Message</h2>

            {submitStatus === "success" && (
              <div className={styles.successMessage}>
                ✓ Thank you! We've received your message and will get back to
                you soon.
              </div>
            )}

            {submitStatus === "error" && (
              <div className={styles.errorMessage}>
                ✗ Something went wrong. Please try again or contact us directly.
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="company">Company</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Your Company"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us how we can help..."
                  rows={6}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.submitButton}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </Section>

      {/* Additional CTA */}
      <Section padding="xl" backgroundColor="var(--primary-light)">
        <div className={styles.ctaSection}>
          <h2>Ready to Transform Your Insurance Business?</h2>
          <p>Schedule a demo with our product team today.</p>
          <button className={styles.ctaButton}>Schedule a Demo</button>
        </div>
      </Section>
    </PageLayout>
  );
}
