<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;

// Controllers
use App\Http\Controllers\EventController;
use App\Http\Controllers\ProfileController;
use App\Models\Event;

// Public routes
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
        'events'         => Event::with('images')->orderBy('event_date')->get(),
    ]);
})->name('home');


Route::get('/events/{event}', [EventController::class, 'show'])->name('events.show');

// Registration form for a specific event

// Admin & Authenticated Routes
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', [EventController::class, 'index'])->name('dashboard');

    Route::post('/events', [EventController::class, 'store'])->name('events.store');
    Route::put('/events/{id}', [EventController::class, 'update'])->name('events.update');
    Route::delete('/events/{id}', [EventController::class, 'destroy'])->name('events.destroy');
    Route::post('/events/{id}/done', [EventController::class, 'markDone'])->name('events.markDone');

    // User profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    
    
});

require __DIR__ . '/auth.php';
