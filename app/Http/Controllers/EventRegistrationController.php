<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Mail\TeamApprovedMail;
use Illuminate\Support\Facades\Mail;


class EventRegistrationController extends Controller
{
    
    





    // Show registration form
    public function create(Event $event)
    {
        return Inertia::render('RegisterEvent', [
            'event' => $event,
            'requiredPlayers' => $event->required_players,
        ]);
    }

    // Store registration
    public function store(Request $request, Event $event)
    {
        $validated = $request->validate([
            'team_name' => 'nullable|string|max:255',
            'players.*.student_id' => 'required',
            'players.*.name' => 'required|string|max:255',
            'players.*.email' => 'required|email|ends_with:@cdd.edu.ph', // ✅ validate email
            'players.*.department' => 'required|string|max:255',
            'players.*.age' => 'required|integer',
            'players.*.player_image' => 'required|image',
            'players.*.whiteform_image' => 'required|image',
        ]);

        // Create event registration for team or single player
        $registration = EventRegistration::create([
            'event_id' => $event->id,
            'team_name' => $request->team_name ?? $request->players[0]['name'], // Use player name if no team
        ]);

        foreach ($validated['players'] as $player) {
            $registration->players()->create([
                'student_id' => $player['student_id'],
                'name' => $player['name'],
                'email' => $player['email'], // ✅ save email
                'department' => $player['department'],
                'age' => $player['age'],
                'player_image' => $player['player_image']->store('player_images', 'public'),
                'whiteform_image' => $player['whiteform_image']->store('whiteform_images', 'public'),
            ]);
        }

        return redirect()->route('events.show', $event->id)
                         ->with('success', 'Registration successful!');
    }

    // Show teams and players
    public function showTeamRegistrations(Event $event)
    {
        // Fetch registrations and their related players
        $registrations = EventRegistration::with('players')
            ->where('event_id', $event->id)
            ->get();

        return Inertia::render('Registrations/RegisteredTeams', [
            'registrations' => $registrations,
            'event' => $event,
        ]);
    }
}
