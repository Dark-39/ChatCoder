import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: './', // ✅ THIS is the fix
  build: {
    outDir: '../dist', // ✅ build goes to root 'dist'
    emptyOutDir: true,
  },
})
