import { Head, Link } from '@inertiajs/react';

export default function Welcome({ events = [] }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-gray-100 py-10 px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6 text-center">Welcome to Our Event Page</h1>

                    <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
                    {events.length === 0 ? (
                        <p>No events available at the moment.</p>
                    ) : (
                        events.map(event => (
                            <Link 
                                key={event.id}
                                href={route('events.show', event.id)}
                                className="block border-b border-gray-300 py-4 hover:bg-white transition"
                            >
                                <h3 className="text-lg font-semibold text-blue-700">{event.title}</h3>
                                <p>{event.description}</p>
                                <p className="text-sm text-gray-600">
                                    By {event.coordinator_name} | {event.event_date}
                                </p>
                                {event.image_path && (
                                    <img src={`/storage/${event.image_path}`} alt={event.title} className="w-32 mt-2" />
                                )}
                                {event.is_done && <p className="text-green-600 font-bold">✓ Done</p>}
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
