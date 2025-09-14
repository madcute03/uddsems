<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    // ADMIN: Dashboard (list all events)
    public function dashboard()
    {
        $events = Event::select(
            'id',
            'title',
            'description',
            'coordinator_name',
            'event_date',
            'registration_end_date',
            'required_players',
            'is_done'
        )
            ->with('images')
            ->orderBy('event_date')
            ->get();

        // Map image paths for frontend convenience
        $events->transform(function ($event) {
            $event->images_path = $event->images->pluck('image_path');
            return $event;
        });

        return Inertia::render('Dashboard', [
            'events' => $events,
        ]);
    }

    // ADMIN: Show CreateEvent page
    public function index()
    {
        $events = Event::select(
            'id',
            'title',
            'description',
            'coordinator_name',
            'event_date',
            'registration_end_date',
            'required_players',
            'is_done' // include this

        )
            ->with('images')
            ->orderBy('event_date')
            ->get();

        // Map image paths for frontend
        $events->transform(function ($event) {
            $event->images_path = $event->images->pluck('image_path');
            return $event;
        });

        return Inertia::render('CreateEvent', [
            'events' => $events,
        ]);
    }

    // PUBLIC: View a single event
    public function show(Event $event)
    {
        $event->load('images');
        $event->images_path = $event->images->pluck('image_path');

        return Inertia::render('ShowEvent', [
            'event' => $event,
        ]);
    }

    // ADMIN: Create a new event
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'                 => 'required|string|max:255',
            'description'           => 'required|string',
            'coordinator_name'      => 'required|string|max:255',
            'event_date'            => 'required|date',
            'registration_end_date' => 'required|date|before_or_equal:event_date',
            'images.*'              => 'nullable|image|max:2048',
            'required_players'      => 'required|integer|min:1|max:20',
        ]);

        $event = Event::create([
            'title'                 => $data['title'],
            'description'           => $data['description'],
            'coordinator_name'      => $data['coordinator_name'],
            'event_date'            => $data['event_date'],
            'registration_end_date' => $data['registration_end_date'],
            'required_players'      => $data['required_players'],
        ]);

        // Store multiple images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('events', 'public');
                $event->images()->create(['image_path' => $path]);
            }
        }

        // Redirect to dashboard so the new event appears immediately
        return redirect()->route('dashboard')->with('success', 'Event created successfully.');
    }

    // ADMIN: Update an event with existing images support
    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        $data = $request->validate([
            'title'                 => 'required|string|max:255',
            'description'           => 'required|string',
            'coordinator_name'      => 'required|string|max:255',
            'event_date'            => 'required|date',
            'registration_end_date' => 'required|date|before_or_equal:event_date',
            'images.*'              => 'nullable|image|max:2048',
            'existing_images.*'     => 'nullable|string', // paths of existing images
            'required_players'      => 'required|integer|min:1|max:20',
        ]);

        $event->update([
            'title'                 => $data['title'],
            'description'           => $data['description'],
            'coordinator_name'      => $data['coordinator_name'],
            'event_date'            => $data['event_date'],
            'registration_end_date' => $data['registration_end_date'],
            'required_players'      => $data['required_players'],
        ]);

        // Remove deleted images
        $existingImages = $request->input('existing_images', []);
        $event->images()->whereNotIn('image_path', $existingImages)->each(function ($img) {
            Storage::disk('public')->delete($img->image_path);
            $img->delete();
        });

        // Add new uploaded images
        if ($request->hasFile('images')) {
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

        // Delete all images from storage
        $event->images()->each(function ($img) {
            Storage::disk('public')->delete($img->image_path);
            $img->delete();
        });

        $event->delete();

        return redirect()->back()->with('success', 'Event deleted successfully.');
    }

    // PUBLIC: Welcome page (list all events)
    public function welcome()
    {
        $events = Event::select(
            'id',
            'title',
            'description',
            'coordinator_name',
            'event_date',
            'registration_end_date',
            'required_players'
        )
            ->with('images')
            ->orderBy('event_date')
            ->get();

        $events->transform(function ($event) {
            $event->images_path = $event->images->pluck('image_path');
            return $event;
        });

        return Inertia::render('Welcome', [
            'events' => $events,
        ]);
    }
    public function markDone($id)
    {
        $event = Event::findOrFail($id);
        $event->is_done = 1; // mark as done
        $event->save();

        return response()->json([
            'success' => true,
            'message' => 'Event marked as done!',
        ]);
    }
    public function markUndone($id)
    {
        $event = Event::findOrFail($id);
        $event->is_done = false;
        $event->save();

        return response()->json(['message' => 'Event marked as undone']);
    }
}
