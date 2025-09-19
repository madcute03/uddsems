<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class SafeOptimizeClear extends Command
{
    protected $signature = 'optimize:clear-safe';
    protected $description = 'Clear cached files safely without database dependency';

    public function handle()
    {
        $this->call('config:clear');
        $this->call('route:clear');
        $this->call('view:clear');
        
        // Clear cache without database dependency
        if (config('cache.default') !== 'database') {
            Cache::flush();
        }
        
        $this->info('Optimization cleared safely!');
    }
}
