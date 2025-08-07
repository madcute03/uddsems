<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\Registration;
use App\Models\Player;
use Inertia\Inertia;

class EventRegistrationController extends Controller
{
    // Store new registration
    public function store(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'department' => 'required|string|max:255',
            'players' => 'required|array|min:1',
            'players.*.studentId' => 'required|string',
            'players.*.name' => 'required|string',
        ]);

        // Save the registration
        $registration = Registration::create([
            'event_id' => $event->id,
            'department' => $validated['department'],
        ]);

        // Save each player
        foreach ($validated['players'] as $player) {
            Player::create([
                'registration_id' => $registration->id,
                'student_id' => $player['studentId'],
                'name' => $player['name'],
            ]);
        }

        return redirect()->route('events.show', $event->id)->with('success', 'Registration successful!');
    }

    // Show all registered players for an event
    public function index($id)
    {
        $event = Event::with('registrations.players')->findOrFail($id);

        return Inertia::render('EventRegistrations', [
            'event' => $event,
        ]);
    }
}
