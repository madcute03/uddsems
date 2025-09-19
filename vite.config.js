import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import * as terser from 'terser';

export default defineConfig(({ command, mode }) => {
    // Load environment variables based on the current mode
    const env = loadEnv(mode, process.cwd(), '');
    
    const isProduction = env.APP_ENV === 'production';
    const host = env.VITE_DEV_SERVER_HOST || '0.0.0.0';
    const protocol = isProduction ? 'https' : 'http';
    const port = parseInt(env.VITE_PORT || '5173');
    const appUrl = env.APP_URL || 'http://localhost:8000';
    const hmrHost = env.VITE_HMR_HOST || (isProduction ? new URL(appUrl).hostname : 'localhost');
    
    // For Railway deployment
    const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production';
    const assetUrl = isRailway ? process.env.RAILWAY_STATIC_URL : '';

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
        base: isRailway 
            ? (assetUrl ? `${assetUrl}/` : '/build/')
            : (isProduction ? '/build/' : `${appUrl}/`),
        // Build configuration
        build: {
            outDir: 'public/build',
            assetsDir: '.',
            emptyOutDir: true,
            manifest: true,
            sourcemap: isProduction ? false : 'inline',
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: true,
                },
            },
            chunkSizeWarningLimit: 1600,
            rollupOptions: {
                input: 'resources/js/app.jsx',
                output: {
                    manualChunks: {
                        'vendor': [
                            'react',
                            'react-dom',
                            '@inertiajs/react',
                            '@inertiajs/inertia',
                            'axios',
                            'lodash'
                        ],
                    },
                    entryFileNames: 'assets/[name].[hash].js',
                    chunkFileNames: 'assets/[name].[hash].js',
                    assetFileNames: 'assets/[name].[hash].[ext]',
                },
            },
        },
        // Server configuration
        server: {
            host: host,
            port: port,
            strictPort: true,
            hmr: isProduction ? false : {
                host: hmrHost,
                protocol: protocol,
                port: port,
                clientPort: isProduction ? 443 : port,
            },
            watch: {
                usePolling: true,
            },
            cors: true,
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
            },
        },
    };
});
