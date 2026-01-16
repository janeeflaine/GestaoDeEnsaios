import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const define: Record<string, any> = {
    'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
  };

  // Apenas define se as variáveis existirem no ambiente de build
  if (env.VITE_SUPABASE_URL) {
    define['import.meta.env.VITE_SUPABASE_URL'] = JSON.stringify(env.VITE_SUPABASE_URL);
  }
  if (env.VITE_SUPABASE_ANON_KEY) {
    define['import.meta.env.VITE_SUPABASE_ANON_KEY'] = JSON.stringify(env.VITE_SUPABASE_ANON_KEY);
  }

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      outDir: 'dist',
    }
  };
});
