import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const works = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/works" }),
  schema: z.object({
    title: z.string(),
    kind: z.enum(["interactive", "av", "field", "data", "film", "graphic", "software", "game", "web"]),
    tier: z.enum(["featured", "rack", "method", "text"]),
    year: z.string(),
    channel: z.string().optional(),
    tags: z.array(z.string()).default([]),
    summary: z.string(),
    role: z.string(),
    aiDisclosure: z.string(),
    evidence: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    thirdParty: z.boolean().default(false),
    approval: z
      .object({ by: z.string(), date: z.string(), scope: z.string(), evidence: z.string() })
      .optional(),
    obligations: z.array(z.enum(["suno-attribution", "no-monetization"])).default([]),
    restricted: z.array(z.string()).default([]),
  }),
});

export const collections = { works };
