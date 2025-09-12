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
use App\Http\Controllers\BracketController;
// routes/web.php
use App\Http\Controllers\DoubleEliminationController;
use App\Http\Controllers\SingleEliminationController;

Route::post('/events/{event}/bracket-settings', [BracketController::class, 'storeBracketSettings'])
    ->name('bracket.storeSettings');


Route::post('/double-elimination/save', [DoubleEliminationController::class, 'save'])->name('double-elimination.save');
Route::get('/double-elimination/{event}', [DoubleEliminationController::class, 'show'])->name('double-elimination.show');
Route::post('/single-elimination/save', [SingleEliminationController::class, 'save'])->name('single-elimination.save');
Route::get('/single-elimination/{event}', [SingleEliminationController::class, 'show'])->name('single-elimination.show');



Route::post('/brackets/save', [BracketController::class, 'save'])->name('bracket.save');
Route::get('/bracket/{event}/show', [BracketController::class, 'ShowBracket'])->name('bracket.show');
Route::get('/standing/{event}/show', [BracketController::class, 'ShowStanding'])->name('standing.show');


// Single Elimination Bracket
Route::get('/bracket/single/{teams}', function ($teams) {
    $componentMap = [
        2 => 'Bracket/SingleEliminationBracket/Bracket2',
        3 => 'Bracket/SingleEliminationBracket/Bracket3',
        4 => 'Bracket/SingleEliminationBracket/Bracket4',
        5 => 'Bracket/SingleEliminationBracket/Bracket5',
        6 => 'Bracket/SingleEliminationBracket/Bracket6',
        7 => 'Bracket/SingleEliminationBracket/Bracket7',
        8 => 'Bracket/SingleEliminationBracket/Bracket8',
    ];

    if (!isset($componentMap[$teams])) {
        abort(404);
    }

    return Inertia::render($componentMap[$teams], [
        'teams' => $teams
    ]);
})->name('bracket.single');

// Double Elimination Bracket
Route::get('/bracket/double/{teams}', function ($teams) {
    $componentMap = [
        3 => 'Bracket/DoubleEliminationBracket/Bracket3/Bracket',
        4 => 'Bracket/DoubleEliminationBracket/Bracket4/Bracket',
        5 => 'Bracket/DoubleEliminationBracket/Bracket5/Bracket',
        6 => 'Bracket/DoubleEliminationBracket/Bracket6/Bracket',
        7 => 'Bracket/DoubleEliminationBracket/Bracket7/Bracket',
        8 => 'Bracket/DoubleEliminationBracket/Bracket8/Bracket',
    ];

    if (!isset($componentMap[$teams])) {
        abort(404);
    }

    return Inertia::render($componentMap[$teams], [
        'teams' => $teams
    ]);
})->name('bracket.double');






//show registered
Route::get('/events/{event}/registrations', [EventRegistrationController::class, 'showTeamRegistrations'])
    ->name('events.registrations');






// event registration submition
Route::get('/events/{event}/register', [EventRegistrationController::class, 'create'])
    ->name('events.register');

Route::post('/events/{event}/register', [EventRegistrationController::class, 'store'])
    ->name('eventregistrations.store');



Route::get('/doublebracket', function () {
    return Inertia::render('Bracket/DoubleEliminationBracket/Bracket3/Bracket');
});
Route::get('/singlebracket', function () {
    return Inertia::render('Bracket/SingleEliminationBracket/Bracket2');
});



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
    Route::post('/events/{events}/done', [EventController::class, 'markDone'])->name('events.done');

    // User profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post('/player/update-status', [PlayerController::class, 'updateStatus'])
        ->name('player.updateStatus');
});

require __DIR__ . '/auth.php';
