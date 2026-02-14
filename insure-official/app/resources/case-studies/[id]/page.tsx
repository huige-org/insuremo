import { notFound } from "next/navigation";
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
    const data = await publicApi.getCaseById(id);
    return {
      title: `${data.title} - Case Studies - InsureMO`,
      description: data.summary || "",
    };
  } catch {
    return {
      title: "Case Study - InsureMO",
    };
  }
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const { id } = await params;

  let data;
  try {
    data = await publicApi.getCaseById(id);
  } catch {
    notFound();
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Resources", href: "/resources" },
    { label: "Case Studies", href: "/resources/case-studies" },
    { label: data.title, href: `/resources/case-studies/${id}`, active: true },
  ];

  return (
    <PageLayout
      breadcrumb={<Breadcrumb items={breadcrumbItems} />}
      title={data.title}
      subtitle={data.company_name || undefined}
      maxWidth="2xl"
    >
      {data.cover_url && (
        <Section padding="md">
          <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            <img
              src={data.cover_url}
              alt={data.title}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        </Section>
      )}

      <Section padding="lg">
        <div
          className={styles.detailContent}
          dangerouslySetInnerHTML={{ __html: data.content || "" }}
        />
      </Section>

      <Section padding="xl" backgroundColor="var(--primary-light)">
        <div className={styles.ctaSection}>
          <h2>Want to see how InsureMO can help your business?</h2>
          <p>
            Schedule a demo with our product team to explore tailored solutions.
          </p>
          <button className={styles.scheduleBtn}>Schedule a Demo</button>
        </div>
      </Section>
    </PageLayout>
  );
}
