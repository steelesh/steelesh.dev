export type Categories = "sveltekit" | "svelte";

export type Post = {
  title: string;
  slug: string;
  description: string;
  date: string;
  categories: Categories[];
  draft: boolean;
};

export type ProgrammingLangIcon = {
  name: string;
  svg: string;
  link: string;
};
