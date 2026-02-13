import Hero from "@/components/Hero/Hero";
import Features from "@/components/Features/Features";
import Products from "@/components/Products/Products";
import Testimonials from "@/components/Testimonials/Testimonials";
import Pricing from "@/components/Pricing/Pricing";
import CTA from "@/components/CTA/CTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Products />
      <Testimonials />
      <Pricing />
      <CTA />
    </>
  );
}
