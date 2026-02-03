import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig(async () => {
    const vue = (await import('@vitejs/plugin-vue')).default;
    return {
        plugins: [vue()],
    };
});
