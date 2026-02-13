import styles from "./Testimonials.module.css";
import TestimonialCard from "./TestimonialCard";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Software Engineer",
    content:
      "The application process is simple and smooth, completed in just 5 minutes. The customer service team is professional and efficient. Highly recommended!",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Freelancer",
    content:
      "Insuremo's pricing is very transparent with no hidden fees. I compared many options, and this is the best value for money.",
    rating: 5,
  },
  {
    id: 3,
    name: "Emily Williams",
    role: "Business Owner",
    content:
      "Our company has been working with Insuremo for 3 years. Their service has always been stable and reliable.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className={styles.testimonials}>
      <div className={styles.container}>
        <h2 className={styles.title}>Customer Reviews</h2>
        <p className={styles.subtitle}>
          Real feedback and trust from thousands of customers
        </p>

        <div className={styles.grid}>
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
