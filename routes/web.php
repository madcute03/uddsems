<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

// Controllers
use App\Http\Controllers\EventController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\EventRegistrationController;
use App\Http\Controllers\CreateBracketController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\BracketController;
use App\Http\Controllers\DoubleEliminationController;
use App\Http\Controllers\SingleEliminationController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\ComplaintController;
use App\Models\Event;
use App\Models\News;

// Helper: safe error message
function safeError(\Throwable $e) {
    return app()->environment('local') ? $e->getMessage() : 'Something went wrong';
}

// ============================================
// Health Check Route
// ============================================
Route::get('/health', function () {
    try {
        DB::connection()->getPdo();
        return response()->json([
            'status'    => 'ok',
            'database'  => 'connected',
            'timestamp' => now()->toDateTimeString()
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'    => 'error',
            'database'  => 'not_connected',
            'error'     => safeError($e),
            'timestamp' => now()->toDateTimeString()
        ], 500);
    }
});

// ============================================
// Public Routes
// ============================================

// Homepage
Route::get('/', function () {
    try {
        return Inertia::render('Welcome', [
            'canLogin'       => Route::has('login'),
            'canRegister'    => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion'     => PHP_VERSION,
            'events'         => Event::with('images')->orderBy('event_date')->get(),
            'news'           => News::orderByDesc('published_at')
                                    ->orderByDesc('created_at')
                                    ->take(10)
                                    ->get(),
        ]);
    } catch (\Throwable $e) {
        return response()->json(['error' => safeError($e)], 500);
    }
})->name('home');

// News
Route::get('/news', fn() => app(NewsController::class)->publicIndex())
    ->name('news.index');

Route::get('/news/{news}', fn($news) => app(NewsController::class)->show($news))
    ->name('news.show');

// Events
Route::get('/events/{event}', fn($event) => app(EventController::class)->show($event))
    ->name('events.show');

// Event Registration
Route::get('/events/{event}/register', fn($event) => app(EventRegistrationController::class)->create($event))
    ->name('events.register');
Route::post('/events/{event}/register', fn($event) => app(EventRegistrationController::class)->store($event))
    ->name('eventregistrations.store');
Route::get('/events/{event}/registrations', fn($event) => app(EventRegistrationController::class)->showTeamRegistrations($event))
    ->name('events.registrations');

// Complaints
Route::get('/complaints', fn() => app(ComplaintController::class)->index())
    ->name('complaints.index');
Route::post('/complaints', fn() => app(ComplaintController::class)->store())
    ->name('complaints.store');

// Bracket Previews
Route::get('/bracket/single/{teams}', function ($teams) {
    try {
        $componentMap = [
            2 => 'Bracket/SingleEliminationBracket/Bracket2',
            3 => 'Bracket/SingleEliminationBracket/Bracket3',
            4 => 'Bracket/SingleEliminationBracket/Bracket4',
            5 => 'Bracket/SingleEliminationBracket/Bracket5',
            6 => 'Bracket/SingleEliminationBracket/Bracket6',
            7 => 'Bracket/SingleEliminationBracket/Bracket7',
            8 => 'Bracket/SingleEliminationBracket/Bracket8',
        ];
        if (!isset($componentMap[$teams])) abort(404);
        return Inertia::render($componentMap[$teams], ['teams' => $teams]);
    } catch (\Throwable $e) {
        return response()->json(['error' => safeError($e)], 500);
    }
})->name('bracket.single');

Route::get('/bracket/double/{teams}', function ($teams) {
    try {
        $componentMap = [
            3 => 'Bracket/DoubleEliminationBracket/Bracket3/Bracket',
            4 => 'Bracket/DoubleEliminationBracket/Bracket4/Bracket',
            5 => 'Bracket/DoubleEliminationBracket/Bracket5/Bracket',
            6 => 'Bracket/DoubleEliminationBracket/Bracket6/Bracket',
            7 => 'Bracket/DoubleEliminationBracket/Bracket7/Bracket',
            8 => 'Bracket/DoubleEliminationBracket/Bracket8/Bracket',
        ];
        if (!isset($componentMap[$teams])) abort(404);
        return Inertia::render($componentMap[$teams], ['teams' => $teams]);
    } catch (\Throwable $e) {
        return response()->json(['error' => safeError($e)], 500);
    }
})->name('bracket.double');

