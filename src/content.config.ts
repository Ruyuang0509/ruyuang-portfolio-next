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
    detail: z.boolean().default(false),
    media: z
      .object({
        video: z.string(),
        poster: z.string().optional(),
        tracks: z
          .array(z.object({ src: z.string(), srclang: z.string(), label: z.string() }))
          .default([]),
        note: z.string().optional(),
      })
      .optional(),
  }),
});

export const collections = { works };
