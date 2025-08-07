<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;

// Controllers
use App\Http\Controllers\EventController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RegisterController; // ✅ This should match your controller file
use App\Models\Event;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Public welcome page showing upcoming events
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
        'events'         => Event::orderBy('event_date')->get(),
    ]);
})->name('home');

// View single event details
Route::get('/events/{event}', [EventController::class, 'show'])->name('events.show');

// Show register form for event
Route::get('/events/{event}/register', [RegisterController::class, 'create'])->name('events.register.form');

// Submit event registration
Route::post('/events/{event}/register', [RegisterController::class, 'store'])->name('events.register');


/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard showing all events
    Route::get('/dashboard', [EventController::class, 'index'])->name('dashboard');

    // Admin: Manage events
    Route::post('/events', [EventController::class, 'store'])->name('events.store');
    Route::put('/events/{id}', [EventController::class, 'update'])->name('events.update');
    Route::delete('/events/{id}', [EventController::class, 'destroy'])->name('events.destroy');
    Route::post('/events/{id}/done', [EventController::class, 'markDone'])->name('events.markDone');

    // Admin: View registrations for an event
    Route::get('/events/{event}/registrations', [RegisterController::class, 'index'])->name('events.registrations');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/
require __DIR__ . '/auth.php';
