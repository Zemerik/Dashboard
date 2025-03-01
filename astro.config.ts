import { defineConfig } from 'astro/config';

import expressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import dashboard from './package/src';

import node from '@astrojs/node';
import { DashboardDark } from './src/ec-theme';

import vercel from '@astrojs/vercel';
// import pagefind from '@astrojs/pagefind';

// https://astro.build/config
export default defineConfig({
  site: 'https://zemeriksdashboard.vercel.app',
  output: 'static',
  integrations: [
    // pagefind(),
    expressiveCode({
      themes: [DashboardDark],
    }),
    mdx(),
    sitemap(),
    dashboard({
      name: "Dashboard",
      openGraph: {
        home: {
          title: 'Dashboard',
          description: 'A Unified Digital Identity Hub'
        },
        blog: {
          title: 'Blog',
          description: 'News and updates of Hemang Yadav'
        },
        projects: {
          title: 'Projects',
          description: 'Projects by Hemang Yadav'
        }
      },
    })
  ],
  adapter: vercel()
});