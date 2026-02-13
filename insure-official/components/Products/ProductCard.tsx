import Link from "next/link";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: string;
    features: string[];
    color: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className={`${styles.card} ${styles[product.color]}`}>
      <div className={styles.header}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.description}>{product.description}</p>
      </div>

      <div className={styles.price}>
        <span className={styles.priceLabel}>{product.price}</span>
      </div>

      <ul className={styles.features}>
        {product.features.map((feature, idx) => (
          <li key={idx} className={styles.feature}>
            <span className={styles.checkmark}>✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link href="/contact" className={styles.cta}>
        Free Quote →
      </Link>
    </div>
  );
}
