import styles from "./TestimonialCard.module.css";

interface TestimonialCardProps {
  testimonial: {
    id: number;
    name: string;
    role: string;
    content: string;
    rating: number;
  };
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.stars}>
        {[...Array(testimonial.rating)].map((_, i) => (
          <span key={i} className={styles.star}>
            ★
          </span>
        ))}
      </div>
      <p className={styles.content}>"{testimonial.content}"</p>
      <div className={styles.author}>
        <p className={styles.name}>{testimonial.name}</p>
        <p className={styles.role}>{testimonial.role}</p>
      </div>
    </div>
  );
}
