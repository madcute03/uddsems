import { Head, useForm, Link } from '@inertiajs/react';
import { useEffect } from 'react';

export default function RegisterEvent({ event, requiredPlayers }) {
    const { data, setData, post, errors, reset } = useForm({
        team_name: '',
        players: Array.from({ length: requiredPlayers }, () => ({
            student_id: '',
            name: '',
            email: '',
            department: '',
            age: '',
            player_image: null,
            whiteform_image: null,
        })),
    });

    useEffect(() => {
        setData('players', Array.from({ length: requiredPlayers }, () => ({
            student_id: '',
            name: '',
            email: '',
            department: '',
            age: '',
            player_image: null,
            whiteform_image: null,
        })));
    }, [requiredPlayers]);

    const handlePlayerChange = (index, field, value) => {
        const newPlayers = [...data.players];
        newPlayers[index][field] = value;
        setData('players', newPlayers);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // ✅ Strict email validation before submit
        for (let i = 0; i < data.players.length; i++) {
            const email = data.players[i].email.trim();
            if (!email.endsWith('@cdd.edu.ph')) {
                alert(`Player ${i + 1}: Email must end with @cdd.edu.ph`);
                return; // Stop form submission
            }
        }

        const formData = new FormData();
        if (requiredPlayers > 1) formData.append('team_name', data.team_name);

        data.players.forEach((player, i) => {
            formData.append(`players[${i}][student_id]`, player.student_id);
            formData.append(`players[${i}][name]`, player.name);
            formData.append(`players[${i}][email]`, player.email);
            formData.append(`players[${i}][department]`, player.department);
            formData.append(`players[${i}][age]`, player.age);
            formData.append(`players[${i}][player_image]`, player.player_image);
            formData.append(`players[${i}][whiteform_image]`, player.whiteform_image);
        });

        post(route('eventregistrations.store', event.id), formData, {
            forceFormData: true,
            onFinish: () => reset(),
        });
    };

    return (
        <>
            <Head title={`Register: ${event.title}`} />
            <div className="min-h-screen bg-gray-100 py-10 px-4">
                <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
                    <h1 className="text-2xl font-bold mb-4">Register for {event.title}</h1>

                    <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                        {requiredPlayers > 1 && (
                            <div>
                                <label className="block mb-1 font-medium">Team Name *</label>
                                <input
                                    type="text"
                                    value={data.team_name}
                                    onChange={(e) => setData('team_name', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />
                                {errors.team_name && <p className="text-red-600 text-sm">{errors.team_name}</p>}
                            </div>
                        )}

                        {data.players.map((player, index) => (
                            <div key={index} className="border p-4 rounded space-y-2">
                                <h2 className="font-bold mb-2">Player {index + 1}</h2>

                                <input
                                    type="text"
                                    placeholder="Student ID"
                                    value={player.student_id}
                                    onChange={(e) => handlePlayerChange(index, 'student_id', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    pattern="[0-9\-]+"
                                    title="Only numbers and dashes allowed, e.g., 2025-001"
                                    required
                                />

                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={player.name}
                                    onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />

                                {/* ✅ Email restricted to @cdd.edu.ph */}
                                <input
                                    type="email"
                                    placeholder="Email (must end with @cdd.edu.ph)"
                                    value={player.email}
                                    onChange={(e) => handlePlayerChange(index, 'email', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    pattern="^[a-zA-Z0-9._%+-]+@cdd\.edu\.ph$"
                                    title="Email must be a valid @cdd.edu.ph address"
                                    required
                                />

                                <input
                                    type="text"
                                    placeholder="Department"
                                    value={player.department}
                                    onChange={(e) => handlePlayerChange(index, 'department', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />

                                <input
                                    type="number"
                                    placeholder="Age"
                                    value={player.age}
                                    onChange={(e) => handlePlayerChange(index, 'age', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />

                                <div>
                                    <label className="block mb-1">Player Image *</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handlePlayerChange(index, 'player_image', e.target.files[0])}
                                        className="w-full"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1">Whiteform Image *</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handlePlayerChange(index, 'whiteform_image', e.target.files[0])}
                                        className="w-full"
                                        required
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                            Submit Registration
                        </button>
                    </form>

                    <Link href={route('home')} className="mt-6 block text-blue-600 hover:underline">
                        ← Back to Events
                    </Link>
                </div>
            </div>
        </>
    );
}
