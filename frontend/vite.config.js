import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
  plugins: [
    react(),
    createHtmlPlugin({
      minify: true,
      pages: [
        {
          entry: '/src/main.jsx',
          filename: 'index.html',
          template: 'index.html',
          injectOptions: {
            data: {
              title: 'Removerio - Free AI Background Remover',
              description: 'Remove image backgrounds instantly with AI...',
              canonical: 'https://www.removerio.bond/',
            }
          }
        },
        {
          entry: '/src/main.jsx',
          filename: 'about.html',
          template: 'about.html',
          injectOptions: {
            data: {
              title: 'About Removerio | Free AI Background Remover',
              description: 'Learn about Removerio...',
              canonical: 'https://www.removerio.bond/about',
            }
          }
        },
        {
          entry: '/src/main.jsx',
          filename: 'dashboard.html',
          template: 'dashboard.html',
          injectOptions: {
            data: {
              title: 'Start Using Removerio to remove background of images',
              description: 'Start removing backgrounds of images...',
              canonical: 'https://www.removerio.bond/dashboard',
            }
          }
        },
        {
          entry: '/src/main.jsx',
          filename: 'features.html',
          template: 'features.html',
          injectOptions: {
            data: {
              title: 'Remove Backgrounds Features | Features Of Our Free AI Background Remover - Removerio',
              description: 'See the amazing features of Removerio tool.',
              canonical: 'https://www.removerio.bond/features',
            }
          }
        },
        // Add more pages for each route
      ]
    })
  ],
});