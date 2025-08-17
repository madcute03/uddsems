import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Dashboard({ auth, events = [] }) {
    const { data, setData, post, processing, reset } = useForm({
        title: '',
        description: '',
        coordinator_name: '',
        event_date: '',
        images: [null],
        required_players: '',
    });

    const [editingEventId, setEditingEventId] = useState(null);
    const [editData, setEditData] = useState({
        title: '',
        description: '',
        coordinator_name: '',
        event_date: '',
        images: [null],
        required_players: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(data).forEach(([key, val]) => {
            if (key === 'images') {
                val.forEach(img => img && formData.append('images[]', img));
            } else {
                formData.append(key, val);
            }
        });

        post('/events', {
            data: formData,
            onSuccess: () => reset(),
        });
    };

    const startEdit = (event) => {
        setEditingEventId(event.id);
        setEditData({
            title: event.title,
            description: event.description,
            coordinator_name: event.coordinator_name,
            event_date: event.event_date,
            images: [null],
            required_players: event.required_players,
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(editData).forEach(([key, val]) => {
            if (key === 'images') {
                val.forEach(img => img && formData.append('images[]', img));
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
            body: formData
        }).then(() => {
            setEditingEventId(null);
            window.location.reload();
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this event?')) {
            fetch(`/events/${id}`, {
                method: 'POST',
                headers: {
                    'X-HTTP-Method-Override': 'DELETE',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                }
            }).then(() => window.location.reload());
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">


                    {/* Create Event Form */}


                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-lg font-semibold mb-4">Create Event</h2>
                        <form onSubmit={handleSubmit} encType="multipart/form-data">
                            <div className="mb-2">
                                <label>Event Title</label>
                                <input type="text" className="w-full border" value={data.title} onChange={e => setData('title', e.target.value)} />
                            </div>
                            <div className="mb-2">
                                <label>Description</label>
                                <textarea className="w-full border" value={data.description} onChange={e => setData('description', e.target.value)} />
                            </div>
                            <div className="mb-2">
                                <label>Coordinator</label>
                                <input type="text" className="w-full border" value={data.coordinator_name} onChange={e => setData('coordinator_name', e.target.value)} />
                            </div>
                            <div className="mb-2">
                                <label>Event Date</label>
                                <input type="date" className="w-full border" value={data.event_date} onChange={e => setData('event_date', e.target.value)} />
                            </div>
                            {/* Images */}
                            <div className="mb-2">
                                <label>Image of the event</label>
                                {data.images.map((img, idx) => (
                                    <input
                                        key={idx}
                                        type="file"
                                        className="w-full border mt-1"
                                        onChange={e => {
                                            const newImages = [...data.images];
                                            newImages[idx] = e.target.files[0];
                                            setData('images', newImages);
                                        }}
                                    />
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setData('images', [...data.images, null])}
                                    className="mt-2 text-blue-600 underline"
                                >
                                    + Add another image
                                </button>
                            </div>

                            <div className="mb-2">
                                <label>Required Player for this Event</label>
                                <select
                                    className="w-full border"
                                    value={data.required_players}
                                    onChange={e => setData('required_players', e.target.value)}
                                    required
                                >
                                    <option value="">Select number of players</option>
                                    {[...Array(20)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </select>
                            </div>

                            <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">Create Event</button>
                        </form>
                    </div>

                    {/* Event List */}
                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-lg font-semibold mb-4">Events</h2>
                        {events.length === 0 && <p>No events created.</p>}

                        {events.map(event => (
                            <div key={event.id} className="border-b py-4">
                                <p className="text-sm text-gray-500">Required Players: {event.required_players}</p>

                                {editingEventId === event.id ? (
                                    <form onSubmit={handleEditSubmit} encType="multipart/form-data" className="space-y-2">
                                        <input type="text" value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} className="w-full border" />
                                        <textarea value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} className="w-full border" />
                                        <input type="text" value={editData.coordinator_name} onChange={e => setEditData({ ...editData, coordinator_name: e.target.value })} className="w-full border" />
                                        <input type="date" value={editData.event_date} onChange={e => setEditData({ ...editData, event_date: e.target.value })} className="w-full border" />
                                        {editData.images.map((img, idx) => (
                                            <input
                                                key={idx}
                                                type="file"
                                                className="w-full border mt-1"
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
                                            className="text-blue-600 underline"
                                        >
                                            + Add another image
                                        </button>

                                        <select
                                            className="w-full border"
                                            value={editData.required_players}
                                            onChange={e => setEditData({ ...editData, required_players: e.target.value })}
                                            required
                                        >
                                            <option value="">Select number of players</option>
                                            {[...Array(20)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                                            ))}
                                        </select>

                                        <div className="flex gap-2">
                                            <button type="submit" className="px-3 py-1 bg-blue-500 text-white rounded">Save</button>
                                            <button type="button" onClick={() => setEditingEventId(null)} className="px-3 py-1 bg-gray-300 rounded">Cancel</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold">{event.title}</h3>
                                            <p>{event.description}</p>
                                            <p className="text-sm text-gray-500">By {event.coordinator_name} | {event.event_date}</p>
                                            {event.images_path?.map((imgPath, idx) => (
                                                <img key={idx} src={`/storage/${imgPath}`} className="w-32 mt-2" />
                                            ))}
                                            {event.is_done && <p className="text-green-600 font-bold">✓ Done</p>}
                                            {/* ✅ Moved View Registered Teams Button */}
                                            <Link
                                                href={route('events.registrations', event.id)}
                                                className="mt-2 inline-block bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                                            >
                                                View Registered Teams
                                            </Link>
                                        </div>
                                        <div className="space-x-2">
                                            <button onClick={() => startEdit(event)} className="bg-yellow-500 text-white px-3 py-1 rounded">Edit</button>
                                            <button onClick={() => handleDelete(event.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
