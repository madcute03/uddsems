<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;

// Controllers
use App\Http\Controllers\EventController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\EventRegistrationController;
use App\Models\Event;

// ✅ PDF download route
Route::get('/registrations', [EventRegistrationController::class, 'index'])->name('registrations.index');
Route::post('/registrations', [EventRegistrationController::class, 'store'])->name('registrations.store');
Route::get('/players/{id}/download-pdf', [EventRegistrationController::class, 'downloadPDF'])->name('players.downloadPDF');


/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Homepage showing upcoming events
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
        'events'         => Event::orderBy('event_date')->get(),
    ]);
})->name('home');

// View event details
Route::get('/events/{event}', [EventController::class, 'show'])->name('events.show');

// Registration form for a specific event
Route::get('/events/{event}/register', [RegisterController::class, 'create'])->name('events.register.form');

// Submit event registration
Route::post('/events/{event}/register', [EventRegistrationController::class, 'store'])->name('events.register');

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    // Admin dashboard (list all events)
    Route::get('/dashboard', [EventController::class, 'index'])->name('dashboard');

    // Admin: Event management
    Route::post('/events', [EventController::class, 'store'])->name('events.store');
    Route::put('/events/{id}', [EventController::class, 'update'])->name('events.update');
    Route::delete('/events/{id}', [EventController::class, 'destroy'])->name('events.destroy');
    Route::post('/events/{id}/done', [EventController::class, 'markDone'])->name('events.markDone');

   
    // User profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/*
|--------------------------------------------------------------------------
| Auth Routes (Login, Register, etc.)
|--------------------------------------------------------------------------
*/

require __DIR__ . '/auth.php';
