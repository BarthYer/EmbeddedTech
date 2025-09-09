import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    heroImage: z.string().optional(),
    draft: z.boolean().default(false),
    categories: z.array(z.enum(['Yocto','Zephyr','Embedded Linux','RTOS','Drivers','CI/CD','QQQ'])).default([])
  })
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({ title: z.string() })
});

export const collections = { posts, pages };
