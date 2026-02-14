import { notFound } from "next/navigation";

export const revalidate = 120;

import {
  PageLayout,
  Breadcrumb,
  Section,
} from "@/components/Layouts";
import { publicApi } from "@/lib/api";
import styles from "../page.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    const data = await publicApi.getVideoById(id);
    return {
      title: `${data.title} - Videos - InsureMO`,
      description: data.description || "",
    };
  } catch {
    return {
      title: "Video - InsureMO",
    };
  }
}

export default async function VideoDetailPage({ params }: Props) {
  const { id } = await params;

  let data;
  try {
    data = await publicApi.getVideoById(id);
  } catch {
    notFound();
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Resources", href: "/resources/case-studies" },
    { label: "Videos", href: "/resources/videos" },
    { label: data.title, href: `/resources/videos/${id}`, active: true },
  ];

  return (
    <PageLayout
      breadcrumb={<Breadcrumb items={breadcrumbItems} />}
      title={data.title}
      maxWidth="2xl"
    >
      {data.video_url && (
        <Section padding="md">
          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
              overflow: "hidden",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <iframe
              src={data.video_url}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Section>
      )}

      <Section padding="lg">
        <div className={styles.videoInfo}>
          {data.category && (
            <span className={styles.category}>{data.category}</span>
          )}
          {data.duration && (
            <span className={styles.duration}>
              {Math.floor(data.duration / 60)}:{String(data.duration % 60).padStart(2, "0")}
            </span>
          )}
        </div>
        {data.description && (
          <div
            className="rich-content"
            style={{ marginTop: '1.5rem' }}
            dangerouslySetInnerHTML={{ __html: data.description }}
          />
        )}
      </Section>
    </PageLayout>
  );
}
