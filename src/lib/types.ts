import type { Picture } from "@sveltejs/enhanced-img";

export interface Experience {
  title: string;
  company: string;
  companyUrl: string;
  location: string;
  period: string;
  description: string;
  type: "work" | "education";
  slug: string;
}

export interface ChatContext {
  page: "home" | "post" | "case-study" | "project" | "experience";
  title?: string;
  slug?: string;
  company?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  error?: string;
}

export interface ContentItem {
  slug: string;
  name: string;
  title: string;
  subtitle: string;
  description: string;
  category: "project" | "case-study" | "post";
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  url?: string;
  sourceUrl?: string;
  coverImage?: Picture | { light: Picture; dark: Picture };
  coverImageAlt?: string;
  headerColor?: string | { light: string; dark: string };
  headerTheme?: "light" | "dark" | { light: "light" | "dark"; dark: "light" | "dark" };
  coverHeight?: "full" | "half" | "quarter";
  devOnly?: boolean;
  series?: string;
  seriesOrder?: number;
}
