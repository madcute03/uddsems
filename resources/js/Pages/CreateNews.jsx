import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function CreateNews() {
  const { data, setData, post, processing, reset, errors } = useForm({
    title: '',
    content: '',
    category: '',
    tags: '', // comma-separated
    published_at: '', // datetime-local
    location: '',
    author: '',
    cover_image: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('news.store'), {
      onSuccess: () => reset(),
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Create News" />
      <div className="py-12">
        <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6 text-slate-100">

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl shadow-lg shadow-blue-950/30">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create News</h2>
              <Link href={route('dashboard')} className="btn-blue-glow">Back</Link>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4" encType="multipart/form-data">
              <div>
                <label className="block mb-1 text-slate-300">Title / Headline</label>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 placeholder-slate-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                  required
                />
                {errors.title && <p className="text-red-300 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Cover Image */}
              <div>
                <label className="block mb-1 text-slate-300">Cover Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setData('cover_image', e.target.files?.[0] || null)}
                  className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 rounded-md file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                />
                {errors.cover_image && <p className="text-red-300 text-sm mt-1">{errors.cover_image}</p>}
                {data.cover_image && (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={URL.createObjectURL(data.cover_image)}
                      alt="Cover preview"
                      className="h-24 w-24 object-cover rounded border border-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => setData('cover_image', null)}
                      className="btn-blue-glow"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-1">Recommended: JPG/PNG up to 4MB.</p>
              </div>

              <div>
                <label className="block mb-1 text-slate-300">Content / Description</label>
                <textarea
                  value={data.content}
                  onChange={(e) => setData('content', e.target.value)}
                  rows={6}
                  className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 placeholder-slate-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                  required
                />
                {errors.content && <p className="text-red-300 text-sm mt-1">{errors.content}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-slate-300">Category / Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={data.tags}
                    onChange={(e) => setData('tags', e.target.value)}
                    placeholder="e.g. Announcement, Sports, Campus"
                    className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 placeholder-slate-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-slate-300">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={data.published_at}
                    onChange={(e) => setData('published_at', e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-300">Location / Venue</label>
                  <input
                    type="text"
                    value={data.location}
                    onChange={(e) => setData('location', e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 placeholder-slate-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-300">Organizer / Author</label>
                <input
                  type="text"
                  value={data.author}
                  onChange={(e) => setData('author', e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 placeholder-slate-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={processing} className="w-[131px] h-[45px] rounded-[15px] cursor-pointer 
                                                               transition duration-300 ease-in-out 
                                                               bg-gradient-to-br from-[#2e8eff] to-[#2e8eff]/0 
                                                               bg-[#2e8eff]/20 flex items-center justify-center 
                                                               hover:bg-[#2e8eff]/70 hover:shadow-[0_0_10px_rgba(46,142,255,0.5)] 
                                                               focus:outline-none focus:bg-[#2e8eff]/70 focus:shadow-[0_0_10px_rgba(46,142,255,0.5)]">
                  {processing ? 'Saving...' : 'Create News'}
                </button>
                <button type="button" onClick={() => reset()} className="w-[131px] h-[45px] rounded-[15px] cursor-pointer 
                                                               transition duration-300 ease-in-out 
                                                               bg-gradient-to-br from-[#ff0000] to-[#ff0000]/0 
                                                               bg-[#ff0000]/20 flex items-center justify-center 
                                                               hover:bg-[#ff0000]/70 hover:shadow-[0_0_10px_rgba(46,142,255,0.5)] 
                                                               focus:outline-none focus:bg-[#ff0000]/70 focus:shadow-[0_0_10px_rgba(46,142,255,0.5)]">
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
