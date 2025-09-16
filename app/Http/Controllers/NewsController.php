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
        $news = News::orderByDesc('created_at')->get();
        
        return Inertia::render('CreateNews', [
            'news' => $news,
        ]);
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

        return redirect()->route('news.index')->with('success', 'News created successfully.');
    }

    // Update news
    public function update(Request $request, News $news)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'tags' => 'nullable|string',
            'published_at' => 'nullable|date',
            'location' => 'nullable|string|max:255',
            'author' => 'nullable|string|max:255',
        ]);

        $tagsArray = [];
        if (!empty($validated['tags'])) {
            $tagsArray = collect(explode(',', $validated['tags']))
                ->map(fn($t) => trim($t))
                ->filter()
                ->values()
                ->all();
        }

        $news->update([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'tags' => $tagsArray,
            'published_at' => $validated['published_at'] ?? null,
            'location' => $validated['location'] ?? null,
            'author' => $validated['author'] ?? null,
        ]);

        return redirect()->route('news.index')->with('success', 'News updated successfully.');
    }

    // Delete news
    public function destroy(News $news)
    {
        if ($news->cover_image) {
            Storage::disk('public')->delete($news->cover_image);
        }
        
        $news->delete();
        
        return redirect()->route('news.index')->with('success', 'News deleted successfully.');
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
