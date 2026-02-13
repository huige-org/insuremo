import styles from "./Products.module.css";
import ProductCard from "./ProductCard";

const products = [
  {
    id: 1,
    name: "Auto Insurance",
    description: "Comprehensive vehicle protection plan",
    price: "From $599/year",
    features: [
      "Collision Coverage",
      "Theft Protection",
      "24/7 Roadside Assistance",
      "Glass Breakage Coverage",
    ],
    color: "primary",
  },
  {
    id: 2,
    name: "Home Insurance",
    description: "Protect your home and belongings",
    price: "From $799/year",
    features: [
      "Structure Protection",
      "Personal Property Coverage",
      "Liability Coverage",
      "Additional Living Expenses",
    ],
    color: "secondary",
  },
  {
    id: 3,
    name: "Life Insurance",
    description: "Secure your family's future",
    price: "From $399/year",
    features: [
      "Death Benefit",
      "Disability Coverage",
      "Medical Assistance",
      "Premium Waiver",
    ],
    color: "accent",
  },
];

export default function Products() {
  return (
    <section className={styles.products} id="products">
      <div className={styles.container}>
        <h2 className={styles.title}>Our Products</h2>
        <p className={styles.subtitle}>
          Choose the insurance plan that fits your needs and get comprehensive
          protection
        </p>

        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
