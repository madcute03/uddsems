import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command, mode }) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const host = process.env.VITE_DEV_SERVER_HOST || '127.0.0.1';
    const protocol = isProduction ? 'https' : 'http';
    const port = 5173;
    const appUrl = process.env.APP_URL || 'https://semsupdate-production.up.railway.app';

    return {
        plugins: [
            laravel({
                input: [
                    'resources/css/app.css',
                    'resources/js/app.jsx',
                ],
                refresh: true,
            }),
            react(),
        ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'resources/js'),
            },
        },
        base: isProduction
            ? '/build/'
            : `${appUrl}/`,
        build: {
            outDir: 'public/build',
            assetsDir: '.',
            emptyOutDir: true,
            manifest: true,
            rollupOptions: {
                input: 'resources/js/app.jsx',
            },
        server: {
            host: '0.0.0.0',
            port: port,
            strictPort: true,
            hmr: {
                host: host,
                port: port,
                protocol: isProduction ? 'wss' : 'ws',
            },
            watch: {
                usePolling: true,
            },
            // Allow connections from any IP
            cors: true,
            // Enable CORS for development
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
                'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
            },
            // Proxy API requests to Laravel
            proxy: {
                '/api': {
                    target: appUrl,
                    changeOrigin: true,
                    secure: false,
                },
            }
        },
            sourcemap: isProduction ? false : 'inline',
        },
    };
});
