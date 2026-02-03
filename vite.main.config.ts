import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
    build: {
        rollupOptions: {
            // 将原生模块标记为外部依赖，不打包
            external: ['better-sqlite3'],
        },
    },
});
