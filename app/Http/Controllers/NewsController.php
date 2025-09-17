<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'required|string',
                'category' => 'nullable|string|max:255',
                'tags' => 'nullable|string',
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
                $file = $request->file('cover_image');
                $fileName = Str::random(20) . '.' . $file->getClientOriginalExtension();
                $coverPath = $file->storeAs('news', $fileName, 'public');
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

            return redirect()->route('dashboard.createnews')
                ->with('success', 'News created successfully!');
                
        } catch (\Exception $e) {
            return back()->withInput()
                ->withErrors(['error' => 'Failed to create news. ' . $e->getMessage()]);
        }
    }

    // Update news
    public function update(Request $request, News $news)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'required|string',
                'tags' => 'nullable|string',
                'published_at' => 'nullable|date',
                'location' => 'nullable|string|max:255',
                'author' => 'nullable|string|max:255',
                'cover_image' => 'nullable|image|max:4096',
            ]);

            $updateData = [
                'title' => $validated['title'],
                'content' => $validated['content'],
                'location' => $validated['location'] ?? null,
                'author' => $validated['author'] ?? null,
            ];

            // Handle tags
            if (isset($validated['tags'])) {
                $tagsArray = [];
                if (!empty($validated['tags'])) {
                    $tagsArray = collect(explode(',', $validated['tags']))
                        ->map(fn($t) => trim($t))
                        ->filter()
                        ->values()
                        ->all();
                }
                $updateData['tags'] = $tagsArray;
            }

            // Handle published_at
            if (isset($validated['published_at'])) {
                $updateData['published_at'] = $validated['published_at'];
            }

            // Handle cover image upload
            if ($request->hasFile('cover_image')) {
                // Delete old cover image if exists
                if ($news->cover_image) {
                    Storage::disk('public')->delete($news->cover_image);
                }
                
                $file = $request->file('cover_image');
                $fileName = Str::random(20) . '.' . $file->getClientOriginalExtension();
                $coverPath = $file->storeAs('news', $fileName, 'public');
                $updateData['cover_image'] = $coverPath;
            }

            $news->update($updateData);

            return response()->json([
                'message' => 'News updated successfully.',
                'news' => $news->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update news.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Delete news
    public function destroy(News $news)
    {
        try {
            if ($news->cover_image) {
                Storage::disk('public')->delete($news->cover_image);
            }
            
            $news->delete();
            
            return response()->json([
                'message' => 'News deleted successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete news.',
                'error' => $e->getMessage()
            ], 500);
        }
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
