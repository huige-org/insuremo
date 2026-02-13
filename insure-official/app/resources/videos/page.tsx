/**
 * Resources 页面 - Videos (优化版)
 * 展示教程和演示视频，统一布局和悬停效果
 */

import {
  PageLayout,
  Breadcrumb,
  Section,
  ContentGrid,
  type ContentCardData,
} from "@/components/Layouts";
import { publicApi, transformVideo } from "@/lib/api";
import styles from "./page.module.css";

export const metadata = {
  title: "Videos - InsureMO",
  description: "Watch tutorials, product demonstrations, and expert interviews",
};

export default async function VideosPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Resources", href: "/resources/case-studies" },
    { label: "Videos", href: "/resources/videos", active: true },
  ];

  let videos: ContentCardData[] = [];
  let fallbackData = true;

  try {
    const data = await publicApi.getVideos();
    videos = data.map(transformVideo);
    fallbackData = data.length === 0;
  } catch (error) {
    console.error('Failed to fetch videos:', error);
    fallbackData = true;
  }

  if (fallbackData) {
    videos = [
      {
        id: 1,
        title: "Insurtech Insights Europe 2025",
        description:
          "Affinity Powerhouse: Unleashing the Potential of Niche Markets through Strategic Partnerships",
        image:
          "https://insuremo.com/en/wp-content/uploads/sites/7/2025/06/Insurtech-Insights-Woody-1536x962-1.png",
        link: "https://player.vimeo.com/video/1090283236",
        linkText: "Watch Video",
        isVideo: true,
      },
      {
        id: 2,
        title: "Getting Started with InsureMO",
        description:
          "A comprehensive walkthrough of the InsureMO platform, from onboarding to your first API integration.",
        image:
          "https://insuremo.com/en/wp-content/uploads/sites/7/2025/06/Insurtech-Insights-Woody-1536x962-1-400x250.png",
        link: "#",
        linkText: "Watch Video",
        isVideo: true,
      },
      {
        id: 3,
        title: "Building Your First Insurance Product",
        description:
          "Learn how to leverage the Digital Insurance Product Library to launch your insurance products in days, not months.",
        image:
          "https://insuremo.com/en/wp-content/uploads/sites/7/2025/06/Insurtech-Insights-Woody-1536x962-1-768x481.png",
        link: "#",
        linkText: "Watch Video",
        isVideo: true,
      },
      {
        id: 4,
        title: "API Integration Best Practices",
        description:
          "Expert tips and tricks for integrating InsureMO APIs into your existing systems with minimal disruption.",
        image:
          "https://insuremo.com/en/wp-content/uploads/sites/7/2025/06/Insurtech-Insights-Woody-1536x962-1-1024x641.png",
        link: "#",
        linkText: "Watch Video",
        isVideo: true,
      },
      {
        id: 5,
        title: "Scaling Your Insurance Operations",
        description:
          "See how leading insurers use InsureMO to scale their digital operations and reach new markets globally.",
        image:
          "https://insuremo.com/en/wp-content/uploads/sites/7/2025/06/Insurtech-Insights-Woody-1536x962-1-300x188.png",
        link: "#",
        linkText: "Watch Video",
        isVideo: true,
      },
      {
        id: 6,
        title: "Advanced Analytics & Reporting",
        description:
          "Dive deep into InsureMO's analytics capabilities to gain actionable insights from your insurance data.",
        image:
          "https://insuremo.com/en/wp-content/uploads/sites/7/2025/06/Insurtech-Insights-Woody-1536x962-1-200x125.png",
        link: "#",
        linkText: "Watch Video",
        isVideo: true,
      },
    ];
  }

  return (
    <PageLayout
      breadcrumb={<Breadcrumb items={breadcrumbItems} />}
      title="Video Tutorials & Demos"
      subtitle="Visual guides and success stories from our InsureMO community"
    >
      <Section>
        <ContentGrid items={videos} columns={3} gap="lg" />
      </Section>
    </PageLayout>
  );
}
