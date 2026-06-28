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
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
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
  }),
});

export const collections = { resources, events };
