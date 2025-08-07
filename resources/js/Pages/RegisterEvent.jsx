import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function RegisterEvent({ event }) {
    const requiredPlayers = event.required_players || 1;

    const [players, setPlayers] = useState(
        Array.from({ length: requiredPlayers }, () => ({ studentId: '', name: '', image: null }))
    );

    const { data, setData, post, processing } = useForm({
        department: '',
        players: [],
    });

    const handleChange = (index, field, value) => {
        const updatedPlayers = [...players];
        updatedPlayers[index][field] = value;
        setPlayers(updatedPlayers);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Prepare FormData for file upload
        const formData = new FormData();
        formData.append('department', data.department);
        players.forEach((player, index) => {
            formData.append(`players[${index}][studentId]`, player.studentId);
            formData.append(`players[${index}][name]`, player.name);
            if (player.image) {
                formData.append(`players[${index}][image]`, player.image);
            }
        });

        // Submit the form
        post(route('events.register', event.id), {
            data: formData,
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title={`Register for ${event.title}`} />
            <div className="min-h-screen bg-gray-100 py-10 px-4">
                <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
                    <h1 className="text-2xl font-bold mb-4">Register for: {event.title}</h1>
                    <p className="mb-4">{event.description}</p>
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        {/* Department */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Department</label>
                            <input
                                type="text"
                                value={data.department}
                                onChange={(e) => setData('department', e.target.value)}
                                className="w-full border rounded px-3 py-2"
                                required
                            />
                        </div>

                        {/* Players */}
                        {players.map((player, index) => (
                            <div key={index} className="mb-6 border p-4 rounded">
                                <h2 className="font-semibold mb-2">
                                    {index === 0 ? 'Leader' : `Member ${index}`}
                                </h2>
                                <div className="mb-2">
                                    <label className="block text-sm font-medium mb-1">Student ID</label>
                                    <input
                                        type="text"
                                        value={player.studentId}
                                        onChange={(e) => handleChange(index, 'studentId', e.target.value)}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={player.name}
                                        onChange={(e) => handleChange(index, 'name', e.target.value)}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                    />
                                </div>
                                
                            </div>
                        ))}

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                            {processing ? 'Registering...' : 'Confirm Registration'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
