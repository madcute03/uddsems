import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ command }) => {
    const isDev = command === 'serve';
    
    return {
        plugins: [
            laravel({
                input: [
                    'resources/css/app.css', 
                    'resources/js/app.jsx'
                ],
                refresh: true,
            }),
            react({
                // Add React plugin options if needed
                jsxImportSource: 'react',
                babel: {
                    plugins: [
                        '@babel/plugin-transform-react-jsx',
                    ],
                },
            }),
        ],

        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'resources/js'),
                'ziggy-js': path.resolve(__dirname, 'node_modules/ziggy-js/dist/index.js')
            },
        },
        
        server: {
            host: '0.0.0.0',
            port: 5173,
            strictPort: true,
            hmr: {
                host: 'localhost',
                port: 5173,
                protocol: 'ws',
            },
        },
        
        build: {
            outDir: 'public/build',
            emptyOutDir: true,
            manifest: true,
            sourcemap: isDev,
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
            minify: !isDev ? 'esbuild' : false,
            chunkSizeWarningLimit: 1600,
        },
    };
});
