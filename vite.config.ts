import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import type { UserConfig } from 'vite'; // UserConfig 型をインポート

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [reactRouter(), tsconfigPaths()],
  // クライアントサイドで環境変数を利用可能にする
  define: {
    'import.meta.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
  },
  server: { // server プロパティを追加
    proxy: {
      // /api で始まるリクエストをプロキシする
      '/api': {
        target: 'http://localhost:8000', // バックエンドサーバーのアドレス
        changeOrigin: true, // オリジンを変更
        rewrite: (path) => path.replace(/^\/api/, ''), // パスから /api を削除
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
} satisfies UserConfig); // satisfies UserConfig を追加して型チェックを強化
