import type { ChatContext } from "$lib/types";

const DEFAULT_GREETING = "Hey! Ask me anything about Steele — his experience, skills, projects, or background.";

const suggestions: Record<ChatContext["page"], string[]> = {
  "home": [
    "What's Steele's engineering philosophy?",
    "Tell me about his experience",
    "What's he working on right now?",
  ],
  "post": [
    "Summarize this article",
    "What are the key takeaways?",
    "How does this relate to his work?",
  ],
  "case-study": [
    "Summarize this case study",
    "What technical decisions were made?",
    "What was the biggest challenge?",
  ],
  "project": [
    "Summarize this project",
    "What technologies were used?",
    "What problem does this solve?",
  ],
  "experience": [
    "What did Steele do in this role?",
    "What technologies did he use?",
    "What was his biggest impact?",
  ],
};

export function getSuggestions(context?: ChatContext): string[] {
  return suggestions[context?.page ?? "home"];
}

export function getGreeting(context?: ChatContext): string {
  if (!context?.title || context.page === "home")
    return DEFAULT_GREETING;

  switch (context.page) {
    case "experience":
      return `Hey! I've loaded context for the "${context.title}" role at ${context.company ?? "this company"}. Ask me anything about Steele's time there.`;
    case "project":
      return `Hey! I've read through "${context.title}." Ask me about the tech, challenges, or decisions behind it.`;
    case "case-study":
      return `Hey! I have the full "${context.title}" case study loaded. Ask me about the process, findings, or details.`;
    case "post":
      return `Hey! I've read "${context.title}." Ask me about the topic, or anything else about Steele.`;
    default:
      return DEFAULT_GREETING;
  }
}
