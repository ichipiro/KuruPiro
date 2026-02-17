import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // サービスワーカーを自動的に更新する設定
      manifest: {
        name: "くるぴろ",
        short_name: "くるぴろ",
        description: "広島市立大学周辺のバス時刻を表示するアプリ",
        theme_color: "#005394",
        background_color: "#005394",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "/logo.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://kurupiro.ichipiro.net',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
