import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function ShowEvent({ event }) {
    const today = new Date().toISOString().split("T")[0];

    // States ng event
    const isUpcoming = today < event.event_date && !event.is_done;
    const isOngoing = today >= event.event_date && !event.is_done;
    const isDone = event.is_done === 1 || today > event.event_date;

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

    // Bracket Modal state
    const [showSoonModal, setShowSoonModal] = useState(false);

    const handleViewBracket = (e) => {
        if (!event.bracket_type || !event.teams) {
            e.preventDefault(); // stop redirect
            setShowSoonModal(true); // show modal
        }
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

                            {/* Status Labels */}
                            {isOngoing && !isDone && (
                                <p className="px-3 sm:px-4 py-1 bg-yellow-400 text-yellow-900 font-bold rounded-full mb-2 text-sm sm:text-lg">
                                    ⚡ Ongoing
                                </p>
                            )}
                            {isUpcoming && (
                                <p className="px-3 sm:px-4 py-1 bg-blue-400 text-blue-900 font-bold rounded-full mb-2 text-sm sm:text-lg">
                                    ⏳ Starts On: {formatDate(event.event_date)}
                                </p>
                            )}
                            {isDone && (
                                <p className="px-3 sm:px-4 py-1 bg-red-500 text-white font-bold rounded-full mb-2 text-sm sm:text-lg">
                                    ✅ Finished
                                </p>
                            )}
                            {event.registration_end_date && !isDone && (
                                <p className="text-sm sm:text-md text-white font-semibold mb-4 drop-shadow">
                                    Registration Until: {formatDate(event.registration_end_date)}
                                </p>
                            )}

                            {/* Buttons */}
                            <div className="flex flex-wrap gap-3 mt-4 justify-center">
                                {/* Register Button */}
                                {isUpcoming && !isRegistrationClosed ? (
                                    <Link
                                        href={route('events.register', event.id)}
                                        className="inline-block bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-2 rounded-full font-bold text-sm sm:text-lg shadow-lg hover:from-pink-500 hover:to-purple-600 transition"
                                    >
                                        Register
                                    </Link>
                                ) : isUpcoming && isRegistrationClosed ? (
                                    <p className="inline-block bg-gray-400 text-white px-6 py-2 rounded-full font-semibold text-sm sm:text-lg">
                                        Registration Closed
                                    </p>
                                ) : null}

                                {/* View Bracket Button */}
                                {(isOngoing || isDone) && (
                                    <Link
                                        href={route('bracket.show', { event: event.id })}
                                        onClick={handleViewBracket}
                                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm sm:text-lg shadow-lg hover:bg-blue-700 transition"
                                    >
                                        View Bracket
                                    </Link>
                                )}

                                {/* View Standing Button */}
                                {(isOngoing || isDone) && (
                                    <Link
                                        href={route('standing.show', { event: event.id })}
                                        onClick={handleViewBracket}
                                        className="inline-block bg-green-600 text-white px-6 py-2 rounded-full font-bold text-sm sm:text-lg shadow-lg hover:bg-green-700 transition"
                                    >
                                        View Standing
                                    </Link>
                                )}
                            </div>

                            {/* Back Link */}
                            <Link
                                href={route('home')}
                                className="mt-4 sm:mt-6 block text-white underline font-semibold text-sm sm:text-lg"
                            >
                                ← Back to Events
                            </Link>
                        </div>
                    </div>
                ) : (
                    // Fallback if no images
                    <div className="p-6 sm:p-12 text-center">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">{event.title}</h1>
                        <p className="text-lg sm:text-xl md:text-2xl mb-2">{event.description}</p>
                        <p className="text-md sm:text-lg md:text-lg opacity-90 mb-2">By {event.coordinator_name}</p>
                        <p className="text-lg sm:text-xl mb-4">⏳ Starts On: {formatDate(event.event_date)}</p>

                        <div className="flex flex-wrap gap-3 mt-4 justify-center">
                            {isUpcoming && !isRegistrationClosed ? (
                                <Link
                                    href={route('events.register', event.id)}
                                    className="inline-block bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-2 rounded-full font-bold text-sm sm:text-lg shadow-lg hover:from-pink-500 hover:to-purple-600 transition"
                                >
                                    Register
                                </Link>
                            ) : isUpcoming && isRegistrationClosed ? (
                                <p className="inline-block bg-gray-400 text-white px-6 py-2 rounded-full font-semibold text-sm sm:text-lg">
                                    Registration Closed
                                </p>
                            ) : null}

                            {(isOngoing || isDone) && (
                                <>
                                    <Link
                                        href={route('bracket.show', { event: event.id })}
                                        onClick={handleViewBracket}
                                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm sm:text-lg shadow-lg hover:bg-blue-700 transition"
                                    >
                                        View Bracket
                                    </Link>

                                    <Link
                                        href={route('standing.show', { event: event.id })}
                                        onClick={handleViewBracket}
                                        className="inline-block bg-green-600 text-white px-6 py-2 rounded-full font-bold text-sm sm:text-lg shadow-lg hover:bg-green-700 transition"
                                    >
                                        View Standing
                                    </Link>
                                </>
                            )}
                        </div>

                        <Link
                            href={route('home')}
                            className="mt-4 sm:mt-6 block text-purple-700 underline font-semibold text-sm sm:text-lg"
                        >
                            ← Back to Events
                        </Link>
                    </div>
                )}

                {/* Popup Modal kapag wala pang bracket settings */}
                {showSoonModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
                            <h2 className="text-xl font-bold mb-4">Coming Soon</h2>
                            <p className="text-gray-700 mb-4">
                                The bracket for <span className="font-semibold">{event.title}</span> is not yet available.
                            </p>
                            <button
                                onClick={() => setShowSoonModal(false)}
                                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
