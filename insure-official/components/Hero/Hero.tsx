"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "./Hero.module.css";
import Button from "@/components/Common/Button";

export default function Hero() {
  const floatingCards = [
    {
      id: 1,
      title: "Digital Insurance Product Library",
      icon: "🔧",
      className: styles.card1,
      items: ["Country-specific products", "Product variations"],
    },
    {
      id: 2,
      title: "Insurance APIs",
      icon: "⚙️",
      className: styles.card2,
      items: ["Quotation", "Proposal", "Endorsement"],
    },
    {
      id: 3,
      title: "General Insurance APIs",
      icon: "🛡️",
      className: styles.card3,
      featured: true,
    },
    {
      id: 4,
      title: "Life Insurance APIs",
      icon: "❤️",
      className: styles.card4,
      featured: true,
    },
    {
      id: 5,
      title: "Health Insurance APIs",
      icon: "💊",
      className: styles.card5,
      featured: true,
    },
    {
      id: 6,
      title: "LOBs",
      icon: "📊",
      className: styles.card6,
    },
  ];

  // 品牌轮播数据
  const brandPartners = [
    { id: 1, name: "S.GLOBAL", logo: "S.GLOBAL" },
    { id: 2, name: "bKash", logo: "bKash" },
    { id: 3, name: "viettel", logo: "viettel" },
    { id: 4, name: "CRED", logo: "CRED" },
    { id: 5, name: "VOL", logo: "VOL" },
    { id: 6, name: "AXA", logo: "AXA" },
    { id: 7, name: "Allianz", logo: "Allianz" },
    { id: 8, name: "Munich RE", logo: "Munich RE" },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const slidesToShow = 4; // 每次显示4个品牌

  // 自动轮播
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(
        (prev) => (prev + 1) % Math.ceil(brandPartners.length / slidesToShow)
      );
    }, 3000); // 每3秒切换一次

    return () => clearInterval(interval);
  }, [brandPartners.length, slidesToShow]);

  // 获取当前显示的品牌
  const getCurrentBrands = () => {
    const startIndex = currentSlide * slidesToShow;
    const endIndex = startIndex + slidesToShow;
    return [
      ...brandPartners.slice(startIndex, endIndex),
      ...brandPartners.slice(0, Math.max(0, endIndex - brandPartners.length)),
    ];
  };

  return (
    <section className={styles.hero}>
      {/* 背景装饰 */}
      <div className={styles.backgroundDecorations}>
        <div className={styles.blob}></div>
        <div className={styles.blob2}></div>
      </div>

      {/* 内容区域 */}
      <div className={styles.content}>
        <div className={styles.container}>
          {/* 左侧文字内容 */}
          <div className={styles.textContent}>
            <h1 className={styles.title}>
              Power any App,
              <br />
              Launch any Product,
              <br />
              <span className={styles.highlight}>Connect any Channel</span>
            </h1>
            <p className={styles.subtitle}>
              InsureMO enables insurers, brokers, and insurtechs to innovate
              faster with 17,500+ products, 10,000+ APIs, and seamless
              connectivity across ecosystems. Transform legacy systems and scale
              your digital insurance strategy globally.
            </p>
            <div className={styles.ctaGroup}>
              <Button
                href="/contact"
                variant="primary"
                size="lg"
                className={styles.ctaButton}
              >
                Get Started
                <span className={styles.arrow}>→</span>
              </Button>
              {/* <button className={styles.circleButton}>
                <span>→</span>
              </button> */}
            </div>
          </div>

          {/* 右侧图像和浮动卡片 */}
          <div className={styles.imageContainer}>
            {/* 主图像 */}
            <div className={styles.mainImage}>
              <div className={styles.imagePlaceholder}>
                <div className={styles.placeholderContent}>
                  <Image
                    src="https://insuremo.com/en/wp-content/uploads/sites/7/2025/03/insuremo-site-elements-1100-x-770px-3-668x654.png"
                    alt="InsureMO Platform Features"
                    width={668}
                    height={654}
                    priority
                    unoptimized
                    className={styles.heroImage}
                  />
                </div>
              </div>
            </div>

            {/* 浮动卡片容器 */}
            <div className={styles.floatingCardsContainer}>
              {floatingCards.map((card) => (
                <div
                  key={card.id}
                  className={`${styles.floatingCard} ${card.className}`}
                >
                  <div className={styles.cardContent}>
                    {card.featured ? (
                      <>
                        <div className={styles.cardIcon}>{card.icon}</div>
                        <p className={styles.cardTitle}>{card.title}</p>
                      </>
                    ) : (
                      <>
                        {card.id === 1 && (
                          <>
                            <div className={styles.cardHeader}>
                              <span className={styles.cardIcon}>
                                {card.icon}
                              </span>
                              <h3 className={styles.cardTitle}>{card.title}</h3>
                            </div>
                            <ul className={styles.cardItems}>
                              {card.items?.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </>
                        )}
                        {card.id === 2 && (
                          <>
                            <div className={styles.cardHeader}>
                              <span className={styles.cardIcon}>
                                {card.icon}
                              </span>
                              <h3 className={styles.cardTitle}>{card.title}</h3>
                            </div>
                            <div className={styles.cardGrid}>
                              {card.items?.map((item, idx) => (
                                <div key={idx} className={styles.gridItem}>
                                  <div className={styles.gridIcon}>📋</div>
                                  <p>{item}</p>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                        {card.id === 6 && (
                          <>
                            <div className={styles.cardIcon}>{card.icon}</div>
                            <p className={styles.cardTitle}>{card.title}</p>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Brand Partners Carousel */}
      <div className={styles.brandsCarousel}>
        <div className={styles.brandsHeader}>
          <h3 className={styles.brandsTitle}>Trusted by Industry Leaders</h3>
          <div className={styles.carouselControls}>
            <button
              className={styles.navButton}
              onClick={() =>
                setCurrentSlide((prev) =>
                  prev === 0
                    ? Math.ceil(brandPartners.length / slidesToShow) - 1
                    : prev - 1
                )
              }
              aria-label="Previous slide"
            >
              ←
            </button>
            <button
              className={styles.navButton}
              onClick={() =>
                setCurrentSlide(
                  (prev) =>
                    (prev + 1) % Math.ceil(brandPartners.length / slidesToShow)
                )
              }
              aria-label="Next slide"
            >
              →
            </button>
          </div>
        </div>

        <div className={styles.carouselWrapper}>
          <div className={styles.carouselTrack}>
            {getCurrentBrands().map((brand, index) => (
              <div key={`${brand.id}-${index}`} className={styles.brandSlide}>
                <div className={styles.brandLogo}>{brand.logo}</div>
              </div>
            ))}
          </div>

          {/* 指示器 */}
          <div className={styles.indicators}>
            {Array.from({
              length: Math.ceil(brandPartners.length / slidesToShow),
            }).map((_, index) => (
              <button
                key={index}
                className={`${styles.indicator} ${
                  index === currentSlide ? styles.active : ""
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
