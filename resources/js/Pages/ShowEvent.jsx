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
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black text-slate-100">

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
                                    <p className="inline-block bg-slate-700 text-slate-200 px-6 py-2 rounded-full font-semibold text-sm sm:text-lg">
                                        Registration Closed
                                    </p>
                                ) : null}

                                {/* View Bracket Button */}
                                {(isOngoing || isDone) && (
                                    <Link
                                        href={route('bracket.show', { event: event.id })}
                                        onClick={handleViewBracket}
                                        className="flex items-center
    h-10 px-4
    rounded-lg border-0
    bg-white text-blue-600
    font-bold font-[Montserrat]
    cursor-pointer
    transition ease-in-out duration-150
    shadow-[0_0.7px_0.7px_-0.625px_#00000026,
            0_1.8px_1.8px_-1.25px_#00000025,
            0_3.6px_3.6px_-1.875px_#00000023,
            0_6.9px_6.9px_-2.5px_#00000020,
            0_13.6px_13.6px_-3.125px_#0000001b,
            0_30px_30px_-3.75px_#0000000d]
    active:scale-95
    active:bg-blue-600 active:text-white
    active:shadow-[0_0.64px_1.15px_-1.125px_rgba(0,0,0,0.26),
                  0_1.93px_3.48px_-2.25px_rgba(0,0,0,0.24),
                  0_5.1px_9.19px_-3.375px_rgba(0,0,0,0.192),
                  0_16px_28.8px_-4.5px_rgba(0,0,0,0.03)]"
                                    >
                                        View Bracket
                                    </Link>
                                )}

                                {/* View Standing Button */}
                                {(isOngoing || isDone) && (
                                    <Link
                                        href={route('standing.show', { event: event.id })}
                                        onClick={handleViewBracket}
                                        className="relative px-10 py-2.5 text-white text-lg font-medium rounded-md border-2 border-transparent cursor-pointer transition-all duration-300 [text-shadow:1px_1px_1px_#00000040] shadow-[8px_8px_20px_0px_#45090059] bg-[linear-gradient(140.14deg,#ec540e_15.05%,#d6361f_114.99%)] before:absolute before:inset-0 before:rounded-md before:p-[2px] before:bg-[linear-gradient(142.51deg,#ff9465_8.65%,#af1905_88.82%)] before:-z-10 before:content-[''] before:bg-clip-border hover:opacity-80 hover:shadow-none"
                                    >
                                        View Standing
                                    </Link>
                                )}
                            </div>

                            {/* Back Link */}
                            <Link
                                href={route('home')}
                                className="mt-4 sm:mt-6 block text-blue-300 underline font-semibold text-sm sm:text-lg hover:text-blue-200"
                            >
                                ← Back to Events
                            </Link>
                        </div>
                    </div>
                ) : (
                    // Fallback if no images
                    <div className="p-6 sm:p-12 text-center">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-300">{event.title}</span>
                        </h1>
                        <p className="text-lg sm:text-xl md:text-2xl mb-2 text-slate-200">{event.description}</p>
                        <p className="text-md sm:text-lg md:text-lg text-slate-300 mb-2">By {event.coordinator_name}</p>
                        <p className="text-lg sm:text-xl mb-4 text-slate-300">⏳ Starts On: {formatDate(event.event_date)}</p>

                        <div className="flex flex-wrap gap-3 mt-4 justify-center">
                            {isUpcoming && !isRegistrationClosed ? (
                                <Link
                                    href={route('events.register', event.id)}
                                    className="inline-block bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-2 rounded-full font-bold text-sm sm:text-lg shadow-lg hover:from-pink-500 hover:to-purple-600 transition"
                                >
                                    Register
                                </Link>
                            ) : isUpcoming && isRegistrationClosed ? (
                                <p className="inline-block bg-slate-700 text-slate-200 px-6 py-2 rounded-full font-semibold text-sm sm:text-lg">
                                    Registration Closed
                                </p>
                            ) : null}

                            {(isOngoing || isDone) && (
                                <>
                                    <Link
                                        href={route('bracket.show', { event: event.id })}
                                        onClick={handleViewBracket}
                                        className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold text-sm sm:text-lg shadow-lg transition"
                                    >
                                        View Bracket
                                    </Link>

                                    <Link
                                        href={route('standing.show', { event: event.id })}
                                        onClick={handleViewBracket}
                                        className="inline-block bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-full font-bold text-sm sm:text-lg shadow-lg transition"
                                    >
                                        View Standing
                                    </Link>
                                </>
                            )}
                        </div>

                        <Link
                            href={route('home')}
                            className="mt-4 sm:mt-6 block text-blue-300 underline font-semibold text-sm sm:text-lg hover:text-blue-200"
                        >
                            ← Back to Events
                        </Link>
                    </div>
                )}

                {/* Popup Modal kapag wala pang bracket settings */}
                {showSoonModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
                        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-lg shadow-lg w-80 text-center text-slate-100">
                            <h2 className="text-xl font-bold mb-4">Coming Soon</h2>
                            <p className="text-slate-300 mb-4">
                                The bracket for <span className="font-semibold">{event.title}</span> is not yet available.
                            </p>
                            <button
                                onClick={() => setShowSoonModal(false)}
                                className="mt-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
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
