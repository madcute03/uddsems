import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import React, { useState } from 'react'
import { usePage, Link } from '@inertiajs/react'

function Dashboard() {
    const { auth, events = [] } = usePage().props;
    const user = auth.user;

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

    const handleMarkDone = (id) => {
        fetch(`/events/${id}/mark-done`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            },
        }).then(() => window.location.reload());
    };

    const handleMarkUndone = (id) => {
        fetch(`/events/${id}/mark-undone`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            },
        }).then(() => window.location.reload());
    };

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black text-slate-100">
                <div className="flex items-center justify-center py-10">
                    <div className="flex items-center gap-10 flex-col md:flex-row">
                        <img src="/images/sems.png" alt="Logo" className="h-40 w-40 rounded-full object-cover ring-4 ring-blue-500/60 shadow-2xl shadow-blue-900/40" />
                        <div className="text-center md:text-left">
                            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-300">Welcome!</span>
                                <span className="block md:inline md:ml-3 text-blue-300">{user.name}</span>
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded shadow text-white">
                    <h2 className="text-lg font-semibold mb-4">Events</h2>
                    {events.length === 0 && <p>No events created.</p>}

                    {events.map(event => (
                        <div key={event.id} className="border-b py-4">
                            <p className="text-sm text-gray-500">Required Players: {event.required_players}</p>

                            {editingEventId === event.id ? (
                                <form onSubmit={handleEditSubmit} encType="multipart/form-data" className="space-y-2">
                                    <div>
                                        <label className="block text-sm">Title</label>
                                        <input
                                            type="text"
                                            value={editData.title}
                                            onChange={e => setEditData({ ...editData, title: e.target.value })}
                                            className="w-full border text-black px-2 py-1 rounded"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm">Description</label>
                                        <textarea
                                            value={editData.description}
                                            onChange={e => setEditData({ ...editData, description: e.target.value })}
                                            className="w-full border text-black px-2 py-1 rounded"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm">Coordinator Name</label>
                                        <input
                                            type="text"
                                            value={editData.coordinator_name}
                                            onChange={e => setEditData({ ...editData, coordinator_name: e.target.value })}
                                            className="w-full border text-black px-2 py-1 rounded"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm">Event Date</label>
                                        <input
                                            type="date"
                                            value={editData.event_date}
                                            onChange={e => setEditData({ ...editData, event_date: e.target.value })}
                                            className="w-full border text-black px-2 py-1 rounded"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm">Registration End Date</label>
                                        <input
                                            type="date"
                                            value={editData.registration_end_date}
                                            onChange={e => setEditData({ ...editData, registration_end_date: e.target.value })}
                                            className="w-full border text-black px-2 py-1 rounded"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm">Images</label>
                                        {editData.images.map((img, idx) => (
                                            <input
                                                key={idx}
                                                type="file"
                                                className="w-full border mt-1 text-white"
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
                                            className="text-blue-400 underline mt-2"
                                        >
                                            + Add image
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {editData.existingImages?.map((imgPath, idx) => (
                                            <div key={idx} className="relative">
                                                <img src={`/storage/${imgPath}`} alt="Existing event" className="w-24 h-24 object-cover rounded" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newImagesPath = [...editData.existingImages];
                                                        newImagesPath.splice(idx, 1);
                                                        setEditData({ ...editData, existingImages: newImagesPath });
                                                    }}
                                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div>
                                        <label className="block text-sm">Required Players</label>
                                        <select
                                            className="w-full border text-black px-2 py-1 rounded"
                                            value={editData.required_players || ''}
                                            onChange={e => setEditData({ ...editData, required_players: e.target.value })}
                                            required
                                        >
                                            <option value="">Select number of players</option>
                                            {[...Array(20)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex gap-2 mt-2">
                                        <button type="submit" className="px-3 py-1 bg-blue-500 text-white rounded">Save</button>
                                        <button type="button" onClick={() => setEditingEventId(null)} className="px-3 py-1 bg-gray-300 text-black rounded">Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex justify-between items-start gap-3 flex-col md:flex-row">
                                    <div>
                                        <h3 className="text-lg font-semibold">{event.title}</h3>
                                        <p>{event.description}</p>
                                        <p className="text-sm text-gray-500">By {event.coordinator_name} | {event.event_date}</p>
                                        <p className="text-sm text-red-500">Registration Until: {event.registration_end_date}</p>
                                        {event.images_path?.map((imgPath, idx) => (
                                            <img key={idx} src={`/storage/${imgPath}`} alt="Event" className="w-32 mt-2 rounded" />
                                        ))}

                                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                                            {event.is_done ? (
                                                <>
                                                    <span className="text-green-500 font-semibold">✓ Done</span>
                                                    <button
                                                        onClick={() => handleMarkUndone(event.id)}
                                                        className="bg-slate-800 text-white px-3 py-1 rounded hover:bg-slate-700 transition"
                                                    >
                                                        Mark as Undone
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleMarkDone(event.id)}
                                                    className="bg-blue-900 text-white px-3 py-1 rounded hover:bg-blue-800 transition"
                                                >
                                                    Mark as Done
                                                </button>
                                            )}

                                            <Link
                                                href={route('events.registrations', event.id)}
                                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition"
                                            >
                                                View Registered Teams
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-3 md:mt-0">
                                        <button onClick={() => startEdit(event)} className="bg-yellow-500 text-white px-3 py-1 rounded">Edit</button>
                                        <button onClick={() => handleDelete(event.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    )
}

export default Dashboard;
