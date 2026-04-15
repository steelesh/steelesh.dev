export interface ContentItem {
  slug: string;
  name: string;
  title: string;
  subtitle: string;
  description: string;
  category: "post";
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  url?: string;
  sourceUrl?: string;
  draft?: boolean;
  minimal?: boolean;
  series?: string;
  seriesOrder?: number;
}
