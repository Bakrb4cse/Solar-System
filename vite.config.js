import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

server: {
    port: 3000, // تشغيل المشروع على بورت 3000 (اختياري)
    open: true, // لفتح المتصفح تلقائياً عند التشغيل
    proxy: {
      // توجيه طلبات الـ API إلى سيرفر Node.js (Backend) مستقبلاً
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
