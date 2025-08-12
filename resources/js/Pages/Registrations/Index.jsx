import React from 'react';
import { Head, usePage } from '@inertiajs/react';

export default function Index() {
    const { registrations } = usePage().props;

    return (
        <>
            <Head title="Registered Teams & Players" />

            <div className="container mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-6">Registered Teams and Players</h1>

                {registrations.length === 0 ? (
                    <p className="text-gray-500">No registrations found.</p>
                ) : (
                    registrations.map((registration) => (
                        <div
                            key={registration.id}
                            className="bg-white rounded shadow p-4 mb-6 border border-gray-200"
                        >
                            <div className="mb-4">
                                <p><strong>Team:</strong> {registration.team_name || 'No Team Name'}</p>
                                <p><strong>Event:</strong> {registration.event?.title || 'No Event'}</p>
                            </div>

                            {registration.players.length === 0 ? (
                                <p className="text-gray-500">No players registered.</p>
                            ) : (
                                <table className="table-auto w-full text-sm border">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="px-3 py-2 border">Student ID</th>
                                            <th className="px-3 py-2 border">Name</th>
                                            <th className="px-3 py-2 border">Department</th>
                                            <th className="px-3 py-2 border">PlayerImage</th>
                                            <th className="px-3 py-2 border">Whiteform</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {registration.players.map((player) => (
                                            <tr key={player.id}>
                                                <td className="px-3 py-2 border">{player.student_id}</td>
                                                <td className="px-3 py-2 border">{player.name}</td>
                                                <td className="px-3 py-2 border">{player.department}</td>
                                                <td className="px-3 py-2 border text-center">
                                                    {player.image_path ? (
                                                        <img
                                                            src={`/storage/${player.image_path}`}
                                                            alt="Player"
                                                            className="h-10 w-10 rounded-full object-cover mx-auto"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-400 italic">No Image</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 border text-center">
                                                    {player.pdf_path ? (
                                                        <a
                                                            href={`/players/${player.id}/download-pdf`}
                                                            className="text-blue-500 hover:underline"
                                                        >
                                                            Download
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400 italic">No PDF</span>
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
