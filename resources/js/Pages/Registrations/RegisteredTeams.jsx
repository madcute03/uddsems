import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";

export default function RegisteredTeams({ registrations: initialRegistrations }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [registrations, setRegistrations] = useState(initialRegistrations);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, playerId: null, playerEmail: null, action: null });

    const handleStatusChange = () => {
        if (!modal.playerId) return;

        setLoading(true);
        router.post(route('player.updateStatus'), {
            player_id: modal.playerId,
            status: modal.action,
            email: modal.playerEmail
        }, {
            onSuccess: () => {
                const updatedRegistrations = registrations.map(reg => {
                    return {
                        ...reg,
                        players: reg.players.map(player => {
                            if (player.id === modal.playerId) {
                                return { ...player, status: modal.action };
                            }
                            return player;
                        }),
                    };
                });
                setRegistrations(updatedRegistrations);
                closeModal();
            },
            onError: (errors) => {
                console.error(errors);
                alert('Something went wrong!');
                setLoading(false);
                closeModal();
            }
        });
    };

    const openModal = (playerId, playerEmail, action) => {
        setModal({ isOpen: true, playerId, playerEmail, action });
    };

    const closeModal = () => {
        setModal({ isOpen: false, playerId: null, playerEmail: null, action: null });
        setLoading(false);
    };

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
                                                <th className="border px-2 py-1">Email</th>
                                                <th className="border px-2 py-1">Student ID</th>
                                                <th className="border px-2 py-1">Department</th>
                                                <th className="border px-2 py-1">Age</th>
                                                <th className="border px-2 py-1">Player Image</th>
                                                <th className="border px-2 py-1">Whiteform Image</th>
                                                <th className="border px-2 py-1">Status</th>
                                                <th className="border px-2 py-1">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reg.players.map((player, pIndex) => (
                                                <tr key={player.id}>
                                                    <td className="border px-2 py-1 text-center">{pIndex + 1}</td>
                                                    <td className="border px-2 py-1">{player.name}</td>
                                                    <td className="border px-2 py-1">{player.email}</td>
                                                    <td className="border px-2 py-1">{player.student_id}</td>
                                                    <td className="border px-2 py-1">{player.department}</td>
                                                    <td className="border px-2 py-1">{player.age}</td>
                                                    <td className="border px-2 py-1 text-center">
                                                        {player.player_image && (
                                                            <img
                                                                src={`/storage/${player.player_image}`}
                                                                alt="Player"
                                                                className="h-16 w-16 object-cover rounded cursor-pointer hover:scale-110 transition"
                                                                onClick={() => setSelectedImage(`/storage/${player.player_image}`)}
                                                            />
                                                        )}
                                                    </td>
                                                    <td className="border px-2 py-1 text-center">
                                                        {player.whiteform_image && (
                                                            <img
                                                                src={`/storage/${player.whiteform_image}`}
                                                                alt="Whiteform"
                                                                className="h-16 w-16 object-cover rounded cursor-pointer hover:scale-110 transition"
                                                                onClick={() => setSelectedImage(`/storage/${player.whiteform_image}`)}
                                                            />
                                                        )}
                                                    </td>
                                                    <td className="border px-2 py-1 text-center">{player.status || 'Pending'}</td>
                                                    <td className="border px-2 py-1 text-center space-x-2">
                                                        <button
                                                            className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            onClick={() => openModal(player.id, player.email, 'approved')}
                                                            disabled={player.status && player.status !== 'Pending'} // disable if status is not Pending
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            onClick={() => openModal(player.id, player.email, 'disapproved')}
                                                            disabled={player.status && player.status !== 'Pending'} // disable if status is not Pending
                                                        >
                                                            Disapprove
                                                        </button>
                                                    </td>

                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    )}

                    <Link href={route('dashboard.createevent')} className="mt-6 block text-blue-600 hover:underline">
                        ← Back
                    </Link>
                </div>
            </div>

            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                    <div className="relative">
                        <img
                            src={selectedImage}
                            alt="Preview"
                            className="max-h-[90vh] max-w-[90vw] rounded shadow-lg"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                            <button
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                onClick={() => setSelectedImage(null)}
                            >
                                ✕ Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {modal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow max-w-sm w-full text-center">
                        <h2 className="text-lg font-bold mb-4">Confirm {modal.action}</h2>
                        <p className="mb-4">Are you sure you want to {modal.action} this player?</p>
                        <div className="flex justify-center gap-4">
                            <button
                                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                                onClick={closeModal}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                className={`px-4 py-2 rounded text-white ${modal.action === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                onClick={handleStatusChange}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : modal.action.charAt(0).toUpperCase() + modal.action.slice(1)}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
