<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Registration;


class EventController extends Controller
{
    // ADMIN: Dashboard (list all events)
    public function index()
    {
        return Inertia::render('Dashboard', [
            'events' => Event::orderBy('event_date')->get(),
        ]);
    }

    // PUBLIC: View a single event
    public function show(Event $event)
    {
        return Inertia::render('ShowEvent', [
            'event' => $event,
        ]);
    }

    // ADMIN: Create a new event
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'            => 'required|string|max:255',
            'description'      => 'required|string',
            'coordinator_name' => 'required|string|max:255',
            'event_date'       => 'required|date',
            'image'            => 'nullable|image|max:2048',
            'required_players' => 'required|integer|min:1|max:20',
        ]);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('events', 'public');
        }

        Event::create($data);

        return redirect()->back()->with('success', 'Event created successfully.');
    }

    // ADMIN: Update an event
    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        $data = $request->validate([
            'title'            => 'required|string|max:255',
            'description'      => 'required|string',
            'coordinator_name' => 'required|string|max:255',
            'event_date'       => 'required|date',
            'image'            => 'nullable|image|max:2048',
            'required_players' => 'required|integer|min:1|max:20',
        ]);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('events', 'public');
        }

        $event->update($data);

        return redirect()->back()->with('success', 'Event updated successfully.');
    }

    // ADMIN: Delete an event
    public function destroy($id)
    {
        $event = Event::findOrFail($id);
        $event->delete();

        return redirect()->back()->with('success', 'Event deleted successfully.');
    }

    // ADMIN: Mark event as done
    public function markDone($id)
    {
        $event = Event::findOrFail($id);
        $event->is_done = true;
        $event->save();

        return back()->with('success', 'Event marked as done.');
    }

    //new delte pag mali

public function registrations(Event $event)
{
    $registrations = $event->registrations()->with('players')->get();

    return Inertia::render('Events/ViewRegistrations', [
        'event' => $event,
        'registrations' => $registrations,
    ]);
}

}
