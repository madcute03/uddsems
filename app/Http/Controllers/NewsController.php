<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class NewsController extends Controller
{
    // Show Create News form
    public function index()
    {
        return Inertia::render('CreateNews');
    }

    // Store a news post
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category' => 'nullable|string|max:255',
            'tags' => 'nullable|string', // comma-separated from UI
            'published_at' => 'nullable|date',
            'location' => 'nullable|string|max:255',
            'author' => 'nullable|string|max:255',
            'cover_image' => 'nullable|image|max:4096',
        ]);

        $tagsArray = [];
        if (!empty($validated['tags'])) {
            $tagsArray = collect(explode(',', $validated['tags']))
                ->map(fn($t) => trim($t))
                ->filter()
                ->values()
                ->all();
        }

        $coverPath = null;
        if ($request->hasFile('cover_image')) {
            $coverPath = $request->file('cover_image')->store('news', 'public');
        }

        News::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'category' => $validated['category'] ?? null,
            'tags' => $tagsArray,
            'published_at' => $validated['published_at'] ?? null,
            'location' => $validated['location'] ?? null,
            'author' => $validated['author'] ?? null,
            'cover_image' => $coverPath,
        ]);

        return redirect()->route('dashboard.createnews')->with('success', 'News created successfully.');
    }

    // Public: list news
    public function publicIndex()
    {
        $news = News::orderByDesc('published_at')
            ->orderByDesc('created_at')
            ->paginate(9)
            ->withQueryString();

        return Inertia::render('News', [
            'news' => $news,
        ]);
    }

    // Public: show single news
    public function show(News $news)
    {
        return Inertia::render('ShowNews', [
            'news' => $news,
        ]);
    }
}
