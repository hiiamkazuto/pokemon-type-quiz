import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages（リポジトリ名のサブパス）で配信するため相対基準にする
export default defineConfig({
  plugins: [react()],
  base: './',
});
