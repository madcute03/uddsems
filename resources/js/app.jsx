import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';

// Initialize the application
const initializeApp = async () => {
    const appName = import.meta.env.VITE_APP_NAME || 'SEMS';

    // Handle Ziggy routing
    if (typeof window !== 'undefined') {
        try {
            const { default: Ziggy } = await import('ziggy-js');
            const ziggyConfig = (await import('./ziggy')).default;
            window.Ziggy = { ...Ziggy, ...ziggyConfig };
        } catch (error) {
            console.warn('Ziggy configuration could not be loaded:', error);
        }
    }

    // Create the main application
    createInertiaApp({
        title: (title) => title ? `${title} - ${appName}` : appName,
        resolve: (name) => {
            const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
            const page = pages[`./Pages/${name}.jsx`];
            
            if (!page) {
                throw new Error(`Page ${name} not found`);
            }
            
            return page;
        },
        setup({ el, App, props }) {
            const root = createRoot(el);
            
            root.render(
                <App {...props} />
            );
        },
        progress: {
            color: '#4F46E5',
            showSpinner: true,
        },
    });
};

// Start the application
initializeApp().catch((error) => {
    console.error('Failed to initialize application:', error);
});
