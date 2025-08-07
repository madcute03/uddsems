<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\Player;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;


class EventRegistrationController extends Controller
{
    public function store(Request $request, Event $event)
    {
        // ✅ Validate inputs including optional team name
        $request->validate([
            'teamName' => 'nullable|string|max:255',
            'players' => 'required|array|min:1',
            'players.*.studentId' => 'required|string|max:255',
            'players.*.name' => 'required|string|max:255',
            'players.*.department' => 'required|string|max:255',
            'players.*.image' => 'nullable|file|image|max:2048',
        ]);

        DB::beginTransaction();

        try {
            // ✅ Save team registration with team name (nullable)
            $registration = EventRegistration::create([
                'event_id' => $event->id,
                'team_name' => $request->teamName,
            ]);

            // ✅ Save each player to this registration
            foreach ($request->players as $playerData) {
                $imagePath = null;

                // Handle image upload
                if (isset($playerData['image']) && $playerData['image']->isValid()) {
                    $imagePath = $playerData['image']->store('players', 'public');
                }

                // Create player
                Player::create([
                    'event_registration_id' => $registration->id,
                    'student_id' => $playerData['studentId'],
                    'name' => $playerData['name'],
                    'department' => $playerData['department'],
                    'image_path' => $imagePath,
                ]);
            }

            DB::commit();

            return redirect()
                ->route('events.show', $event->id)
                ->with('success', 'Registration successful!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()
                ->back()
                ->with('error', 'Something went wrong: ' . $e->getMessage());
        }
    }

    public function show(Event $event)
    {
        // ✅ Load all registrations with their players
        $registrations = $event->registrations()->with('players')->get();

        return inertia('Events/ViewRegistrations', [
            'event' => $event,
            'registrations' => $registrations,
        ]);
    }
    public function index()
{
    $registrations = EventRegistration::with(['event', 'players'])->get();

    return Inertia::render('Registrations/Index', [
        'registrations' => $registrations,
    ]);
}
}
