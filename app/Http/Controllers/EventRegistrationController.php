<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\Player;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventRegistrationController extends Controller
{
    public function store(Request $request, Event $event)
    {
        $request->validate([
            'players' => 'required|array|min:1',
            'players.*.studentId' => 'required|string|max:255',
            'players.*.name' => 'required|string|max:255',
            'players.*.department' => 'required|string|max:255',
            'players.*.image' => 'nullable|file|image|max:2048',
        ]);

        DB::beginTransaction();

        try {
            $registration = EventRegistration::create([
                'event_id' => $event->id,
            ]);

            foreach ($request->players as $playerData) {
                $imagePath = null;

                if (isset($playerData['image']) && $playerData['image']->isValid()) {
                    $imagePath = $playerData['image']->store('players', 'public');
                }

                Player::create([
                    'event_registration_id' => $registration->id,
                    'student_id' => $playerData['studentId'],
                    'name' => $playerData['name'],
                    'department' => $playerData['department'],
                    'image_path' => $imagePath,
                ]);
            }

            DB::commit();
            return redirect()->route('events.show', $event->id)->with('success', 'Registration successful!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Something went wrong: ' . $e->getMessage());
        }
    }

    public function show(Event $event)
    {
        $registrations = $event->registrations()->with('players')->get();

        return inertia('Events/ViewRegistrations', [
            'event' => $event,
            'registrations' => $registrations,
        ]);
    }
}
