import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const basePath = process.env.BASE_PATH && process.env.BASE_PATH.length > 0 ? process.env.BASE_PATH : '/'

export default defineConfig({
  plugins: [vue()],
  base: basePath,
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
})
