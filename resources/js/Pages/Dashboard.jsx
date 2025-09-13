import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import React, { useState } from 'react'
import { usePage } from '@inertiajs/react'

function Dashboard() {
    const { auth, events = [] } = usePage().props;
    const user = auth.user;

    // Inline editing state
    const [editingEventId, setEditingEventId] = useState(null);
    const [editData, setEditData] = useState({
        title: '',
        description: '',
        coordinator_name: '',
        event_date: '',
        registration_end_date: '',
        images: [],
        existingImages: [],
        required_players: '',
    });

    const startEdit = (event) => {
        setEditingEventId(event.id);
        setEditData({
            title: event.title || '',
            description: event.description || '',
            coordinator_name: event.coordinator_name || '',
            event_date: event.event_date || '',
            registration_end_date: event.registration_end_date || '',
            images: [],
            existingImages: event.images_path || [],
            required_players: event.required_players || '',
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(editData).forEach(([key, val]) => {
            if (key === 'images') {
                val.forEach((img) => img && formData.append('images[]', img));
            } else if (key === 'existingImages') {
                val.forEach((imgPath) => formData.append('existing_images[]', imgPath));
            } else {
                formData.append(key, val);
            }
        });

        fetch(`/events/${editingEventId}`, {
            method: 'POST',
            headers: {
                'X-HTTP-Method-Override': 'PUT',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            },
            body: formData,
        }).then(() => {
            setEditingEventId(null);
            window.location.reload();
        });
    };

    const handleDelete = (id) => {
        if (!confirm('Delete this event?')) return;
        fetch(`/events/${id}`, {
            method: 'POST',
            headers: {
                'X-HTTP-Method-Override': 'DELETE',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            },
        }).then(() => window.location.reload());
    };

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black text-slate-100">
                <div className="flex items-center justify-center py-10">
                    <div className="flex items-center gap-10 flex-col md:flex-row">
                        {/* Super Large Logo */}
                        <img src="/images/sems.png" alt="Logo" className="h-40 w-40 rounded-full object-cover ring-4 ring-blue-500/60 shadow-2xl shadow-blue-900/40" />

                        {/* Big Text */}
                        <div className="text-center md:text-left">
                            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-300">Welcome!</span>
                                <span className="block md:inline md:ml-3 text-blue-300">{user.name}</span>
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Events List */}
                <div className="mx-auto max-w-5xl px-4 pb-12">
                    <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl shadow-lg shadow-blue-950/30">
                        <h2 className="text-xl font-semibold mb-4">Events</h2>
                        {events.length === 0 && <p className="text-slate-400">No events created.</p>}
                        {events.map(event => (
                            <div key={event.id} className="border-b border-slate-800 py-4">
                                {editingEventId === event.id ? (
                                    <form onSubmit={handleEditSubmit} encType="multipart/form-data" className="space-y-2">
                                        <input
                                            type="text"
                                            value={editData.title}
                                            onChange={e => setEditData({ ...editData, title: e.target.value })}
                                            className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 placeholder-slate-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                                        />
                                        <textarea
                                            value={editData.description}
                                            onChange={e => setEditData({ ...editData, description: e.target.value })}
                                            className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 placeholder-slate-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                                        />
                                        <input
                                            type="text"
                                            value={editData.coordinator_name}
                                            onChange={e => setEditData({ ...editData, coordinator_name: e.target.value })}
                                            className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 placeholder-slate-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <input
                                                type="date"
                                                value={editData.event_date}
                                                onChange={e => setEditData({ ...editData, event_date: e.target.value })}
                                                className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                                            />
                                            <input
                                                type="date"
                                                value={editData.registration_end_date}
                                                onChange={e => setEditData({ ...editData, registration_end_date: e.target.value })}
                                                className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                                            />
                                        </div>
                                        <select
                                            className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                                            value={editData.required_players || ''}
                                            onChange={e => setEditData({ ...editData, required_players: e.target.value })}
                                            required
                                        >
                                            <option value="">Select number of players</option>
                                            {[...Array(20)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                                            ))}
                                        </select>

                                        {/* Images uploader */}
                                        {editData.images.map((img, idx) => (
                                            <input
                                                key={idx}
                                                type="file"
                                                className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 rounded-md mt-1 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                                                onChange={e => {
                                                    const newImages = [...editData.images];
                                                    newImages[idx] = e.target.files[0];
                                                    setEditData({ ...editData, images: newImages });
                                                }}
                                            />
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setEditData({ ...editData, images: [...editData.images, null] })}
                                            className="text-blue-300 hover:text-blue-200 underline"
                                        >
                                            + Add image
                                        </button>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {editData.existingImages?.map((imgPath, idx) => (
                                                <div key={idx} className="relative">
                                                    <img src={`/storage/${imgPath}`} className="w-24 h-24 object-cover rounded" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newImagesPath = [...editData.existingImages];
                                                            newImagesPath.splice(idx, 1);
                                                            setEditData({ ...editData, existingImages: newImagesPath });
                                                        }}
                                                        className="absolute top-0 right-0 bg-red-600 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-2">
                                            <button type="submit" className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md">Save</button>
                                            <button type="button" onClick={() => setEditingEventId(null)} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-md">Cancel</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex justify-between items-start gap-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-blue-300">{event.title}</h3>
                                            <p className="text-slate-200">{event.description}</p>
                                            <p className="text-sm text-slate-400">By {event.coordinator_name} | {event.event_date}</p>
                                            {event.registration_end_date && (
                                                <p className="text-sm text-red-400">Registration Until: {event.registration_end_date}</p>
                                            )}
                                            {event.images_path?.map((imgPath, idx) => (
                                                <img key={idx} src={`/storage/${imgPath}`} className="w-32 mt-2 rounded" />
                                            ))}
                                            {event.is_done && (
                                                <p className="text-green-400 font-bold mt-2">✓ Done</p>
                                            )}
                                        </div>
                                        <div className="space-x-2">
                                            <button onClick={() => startEdit(event)} className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-3 py-1 rounded-md">Edit</button>
                                            <button onClick={() => handleDelete(event.id)} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-md">Delete</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}

export default Dashboard
