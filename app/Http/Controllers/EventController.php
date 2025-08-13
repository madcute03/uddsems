<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventImage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    // ADMIN: Dashboard (list all events)
    public function index()
    {
        return Inertia::render('Dashboard', [
            'events' => Event::with('images')->orderBy('event_date')->get(),
        ]);
    }

    // PUBLIC: View a single event
    public function show(Event $event)
{
    // ✅ Eager load images relation
    $event->load('images');

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
            'images.*'         => 'nullable|image|max:2048',
            'required_players' => 'required|integer|min:1|max:20',
        ]);

        $event = Event::create([
            'title' => $data['title'],
            'description' => $data['description'],
            'coordinator_name' => $data['coordinator_name'],
            'event_date' => $data['event_date'],
            'required_players' => $data['required_players'],
        ]);

        // Store multiple images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('events', 'public');
                $event->images()->create(['image_path' => $path]);
            }
        }

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
            'images.*'         => 'nullable|image|max:2048',
            'required_players' => 'required|integer|min:1|max:20',
        ]);

        $event->update([
            'title' => $data['title'],
            'description' => $data['description'],
            'coordinator_name' => $data['coordinator_name'],
            'event_date' => $data['event_date'],
            'required_players' => $data['required_players'],
        ]);

        // Update images: delete old then save new
        if ($request->hasFile('images')) {
            $event->images()->delete();
            foreach ($request->file('images') as $file) {
                $path = $file->store('events', 'public');
                $event->images()->create(['image_path' => $path]);
            }
        }

        return redirect()->back()->with('success', 'Event updated successfully.');
    }

    // ADMIN: Delete an event
    public function destroy($id)
    {
        $event = Event::findOrFail($id);
        $event->delete(); // child images deleted automatically via cascade
        return redirect()->back()->with('success', 'Event deleted successfully.');
    }

    // PUBLIC: Welcome page
   public function welcome()
{
    $events = Event::with('images')->orderBy('event_date')->get();

    return Inertia::render('Welcome', [
        'events' => $events,
    ]);
}




}
