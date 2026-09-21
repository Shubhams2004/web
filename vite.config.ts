import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { newsApiPlugin } from './vite-news-plugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const groqApiKey =
    env.GROQ_API_KEY ||
    process.env.GROQ_API_KEY ||
    env.GROK_API_KEY ||
    process.env.GROK_API_KEY ||
    '';

  return {
    base: '/web/',
    plugins: [react(), tailwindcss(), newsApiPlugin(groqApiKey)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
