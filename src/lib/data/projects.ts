import type { Project } from "$lib/types";

export const projects: Project[] = [
  {
    name: "UCollab",
    description: "Collaborative coding platform for UC students. Led a team of five, deployed on Azure. Presented at UC's IT Expo.",
    tags: ["Next.js", "MySQL", "Redis", "Azure"],
    sourceUrl: "https://github.com/steelesh/UCollab",
  },
  {
    name: "GitMsg",
    description: "CLI tool that generates conventional commit messages using local LLMs.",
    tags: ["Go", "Ollama"],
    sourceUrl: "https://github.com/steelesh/gitmsg",
  },
];
