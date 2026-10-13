import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            // Приложение и публичные документы: /privacy (и второй адрес /policy), /terms.
            // Адрес без своего html-файла Cloudflare отдаёт как приложение (index.html)
            input: {
                main: resolve(__dirname, 'index.html'),
                privacy: resolve(__dirname, 'privacy.html'),
                policy: resolve(__dirname, 'policy.html'),
                terms: resolve(__dirname, 'terms.html'),
            },
        },
    },
})
