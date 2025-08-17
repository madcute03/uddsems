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

                    {event.images && event.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2 mt-2">
                            {event.images.map((img) => (
                                <img
                                    key={img.id}
                                    src={`/storage/${img.image_path}`}
                                    alt={event.title}
                                    className="w-full h-32 object-cover rounded"
                                />
                            ))}
                        </div>
                    )}

                    {event.is_done && <p className="text-green-600 font-bold mt-2">✓ Done</p>}

                    {/* Register Button */}
                    <Link
                        href={route('events.register', event.id)}
                        className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Register for this Event
                    </Link>

                

                    <Link href={route('home')} className="mt-6 block text-blue-600 hover:underline">
                        ← Back to Events
                    </Link>
                </div>
            </div>
        </>
    );
}
