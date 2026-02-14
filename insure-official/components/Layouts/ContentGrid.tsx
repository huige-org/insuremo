"use client";

/**
 * ContentGrid - 内容卡片网格组件 (优化版)
 * 用于展示 Case Studies, Whitepapers, Videos 等内容
 * 统一布局和悬停效果
 */

import React from "react";
import styles from "./ContentGrid.module.css";

export interface ContentCardData {
  id: string | number;
  image?: string;
  title: string;
  description: string;
  link?: string;
  linkText?: string;
  isVideo?: boolean;
  videoSrc?: string;
  isRichText?: boolean;
}

interface ContentGridProps {
  items: ContentCardData[];
  columns?: 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  onCardClick?: (item: ContentCardData) => void;
}

export default function ContentGrid({
  items,
  columns = 3,
  gap = "lg",
  onCardClick,
}: ContentGridProps) {
  return (
    <div
      className={`${styles.grid} ${styles[`columns-${columns}`]} ${
        styles[`gap-${gap}`]
      }`}
    >
      {items.map((item) => (
        <a
          href={item.link || ""}
          target="_blank"
          rel="noopener noreferrer"
          key={item.id}
          className={`${styles.card} ${styles.consistentCard}`}
          onClick={() => onCardClick?.(item)}
        >
          {item.image && (
            <div
              className={`${styles.imageWrapper} ${styles.consistentWrapper}`}
            >
              {item.isVideo ? (
                // 视频缩略图 - 统一布局
                <div
                  className={`${styles.videoThumbnail} ${styles.consistentLayout}`}
                >
                  <img
                    srcSet={`
                      https://insuremo.com/en/wp-content/uploads/sites/7/2025/06/Insurtech-Insights-Woody-1536x962-1-200x125.png 200w,
                      https://insuremo.com/en/wp-content/uploads/sites/7/2025/06/Insurtech-Insights-Woody-1536x962-1-300x188.png 300w,
                      https://insuremo.com/en/wp-content/uploads/sites/7/2025/06/Insurtech-Insights-Woody-1536x962-1-400x250.png 400w,
                      https://insuremo.com/en/wp-content/uploads/sites/7/2025/06/Insurtech-Insights-Woody-1536x962-1-768x481.png 768w,
                      https://insuremo.com/en/wp-content/uploads/sites/7/2025/06/Insurtech-Insights-Woody-1536x962-1-1024x641.png 1024w,
                      https://insuremo.com/en/wp-content/uploads/sites/7/2025/06/Insurtech-Insights-Woody-1536x962-1-1536x962.png 1536w
                    `}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src="https://insuremo.com/en/wp-content/uploads/sites/7/2025/06/Insurtech-Insights-Woody-1536x962-1-400x250.png"
                    alt={item.title}
                    className={styles.image}
                    loading="lazy"
                  />
                  <div className={styles.playOverlay}>
                    <div className={styles.playButton}>
                      <svg
                        className={styles.playIcon}
                        viewBox="0 0 1024 1024"
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                      >
                        <path
                          d="M224 938.713333a53.58 53.58 0 0 1-53.333333-53.433333V138.72a53.333333 53.333333 0 0 1 80.886666-45.666667l618.666667 373.28a53.333333 53.333333 0 0 1 0 91.333334l-618.666667 373.28a53.16 53.16 0 0 1-27.553333 7.766666z m0.046667-810.666666a10.98 10.98 0 0 0-5.333334 1.42 10.466667 10.466667 0 0 0-5.38 9.253333v746.56a10.666667 10.666667 0 0 0 16.18 9.133333l618.666667-373.28a10.666667 10.666667 0 0 0 0-18.266666l-618.666667-373.28a10.386667 10.386667 0 0 0-5.446666-1.586667z"
                          fill="#2563eb"
                        ></path>
                      </svg>
                      {/* <span className={styles.playIcon}></span> */}
                    </div>
                  </div>
                </div>
              ) : (
                // 普通图片 - 保持一致布局
                <div className={styles.consistentLayout}>
                  <img
                    srcSet={`
                      ${item.image.replace(".png", "-200x125.png")} 200w,
                      ${item.image.replace(".png", "-300x188.png")} 300w,
                      ${item.image.replace(".png", "-400x250.png")} 400w,
                      ${item.image.replace(".png", "-768x481.png")} 768w,
                      ${item.image.replace(".png", "-1024x641.png")} 1024w,
                      ${item.image} 1536w
                    `}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={item.image}
                    alt={item.title}
                    className={styles.image}
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          )}

          <div className={`${styles.content} ${styles.consistentContent}`}>
            <h3 className={`${styles.title} ${styles.consistentTitle}`}>
              {item.title}
            </h3>
            {item.isRichText ? (
              <div
                className={`${styles.description} ${styles.consistentDescription}`}
                dangerouslySetInnerHTML={{
                  __html: item.description.length > 200
                    ? item.description.slice(0, 200) + '...'
                    : item.description
                }}
              />
            ) : (
              <p
                className={`${styles.description} ${styles.consistentDescription}`}
              >
                {item.description.length > 200
                  ? item.description.slice(0, 200) + '...'
                  : item.description}
              </p>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
