import styles from "./FeatureCard.module.css";

interface FeatureCardProps {
  feature: {
    id: number;
    icon: string;
    title: string;
    description: string;
  };
}

export default function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.iconContainer}>
        <span className={styles.icon}>{feature.icon}</span>
      </div>
      <h3 className={styles.title}>{feature.title}</h3>
      <p className={styles.description}>{feature.description}</p>
    </div>
  );
}
