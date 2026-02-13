import styles from "./Pricing.module.css";
import Button from "@/components/Common/Button";

export default function Pricing() {
  return (
    <section className={styles.pricing} id="pricing">
      <div className={styles.container}>
        <h2 className={styles.title}>Transparent Pricing</h2>
        <p className={styles.subtitle}>
          No hidden fees. Choose the plan that works best for you
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h3 className={styles.plan}>Basic Plan</h3>
            <p className={styles.price}>
              $199 <span className={styles.month}>/month</span>
            </p>
            <ul className={styles.features}>
              <li>✓ Basic Coverage</li>
              <li>✓ Phone Support</li>
              <li>✓ Online Claims</li>
              <li>✗ Priority Claims</li>
              <li>✗ Personal Agent</li>
            </ul>
            <Button href="/contact" variant="secondary">
              Choose Plan
            </Button>
          </div>

          <div className={`${styles.card} ${styles.featured}`}>
            <div className={styles.badge}>Most Popular</div>
            <h3 className={styles.plan}>Professional Plan</h3>
            <p className={styles.price}>
              $399 <span className={styles.month}>/month</span>
            </p>
            <ul className={styles.features}>
              <li>✓ Comprehensive Coverage</li>
              <li>✓ 24/7 Priority Support</li>
              <li>✓ Fast Online Claims</li>
              <li>✓ Priority Claims Processing</li>
              <li>✗ Personal Agent</li>
            </ul>
            <Button href="/contact" variant="secondary">
              Choose Plan
            </Button>
          </div>

          <div className={styles.card}>
            <h3 className={styles.plan}>Enterprise Plan</h3>
            <p className={styles.price}>
              $699 <span className={styles.month}>/month</span>
            </p>
            <ul className={styles.features}>
              <li>✓ Enterprise Coverage</li>
              <li>✓ 24/7 Dedicated Support</li>
              <li>✓ Priority Claims Processing</li>
              <li>✓ Personal Account Manager</li>
              <li>✓ Customized Solutions</li>
            </ul>
            <Button href="/contact" variant="secondary">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
