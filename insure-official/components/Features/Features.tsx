import styles from "./Features.module.css";
import FeatureCard from "./FeatureCard";

const features = [
  {
    id: 1,
    icon: "⚡",
    title: "Quick Application",
    description:
      "Complete your online application in just 5 minutes and get an instant quote",
  },
  {
    id: 2,
    icon: "🔒",
    title: "Secure & Reliable",
    description:
      "Bank-level 256-bit encryption ensures your information is safe with us",
  },
  {
    id: 3,
    icon: "💬",
    title: "24/7 Support",
    description:
      "Round-the-clock customer support with multilingual assistance",
  },
  {
    id: 4,
    icon: "✨",
    title: "Transparent Pricing",
    description:
      "No hidden fees, clear pricing comparison, find the best plan for you",
  },
  {
    id: 5,
    icon: "📱",
    title: "Mobile App",
    description:
      "Manage your policies anytime, anywhere with our mobile application",
  },
  {
    id: 6,
    icon: "🏆",
    title: "Industry Leading",
    description: "Awarded Best Insurance Platform for 3 consecutive years",
  },
];

export default function Features() {
  return (
    <section className={styles.features} id="features">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Why Choose Us</h2>
          <p className={styles.subtitle}>
            Best insurance solutions, premium service quality, and
            industry-leading innovative technology
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
