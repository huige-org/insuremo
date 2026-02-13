import styles from "./CTA.module.css";
import Button from "@/components/Common/Button";

export default function CTA() {
  return (
    <section className={styles.cta}>
      <div className={styles.container}>
        <h2 className={styles.title}>Ready to Protect Your Future?</h2>
        <p className={styles.subtitle}>
          Join thousands of customers who trust Insuremo
        </p>
        <div className={styles.ctaButtons}>
          <Button
            href="/contact"
            variant="primary"
            size="lg"
            className={styles.ctaButton}
          >
            Get Quote Now
          </Button>
          <Button href="/learn-more" variant="secondary" size="lg">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
}
