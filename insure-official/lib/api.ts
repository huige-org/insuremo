const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api/v1';

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  const data = await res.json();
  return data.data;
}

export interface Article {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  cover_url: string | null;
  category: string | null;
  tags: string[];
  status: string;
  published_at: string | null;
}

export interface Video {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  video_url: string;
  duration: number | null;
  category: string | null;
  tags: string[];
  status: string;
  published_at: string | null;
}

export interface Case {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  cover_url: string | null;
  company_name: string | null;
  category: string | null;
  tags: string[];
  status: string;
  published_at: string | null;
}

export const publicApi = {
  getArticles: () => fetchAPI<Article[]>('/public/articles'),
  getVideos: () => fetchAPI<Video[]>('/public/videos'),
  getCases: () => fetchAPI<Case[]>('/public/cases'),
};

export function transformArticle(item: Article) {
  return {
    id: item.id,
    title: item.title,
    description: item.summary || '',
    image: item.cover_url || undefined,
    link: '#',
    linkText: 'Read More',
  };
}

export function transformVideo(item: Video) {
  return {
    id: item.id,
    title: item.title,
    description: item.description || '',
    image: item.cover_url || undefined,
    link: item.video_url || '#',
    linkText: 'Watch Video',
    isVideo: true,
  };
}

export function transformCase(item: Case) {
  return {
    id: item.id,
    title: item.title,
    description: item.summary ? item.summary.replace(/<[^>]*>/g, '').slice(0, 150) : '',
    image: item.cover_url || undefined,
    link: '#',
    linkText: 'Read case study',
  };
}
