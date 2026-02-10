export type Experience = {
  title: string;
  company: string;
  companyUrl: string;
  location: string;
  period: string;
  description: string;
  type: "work" | "education";
  tags?: string[];
};

export type Project = {
  name: string;
  description: string;
  tags: string[];
  url?: string;
  sourceUrl?: string;
};
