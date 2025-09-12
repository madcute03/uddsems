import React, { useState } from "react";
import { Link, Head } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

// Double Elimination Brackets
import DEBracket3 from "@/Pages/Bracket/DoubleEliminationBracket/Bracket3/Bracket";
import DEBracket4 from "@/Pages/Bracket/DoubleEliminationBracket/Bracket4/Bracket";
import DEBracket5 from "@/Pages/Bracket/DoubleEliminationBracket/Bracket5/Bracket";
import DEBracket6 from "@/Pages/Bracket/DoubleEliminationBracket/Bracket6/Bracket";
import DEBracket7 from "@/Pages/Bracket/DoubleEliminationBracket/Bracket7/Bracket";
import DEBracket8 from "@/Pages/Bracket/DoubleEliminationBracket/Bracket8/Bracket";

// Single Elimination Brackets
import SEBracket2 from "@/Pages/Bracket/SingleEliminationBracket/Bracket2/Bracket2";
import SEBracket3 from "@/Pages/Bracket/SingleEliminationBracket/Bracket3/Bracket3";
import SEBracket4 from "@/Pages/Bracket/SingleEliminationBracket/Bracket4/Bracket4";
import SEBracket5 from "@/Pages/Bracket/SingleEliminationBracket/Bracket5/Bracket5";
import SEBracket6 from "@/Pages/Bracket/SingleEliminationBracket/Bracket6/Bracket6";
import SEBracket7 from "@/Pages/Bracket/SingleEliminationBracket/Bracket7/Bracket7";
import SEBracket8 from "@/Pages/Bracket/SingleEliminationBracket/Bracket8/Bracket8";

export default function CreateBracket({ events = [] }) {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [bracketType, setBracketType] = useState(null); // "single" or "double"
    const [teamCount, setTeamCount] = useState(null);

    // Map team count to the correct bracket component
    const doubleEliminationBrackets = {
        3: DEBracket3,
        4: DEBracket4,
        5: DEBracket5,
        6: DEBracket6,
        7: DEBracket7,
        8: DEBracket8,
    };

    const singleEliminationBrackets = {
        2: SEBracket2,
        3: SEBracket3,
        4: SEBracket4,
        5: SEBracket5,
        6: SEBracket6,
        7: SEBracket7,
        8: SEBracket8,
    };

    const SelectedBracket =
        bracketType === "double"
            ? teamCount
                ? doubleEliminationBrackets[teamCount]
                : null
            : bracketType === "single"
                ? teamCount
                    ? singleEliminationBrackets[teamCount]
                    : null
                : null;

    return (
        <AuthenticatedLayout>
            <Head title="Create Bracket" />
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Select Event for Bracket</h1>
                {events.length === 0 ? (
                    <p className="text-gray-600">No events available.</p>
                ) : (
                    <div className="space-y-4">
                        {events.map((event) => (
                            <div
                                key={event.id}
                                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
                            >
                                <h2 className="text-lg font-semibold">{event.title}</h2>
                                <p className="text-gray-700">{event.description}</p>
                                <p className="text-sm text-gray-500">Date: {event.event_date}</p>

                                <button
                                    onClick={() => {
                                        setSelectedEvent(event);
                                        setBracketType(null);
                                        setTeamCount(null);
                                    }}
                                    className="mt-2 inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Create and Reset Bracket
                                </button>
                                <br />
                                <button
                                    onClick={() => {
                                        if (event.bracket_type && event.teams) {
                                            // Already has bracket → open it directly
                                            setSelectedEvent(event);
                                            setBracketType(event.bracket_type);
                                            setTeamCount(event.teams);
                                        } else {
                                            // No bracket yet → show alert/modal
                                            alert("You have not created a bracket yet for this event.");
                                        }
                                    }}
                                    className="mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    View Created Bracket
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Step 1: Choose Bracket Type */}
                {selectedEvent && !bracketType && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                            <h2 className="text-xl font-bold mb-4">
                                Choose Bracket Type for {selectedEvent.title}
                            </h2>

                            <div className="space-y-3">
                                <button
                                    onClick={() => setBracketType("single")}
                                    className="block w-full bg-green-600 text-white px-4 py-2 rounded text-center hover:bg-green-700"
                                >
                                    Single Elimination
                                </button>

                                <button
                                    onClick={() => setBracketType("double")}
                                    className="block w-full bg-purple-600 text-white px-4 py-2 rounded text-center hover:bg-purple-700"
                                >
                                    Double Elimination
                                </button>
                            </div>

                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="mt-4 w-full bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Choose Number of Teams */}
                {selectedEvent && bracketType && !teamCount && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                            <h2 className="text-xl font-bold mb-4">
                                Select Number of Teams (
                                {bracketType === "single" ? "Single" : "Double"} Elimination)
                            </h2>

                            <div className="grid grid-cols-2 gap-3">
                                {bracketType === "single"
                                    ? [2, 3, 4, 5, 6, 7, 8].map((count) => (
                                        <button
                                            key={count}
                                            onClick={() => {
                                                Inertia.post(`/events/${selectedEvent.id}/bracket-settings`, {
                                                    bracket_type: bracketType,
                                                    teams: count,
                                                }, {
                                                    onSuccess: () => {
                                                        setTeamCount(count);
                                                    },
                                                    onError: (errors) => {
                                                        console.error(errors);
                                                        alert("Failed to save bracket settings.");
                                                    }
                                                });

                                                setTeamCount(count);
                                            }}
                                            className="block bg-green-600 text-white px-4 py-2 rounded text-center hover:bg-green-700"
                                        >
                                            {count} Teams
                                        </button>
                                    ))
                                    : [3, 4, 5, 6, 7, 8].map((count) => (
                                        <button
                                            key={count}
                                            onClick={() => {
                                                Inertia.post(
                                                    route("bracket.storeSettings", {
                                                        event: selectedEvent.id,
                                                    }),
                                                    {
                                                        bracket_type: bracketType,
                                                        teams: count,
                                                    }
                                                );
                                                setTeamCount(count);
                                            }}
                                            className="block bg-purple-600 text-white px-4 py-2 rounded text-center hover:bg-purple-700"
                                        >
                                            {count} Teams
                                        </button>
                                    ))}
                            </div>

                            <button
                                onClick={() => setBracketType(null)}
                                className="mt-4 w-full bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                )}

                {/* Render the selected bracket component */}
                {SelectedBracket && selectedEvent && (
                    <SelectedBracket eventId={selectedEvent.id} teamCount={teamCount} />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
