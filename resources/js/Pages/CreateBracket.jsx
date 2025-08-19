import React from "react";
import { Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function CreateBracket({ events = [] }) {
    return (
        <AuthenticatedLayout>
            <div className="p-6">
                <Head title="Create Bracket" />

                <h1 className="text-2xl font-bold mb-4">Select Event for Bracket</h1>

                {/* Check kung may events */}
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
                                <p className="text-sm text-gray-500">
                                    Date: {event.event_date}
                                </p>

                                {/* Example button/link para gumawa ng bracket */}
                                <Link
                                    href={route("bracket")} // route name mo sa web.php
                                    className="mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Create Bracket
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>

    );
}
