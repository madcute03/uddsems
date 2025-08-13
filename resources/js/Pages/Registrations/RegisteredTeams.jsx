import { Head, Link } from '@inertiajs/react';

export default function RegisteredTeams({ registrations }) {
    return (
        <>
            <Head title="Registered Teams" />
            <div className="min-h-screen bg-gray-100 py-10 px-4">
                <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow">
                    <h1 className="text-2xl font-bold mb-4">Registered Teams</h1>

                    {registrations.length === 0 ? (
                        <p className="text-gray-600">No teams have registered yet.</p>
                    ) : (
                        <div className="space-y-8">
                            {registrations.map((reg) => (
                                <div key={reg.id} className="border p-4 rounded">
                                    <h2 className="font-bold text-lg mb-2">
                                        TeamName: {reg.team_name || `Team of ${reg.players.map(p => p.name).join(', ')}`}
                                    </h2>

                                    <table className="w-full table-auto border-collapse">
                                        <thead>
                                            <tr className="bg-gray-200">
                                                <th className="border px-2 py-1">#</th>
                                                <th className="border px-2 py-1">Name</th>
                                                <th className="border px-2 py-1">Student ID</th>
                                                <th className="border px-2 py-1">Department</th>
                                                <th className="border px-2 py-1">Age</th>
                                                <th className="border px-2 py-1">Player Image</th>
                                                <th className="border px-2 py-1">Whiteform Image</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reg.players.map((player, pIndex) => (
                                                <tr key={player.id}>
                                                    <td className="border px-2 py-1 text-center">{pIndex + 1}</td>
                                                    <td className="border px-2 py-1">{player.name}</td>
                                                    <td className="border px-2 py-1">{player.student_id}</td>
                                                    <td className="border px-2 py-1">{player.department}</td>
                                                    <td className="border px-2 py-1">{player.age}</td>
                                                    <td className="border px-2 py-1">
                                                        {player.player_image && (
                                                            <img
                                                                src={`/storage/${player.player_image}`}
                                                                alt="Player"
                                                                className="h-16 w-16 object-cover rounded"
                                                            />
                                                        )}
                                                    </td>
                                                    <td className="border px-2 py-1">
                                                        {player.whiteform_image && (
                                                            <img
                                                                src={`/storage/${player.whiteform_image}`}
                                                                alt="Whiteform"
                                                                className="h-16 w-16 object-cover rounded"
                                                            />
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    )}

                    <Link href={route('home')} className="mt-6 block text-blue-600 hover:underline">
                        ← Back to Events
                    </Link>
                </div>
            </div>
        </>
    );
}