// Database Test Route
Route::get('/db-test', function() {
    try {
        DB::connection()->getPdo();
        return response()->json(['status' => 'ok', 'message' => 'Database connected!']);
    } catch (\Throwable $e) {
        return response()->json(['status' => 'error', 'message' => safeError($e)], 500);
    }
});

// Debug Route
Route::get('/debug', function() {
    try {
        $dbStatus = DB::connection()->getPdo() ? 'Connected' : 'Failed';
        return response()->json([
            'APP_URL'       => config('app.url'),
            'DB_HOST'       => env('DB_HOST'),
            'DB_CONNECTION' => $dbStatus,
            'Inertia'       => class_exists('Inertia\Inertia') ? 'Loaded' : 'Missing',
            'Vite'          => class_exists('Vite') ? 'Loaded' : 'Missing',
            'timestamp'     => now()->toDateTimeString()
        ]);
    } catch (\Throwable $e) {
        return response()->json(['error' => safeError($e)], 500);
    }
});

// ============================================
// Admin Routes (Authenticated & Verified)
// ============================================
Route::middleware(['auth', 'verified'])->group(function () {
    try {
        // Dashboard
        Route::get('/dashboard', [EventController::class, 'dashboard'])->name('dashboard');
        Route::get('/dashboard/createevent', [EventController::class, 'index'])->name('dashboard.createevent');
        
        // Events
        Route::post('/events', [EventController::class, 'store'])->name('events.store');
        Route::put('/events/{id}', [EventController::class, 'update'])->name('events.update');
        Route::delete('/events/{id}', [EventController::class, 'destroy'])->name('events.destroy');
        Route::post('/events/{id}/mark-done', [EventController::class, 'markDone'])->name('events.markDone');
        Route::post('/events/{id}/mark-undone', [EventController::class, 'markUndone'])->name('events.markUndone');
        
        // Bracket Management
        Route::get('/dashboard/bracket', [CreateBracketController::class, 'bracket'])->name('bracket');
        Route::post('/events/{event}/bracket-settings', [BracketController::class, 'storeBracketSettings'])->name('bracket.storeSettings');
        Route::post('/double-elimination/save', [DoubleEliminationController::class, 'save'])->name('double-elimination.save');
        Route::get('/double-elimination/{event}', [DoubleEliminationController::class, 'show'])->name('double-elimination.show');
        Route::post('/single-elimination/save', [SingleEliminationController::class, 'save'])->name('single-elimination.save');
        Route::get('/single-elimination/{event}', [SingleEliminationController::class, 'show'])->name('single-elimination.show');
        Route::post('/brackets/save', [BracketController::class, 'save'])->name('bracket.save');
        Route::get('/bracket/{event}/show', [BracketController::class, 'ShowBracket'])->name('bracket.show');
        Route::get('/standing/{event}/show', [BracketController::class, 'ShowStanding'])->name('standing.show');
        
        // News Management
        Route::get('/dashboard/createnews', [NewsController::class, 'index'])->name('dashboard.createnews');
        Route::post('/news', [NewsController::class, 'store'])->name('news.store');
        Route::put('/news/{news}', [NewsController::class, 'update'])->name('news.update');
        Route::delete('/news/{news}', [NewsController::class, 'destroy'])->name('news.destroy');
        
        // Complaints Management
        Route::prefix('admin')->group(function () {
            Route::get('/complaints', [ComplaintController::class, 'adminIndex'])->name('admin.complaints.index');
            Route::delete('/complaints/{complaint}', [ComplaintController::class, 'destroy'])->name('admin.complaints.destroy');
        });
        
        // Player Management
        Route::post('/player/update-status', [PlayerController::class, 'updateStatus'])->name('player.updateStatus');
        
        // User Profile
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    } catch (\Throwable $e) {
        return response()->json(['error' => safeError($e)], 500);
    }
});

require __DIR__ . '/auth.php';
