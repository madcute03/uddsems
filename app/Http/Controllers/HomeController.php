<?php

use App\Models\Event;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function welcome()
    {
        $events = Event::orderBy('event_date')->get();
        return Inertia::render('Welcome', [
            'events' => $events,
        ]);
    }
}
