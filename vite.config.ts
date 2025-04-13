import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig, loadEnv } from "vite"; // loadEnv をインポート
import tsconfigPaths from "vite-tsconfig-paths";
import type { UserConfig } from 'vite';

// defineConfig を関数形式に変更
export default defineConfig(({ mode }) => {
  // 環境変数をロード
  const env = loadEnv(mode, process.cwd(), '');

  return {
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [reactRouter(), tsconfigPaths()],
  // クライアントサイドで環境変数を利用可能にする
  define: {
    // process.env から env に変更
    'import.meta.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    // VITE_API_BASE_URL もクライアントサイドで使えるように define に追加
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
  },
  server: {
    proxy: {
      '/api': {
        // 環境変数を参照するように修正
        target: env.VITE_DEV_PROXY_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // カスタムヘッダーをクライアントに転送
            const jobId = proxyRes.headers['x-job-id'];
            if (jobId) {
              console.log('Proxy received X-Job-ID:', jobId);
              // ヘッダーを明示的に設定
              res.setHeader('X-Job-ID', jobId);
            }
          });
        },
      },
    },
  },
} satisfies UserConfig;
});
