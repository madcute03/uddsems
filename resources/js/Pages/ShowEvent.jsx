import { Head, Link } from '@inertiajs/react';

export default function ShowEvent({ event }) {
    return (
        <>
            <Head title={event.title} />
            <div className="min-h-screen bg-gray-100 py-10 px-4">
                <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
                    <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
                    <p className="mb-2 text-gray-700">{event.description}</p>
                    <p className="text-sm text-gray-500 mb-2">
                        By {event.coordinator_name} | {event.event_date}
                    </p>

                    {event.image_path && (
                        <img src={`/storage/${event.image_path}`} alt={event.title} className="w-full mt-2 rounded" />
                    )}

                    <p className="text-sm text-gray-500">Required Players: {event.required_players}</p>

                    {event.is_done && <p className="text-green-600 font-bold mt-2">✓ Done</p>}

                    {!event.is_done && route().has('events.register.form') && (
                        <Link
                            href={route('events.register.form', event.id)}
                            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            Register for this Event
                        </Link>
                    )}

                   <Link href={route('home')} className="mt-6 block text-blue-600 hover:underline">
    ← Back to Events
</Link>

                </div>
            </div>
        </>
    );
}
