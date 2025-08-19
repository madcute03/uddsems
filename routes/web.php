<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;

// Controllers
use App\Http\Controllers\EventController;
use App\Http\Controllers\ProfileController;
use App\Models\Event;
use App\Http\Controllers\EventRegistrationController;
use App\Http\Controllers\CreateBracketController;
use App\Http\Controllers\PlayerController;












//show registered
Route::get('/events/{event}/registrations', [EventRegistrationController::class, 'showTeamRegistrations'])
    ->name('events.registrations');






// event registration submition
Route::get('/events/{event}/register', [EventRegistrationController::class, 'create'])
    ->name('events.register');

Route::post('/events/{event}/register', [EventRegistrationController::class, 'store'])
    ->name('eventregistrations.store');
//






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


    Route::get('/dashboard', [EventController::class, 'dashboard'])->name('dashboard');
    Route::get('/dashboard/createevent', [EventController::class, 'index'])->name('dashboard.createevent');
    Route::get('/dashboard/bracket', [CreateBracketController::class, 'bracket'])
    ->name('bracket');


    Route::post('/events', [EventController::class, 'store'])->name('events.store');
    Route::put('/events/{id}', [EventController::class, 'update'])->name('events.update');
    Route::delete('/events/{id}', [EventController::class, 'destroy'])->name('events.destroy');
    Route::post('/events/{id}/done', [EventController::class, 'markDone'])->name('events.markDone');

    // User profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

Route::post('/player/update-status', [PlayerController::class, 'updateStatus'])
    ->name('player.updateStatus');




    
    
});

require __DIR__ . '/auth.php';
