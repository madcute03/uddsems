import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig(({ mode }) => ({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],

    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
            'ziggy-js': path.resolve(__dirname, 'node_modules/ziggy-js')
        },
    },
    
    optimizeDeps: {
        include: ['ziggy-js']
    },

    build: {
        outDir: 'public/build',
        emptyOutDir: true,
        manifest: true,
        sourcemap: mode !== 'production',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: [
                        'react',
                        'react-dom',
                        '@inertiajs/react',
                        'axios',
                    ],
                },
                assetFileNames: 'assets/[name].[hash][extname]',
                entryFileNames: 'assets/[name].[hash].js',
                chunkFileNames: 'assets/[name].[hash].js',
            },
        },
        minify: mode === 'production' ? 'esbuild' : false,
        chunkSizeWarningLimit: 1600,
    },
}));
