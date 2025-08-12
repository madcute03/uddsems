<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\EventRegistration;
use App\Models\Player;
use Illuminate\Support\Facades\Storage;

class EventRegistrationController extends Controller
{
    // Display all registrations with players
    public function index()
    {
        $registrations = EventRegistration::with(['event', 'players'])->get();

        return Inertia::render('Registrations/Index', [
            'registrations' => $registrations
        ]);
    }

    // Store a new registration with players
    public function store(Request $request)
    {
        $validated = $request->validate([
            'team_name'   => 'required|string|max:255',
            'event_id'    => 'required|exists:events,id',
            'players'     => 'required|array',
            'players.*.student_id' => 'required|string|max:50',
            'players.*.name'       => 'required|string|max:255',
            'players.*.department' => 'required|string|max:255',
            'players.*.image'      => 'nullable|file|image|max:2048',
            'players.*.pdf'        => 'nullable|file|mimes:pdf|max:5120',
        ]);

        // Save registration
        $registration = EventRegistration::create([
            'team_name' => $validated['team_name'],
            'event_id'  => $validated['event_id'],
        ]);

        // Save players
        foreach ($validated['players'] as $playerData) {
            $imagePath = isset($playerData['image']) ? $playerData['image']->store('players/images', 'public') : null;
            $pdfPath   = isset($playerData['pdf']) ? $playerData['pdf']->store('players/pdfs', 'public') : null;

            $registration->players()->create([
                'student_id' => $playerData['student_id'],
                'name'       => $playerData['name'],
                'department' => $playerData['department'],
                'image_path' => $imagePath,
                'pdf_path'   => $pdfPath,
            ]);
        }

        return redirect()->back()->with('success', 'Team and players registered successfully!');
    }

    // Download player's PDF
    public function downloadPDF($id)
    {
        $player = Player::findOrFail($id);

        if (!$player->pdf_path || !Storage::disk('public')->exists($player->pdf_path)) {
            abort(404, 'PDF file not found.');
        }

        return Storage::disk('public')->download($player->pdf_path);
    }
}
