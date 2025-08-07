import React from 'react';
import { Head } from '@inertiajs/react';

export default function Index({ registrations }) {
    return (
        <>
            <Head title="Registered Teams & Players" />

            <div className="container mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-6">Registered Teams and Players</h1>

                {registrations.length === 0 ? (
                    <p>No registrations found.</p>
                ) : (
                    registrations.map((registration) => (
                        <div
                            key={registration.id}
                            className="bg-white rounded shadow p-4 mb-6 border border-gray-200"
                        >
                            <div className="mb-2">
                                <strong>Team:</strong> {registration.team_name ?? 'No Team Name'} <br />
                                <strong>Event:</strong> {registration.event?.name ?? 'No Event'}
                            </div>

                            {registration.players.length === 0 ? (
                                <p className="text-gray-500">No players registered.</p>
                            ) : (
                                <table className="table-auto w-full mt-4 text-sm">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="px-3 py-2 border">Student ID</th>
                                            <th className="px-3 py-2 border">Name</th>
                                            <th className="px-3 py-2 border">Department</th>
                                            <th className="px-3 py-2 border">Image</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {registration.players.map((player) => (
                                            <tr key={player.id}>
                                                <td className="px-3 py-2 border">{player.student_id}</td>
                                                <td className="px-3 py-2 border">{player.name}</td>
                                                <td className="px-3 py-2 border">{player.department}</td>
                                                <td className="px-3 py-2 border">
                                                    {player.image_path ? (
                                                        <img
                                                            src={`/storage/${player.image_path}`}
                                                            alt="Player"
                                                            className="h-10 w-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        'No Image'
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    ))
                )}
            </div>
        </>
    );
}
