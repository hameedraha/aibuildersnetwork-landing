import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const RESOURCE_CATEGORIES = ['guides', 'prompts', 'workflows', 'reference'] as const;

const resources = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/resources' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.enum(RESOURCE_CATEGORIES),
    tags: z.array(z.string()).min(1),
    downloads: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
          fileType: z.string().optional(),
        })
      )
      .optional()
      .default([]),
    workflows: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string().optional(),
        })
      )
      .optional()
      .default([]),
    prompts: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string().optional(),
        })
      )
      .optional()
      .default([]),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.{md,json}', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    slug: z
      .string()
      .regex(/^\d{4}-\d{2}-[\w-]+$/, 'Slug must start with YYYY-MM-')
      .optional(),
    eventDate: z.coerce.date(),
    format: z.string(),
    location: z.string(),
    city: z.string(),
    price: z.string(),
    hosts: z.array(z.string()),
    ticketUrl: z.string().url(),
    duration: z.string().optional(),
    venue: z.string().optional(),
    // Plain-text body for JSON-based events (rendered as paragraphs).
    // Markdown-based events keep their prose in the .md body instead.
    body: z.string().optional(),
    // optional structured "run of show"
    schedule: z
      .array(
        z.object({
          time: z.string().optional(),
          title: z.string(),
          description: z.string().optional(),
        })
      )
      .optional()
      .default([]),
    // optional short text lists rendered as cards/blocks
    includes: z.array(z.string()).optional().default([]),
    outcomes: z.array(z.string()).optional().default([]),
    whoFor: z.array(z.string()).optional().default([]),
    // optional richer instructor bios (the `hosts` array stays for compact chips)
    instructors: z
      .array(
        z.object({
          name: z.string(),
          title: z.string().optional(),
          bio: z.string(),
          photo: z.string().optional(),
          linkedin: z.string().url().optional(),
        })
      )
      .optional()
      .default([]),
    // optional video gallery (e.g. showreels / aftermovies)
    videoGallery: z
      .array(
        z.object({
          title: z.string().optional(),
          url: z.string().url(),
          thumbnail: z.string().optional(),
          platform: z.enum(['youtube', 'vimeo', 'other']).optional(),
        })
      )
      .optional()
      .default([]),
  }),
});

export const collections = { resources, events };
