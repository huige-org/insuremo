import { notFound } from "next/navigation";
import {
  PageLayout,
  Breadcrumb,
  Section,
} from "@/components/Layouts";
import { publicApi } from "@/lib/api";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    const data = await publicApi.getArticleById(id);
    return {
      title: `${data.title} - Whitepapers - InsureMO`,
      description: data.summary || "",
    };
  } catch {
    return {
      title: "Whitepaper - InsureMO",
    };
  }
}

export default async function WhitepaperDetailPage({ params }: Props) {
  const { id } = await params;

  let data;
  try {
    data = await publicApi.getArticleById(id);
  } catch {
    notFound();
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Resources", href: "/resources/case-studies" },
    { label: "Whitepapers", href: "/resources/whitepapers" },
    { label: data.title, href: `/resources/whitepapers/${id}`, active: true },
  ];

  return (
    <PageLayout
      breadcrumb={<Breadcrumb items={breadcrumbItems} />}
      title={data.title}
      subtitle={data.summary || undefined}
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
          style={{ lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: data.content || "" }}
        />
      </Section>
    </PageLayout>
  );
}
