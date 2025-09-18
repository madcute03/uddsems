<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia; // ✅ CORRECT


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS in all environments except local
        if (!app()->environment('local')) {
            \URL::forceScheme('https');
            if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
                $this->app['request']->server->set('HTTPS', 'on');
            }
            
            // Ensure the application URL is using HTTPS
            if (strpos(config('app.url'), 'https') === 0) {
                \Illuminate\Support\Facades\URL::forceRootUrl(config('app.url'));
            } else {
                $secureUrl = str_replace('http://', 'https://', config('app.url'));
                \Illuminate\Support\Facades\URL::forceRootUrl($secureUrl);
            }
        }

        Vite::prefetch(concurrency: 3);
        
        Inertia::share([
            'flash' => function () {
                return [
                    'success' => session('success'),
                    'error' => session('error'),
                ];
            },
        ]);
    }
}
