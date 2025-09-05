import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function ShowEvent({ event }) {
    const today = new Date().toISOString().split("T")[0];

    const isOngoing = event.event_date && today >= event.event_date;
    const isUpcoming = !isOngoing;

    const isRegistrationClosed =
        event.registration_end_date && today > event.registration_end_date;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Carousel state
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const totalImages = event.images ? event.images.length : 0;

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % totalImages);
    };

    return (
        <>
            <Head title={event.title} />
            <div className="min-h-screen bg-gray-100">

                {/* Image Carousel */}
                {totalImages > 0 ? (
                    <div
                        className="relative w-full h-screen overflow-hidden cursor-pointer"
                        onClick={nextImage}
                    >
                        <img
                            src={`/storage/${event.images[currentImageIndex].image_path}`}
                            alt={event.title}
                            className="w-full h-full object-cover transition-transform duration-500"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-center px-4 sm:px-6 md:px-12">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-lg">{event.title}</h1>
                            <p className="text-lg sm:text-xl md:text-2xl text-white mb-2 drop-shadow">{event.description}</p>
                            <p className="text-md sm:text-lg md:text-lg text-white opacity-90 mb-2 drop-shadow">By {event.coordinator_name}</p>

                            {isOngoing && (
                                <p className="px-3 sm:px-4 py-1 sm:py-2 bg-yellow-400 text-yellow-900 font-bold rounded-full mb-2 text-sm sm:text-lg">
                                    ⚡ Ongoing
                                </p>
                            )}
                            {isUpcoming && (
                                <p className="px-3 sm:px-4 py-1 sm:py-2 bg-blue-400 text-blue-900 font-bold rounded-full mb-2 text-sm sm:text-lg">
                                    ⏳ Starts On: {formatDate(event.event_date)}
                                </p>
                            )}
                            {event.registration_end_date && (
                                <p className="text-sm sm:text-md text-white font-semibold mb-4 drop-shadow">
                                    Registration Until: {formatDate(event.registration_end_date)}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-3 mt-4 justify-center">
                                {/* Register Button */}
                                {isRegistrationClosed ? (
                                    <p className="inline-block bg-gray-400 text-white px-6 py-2 rounded-full font-semibold text-sm sm:text-lg">
                                        Registration Closed
                                    </p>
                                ) : (
                                    <Link
                                        href={route('events.register', event.id)}
                                        className="inline-block bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-2 rounded-full font-bold text-sm sm:text-lg shadow-lg hover:from-pink-500 hover:to-purple-600 transition"
                                    >
                                        Register
                                    </Link>
                                )}

                                {/* View Bracket Button */}
                                <Link
                                    href={route('bracket.show', { event: event.id })}
                                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm sm:text-lg shadow-lg hover:bg-blue-700 transition"
                                >
                                    View Bracket
                                </Link>
                            </div>

                            <Link
                                href={route('home')}
                                className="mt-4 sm:mt-6 block text-white underline font-semibold text-sm sm:text-lg"
                            >
                                ← Back to Events
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 sm:p-12 text-center">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">{event.title}</h1>
                        <p className="text-lg sm:text-xl md:text-2xl mb-2">{event.description}</p>
                        <p className="text-md sm:text-lg md:text-lg opacity-90 mb-2">By {event.coordinator_name}</p>
                        <p className="text-lg sm:text-xl mb-4">⏳ Starts On: {formatDate(event.event_date)}</p>

                        <div className="flex flex-wrap gap-3 mt-4 justify-center">
                            {isRegistrationClosed ? (
                                <p className="inline-block bg-gray-400 text-white px-6 py-2 rounded-full font-semibold text-sm sm:text-lg">
                                    Registration Closed
                                </p>
                            ) : (
                                <Link
                                    href={route('events.register', event.id)}
                                    className="inline-block bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-2 rounded-full font-bold text-sm sm:text-lg shadow-lg hover:from-pink-500 hover:to-purple-600 transition"
                                >
                                    Register
                                </Link>
                            )}

                            {/* View Bracket Button */}
                            <Link
                                href={route('bracket.show', { event: event.id })}
                                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm sm:text-lg shadow-lg hover:bg-blue-700 transition"
                            >
                                View Bracket
                            </Link>
                        </div>

                        <Link
                            href={route('home')}
                            className="mt-4 sm:mt-6 block text-purple-700 underline font-semibold text-sm sm:text-lg"
                        >
                            ← Back to Events
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
