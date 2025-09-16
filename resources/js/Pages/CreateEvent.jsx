import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';

export default function CreateEvent({ auth, events = [] }) {
    const { data, setData, post, processing, reset } = useForm({
        title: '',
        description: '',
        coordinator_name: '',
        event_date: '',
        registration_end_date: '', // 
        images: [],
        required_players: '',
    });

    const [editingEventId, setEditingEventId] = useState(null);
    const [editData, setEditData] = useState({
        title: '',
        description: '',
        coordinator_name: '',
        event_date: '',
        registration_end_date: '', // 
        images: [],
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
            registration_end_date: event.registration_end_date || '',
            images: [], // bagong uploads
            existingImages: event.images_path || [], // existing images
            required_players: event.required_players,
        });
    };


    const handleEditSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();

        Object.entries(editData).forEach(([key, val]) => {
            if (key === 'images') {
                val.forEach(img => img && formData.append('images[]', img));
            } else if (key === 'existingImages') {
                val.forEach(imgPath => formData.append('existing_images[]', imgPath));
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
    const handleMarkDone = (id) => {
        fetch(`/events/${id}/done`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        })
            .then(async res => {
                if (!res.ok) throw new Error("Failed request");
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    window.location.reload();
                } else {
                    alert("Failed to mark event as done.");
                }
            })
            .catch(err => console.error(err));
    };





    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="CreateEvent" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Create Event Form */}
                    <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl shadow-lg shadow-blue-950/30">


                        <h2 className="text-lg font-semibold mb-4">Create Event</h2>
                        <form onSubmit={handleSubmit} encType="multipart/form-data">
                            <div className="mb-2">
                                <label className="block mb-1 text-slate-300">Event Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 placeholder-slate-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                />
                            </div>
                            <div className="mb-2">
                                <label className="block mb-1 text-slate-300">Description</label>
                                <textarea
                                    className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 placeholder-slate-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                />
                            </div>
                            <div className="mb-2">
                                <label className="block mb-1 text-slate-300">Coordinator</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 placeholder-slate-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                                    value={data.coordinator_name}
                                    onChange={e => setData('coordinator_name', e.target.value)}
                                />
                            </div>
                            <div className="mb-2">
                                <label className="block mb-1 text-slate-300">Event Start Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                                    value={data.event_date}
                                    onChange={e => setData('event_date', e.target.value)}
                                />
                            </div>
                            <div className="mb-2">
                                <label className="block mb-1 text-slate-300">Registration End Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                                    value={data.registration_end_date}
                                    onChange={e => setData('registration_end_date', e.target.value)}
                                />
                            </div>

                            {/* Images */}
                            <div className="mb-2">
                                <label className="block mb-1 text-slate-300">Image of the event</label>
                                {data.images.map((img, idx) => (
                                    <input
                                        key={idx}
                                        type="file"
                                        className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 rounded-md mt-1 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
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
                                    className="mt-2 text-blue-300 hover:text-blue-200 underline"
                                >
                                    + Add image
                                </button>
                            </div>

                            <div className="mb-2">
                                <label className="block mb-1 text-slate-300">Required Player for this Event</label>
                                <select
                                    className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                                    value={data.required_players || ''}
                                    onChange={e => setData('required_players', e.target.value)}
                                    required
                                >
                                    <option value="">Select number of players</option>
                                    {[...Array(20)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </select>
                            </div>

                            <button type="submit" className="w-[131px] h-[45px] rounded-[15px] cursor-pointer 
                                                               transition duration-300 ease-in-out 
                                                               bg-gradient-to-br from-[#2e8eff] to-[#2e8eff]/0 
                                                               bg-[#2e8eff]/20 flex items-center justify-center 
                                                               hover:bg-[#2e8eff]/70 hover:shadow-[0_0_10px_rgba(46,142,255,0.5)] 
                                                               focus:outline-none focus:bg-[#2e8eff]/70 focus:shadow-[0_0_10px_rgba(46,142,255,0.5)]">
                                Create Event
                            </button>
                        </form>
                    </div>

                    {/* Event List moved to Dashboard */}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}