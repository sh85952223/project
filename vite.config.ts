import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // 컨테이너 외부 연결 허용
    port: 5173,        // docker-compose에서 매핑한 포트
    watch: {
      usePolling: true // 볼륨 마운트 시 파일 변경 감지를 위해
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'], // 기존 설정 유지
  },
});