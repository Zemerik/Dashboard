import type { AstroIntegration } from 'astro';
import { viteVirtualModulePluginBuilder } from './utils/virtual-module-plugin-builder';
import { z } from 'astro/zod'; 

const openGraphOptionsSchema = z.object({
  /**
   * The title of the page.
   */
  title: z.string(),
  /**
   * The description of the page. Optional.
   */
  description: z.string().optional(),
});

export const optionsSchema = z.object({
  /**
   * The name that should be displayed on the main page.
   */
  name: z.string(),
  /**
   * The theme color of the site. Optional. Defaults to `#8c5cf5`.
   */
  themeColor: z.string().optional(),
  /**
   * The Twitter handle of the site. Used for Twitter meta tags. Optional.
   */
  twitterHandle: z.string().optional(),
  /**
   * Open Graph meta tags for various pages.
   */
  openGraph: z.object({
    /**
     * Open Graph meta tags for the home page.
     */
    home: openGraphOptionsSchema,
    /**
     * Open Graph meta tags for the blog page.
     */
    blog: openGraphOptionsSchema,
    /**
     * Open Graph meta tags for the projects page.
     */
    projects: openGraphOptionsSchema,
  }),
  /**
   * All of this information can be find on [giscus' config page](https://giscus.app) under "Enable giscus" after entering all information.
   */
  giscus: z.union([
    z.literal(false),
    z.object({
      /**
       * The repository name.
       */
      repository: z.string(),
      /**
       * The repository's ID.
       */
      repositoryId: z.string(),
      /**
       * The category of the repository.
       */
      category: z.string(),
      /**
       * The category's ID.
       */
      categoryId: z.string(),
      /**
       * The mapping of the comments.
       */
      mapping: z.union([
        z.literal('pathname'),
        z.literal('url'),
        z.literal('title'),
        z.literal('og:title'),
        z.literal('specific'),
        z.literal('number')
      ]),
      /**
       * The term to use for the comments.
       */
      term: z.string().optional(),
      /**
       * Whether the comments are strict.
       */
      strict: z.boolean(),
      /**
       * Whether reactions are enabled.
       */
      reactionsEnabled: z.boolean(),
      /**
       * Whether metadata should be emitted.
       */
      emitMetadata: z.boolean(),
      /**
       * The theme to use for the comments.
       */
      theme: z.string().optional(),
      /**
       * The language to use for the comments.
       */
      lang: z.string(),
      /**
       * Where the comments input should be placed. Default is `bottom`.
       */
      commentsInput: z.union([
        z.literal('bottom'),
        z.literal('top'),
      ]).optional(),
    }).refine((data) => {
      if (data.mapping === 'specific' || data.mapping === 'number') {
        return !!data.term;
      }

      return true;
    }).optional(),
  ])
});

export default function integration(options: z.infer<typeof optionsSchema>): AstroIntegration {
  const validatedOptions = optionsSchema.parse(options);

	const globals = viteVirtualModulePluginBuilder('dashboard:globals', 'dashboard-theme-globals', `
    export const name = ${JSON.stringify(validatedOptions.name)};
    export const themeColor = ${JSON.stringify(validatedOptions.themeColor ?? '#8c5cf5')};
    export const twitterHandle = ${JSON.stringify(validatedOptions.twitterHandle)};
    export const openGraph = {
      home: ${JSON.stringify(validatedOptions.openGraph.home)},
      blog: ${JSON.stringify(validatedOptions.openGraph.blog)},
      projects: ${JSON.stringify(validatedOptions.openGraph.projects)},
    };
    export const giscus = ${validatedOptions.giscus ? JSON.stringify(validatedOptions.giscus) : 'false'};
  `);

	return {
		name: 'dashboard-theme',
		hooks: {
			'astro:config:setup': ({ updateConfig }) => {
				updateConfig({
					vite: {
						plugins: [
              globals(),
            ],
					},
				});
			},
		},
	};
}