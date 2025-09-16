import { Head, Link } from "@inertiajs/react";
import { useState } from "react";

export default function ShowEvent({ event }) {
    const today = new Date().toISOString().split("T")[0];

    // States ng event
    const isUpcoming = today < event.event_date && !event.is_done;
    const isOngoing = today >= event.event_date && !event.is_done;
    const isDone = event.is_done === 1 || today > event.event_date;

    const isRegistrationClosed =
        event.registration_end_date && today > event.registration_end_date;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
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
                        className="relative w-full h-screen overflow-hidden"

                    >
                        <img
                            src={`/storage/${event.images[currentImageIndex].image_path}`}
                            alt={event.title}
                            className="w-full h-full object-cover transition-transform duration-500"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-center px-4 sm:px-6 md:px-12">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-lg">
                                {event.title}
                            </h1>
                            <p className="text-lg sm:text-xl md:text-2xl text-white mb-2 drop-shadow">
                                {event.description}
                            </p>
                            <p className="text-md sm:text-lg md:text-lg text-white opacity-90 mb-2 drop-shadow">
                                By {event.coordinator_name}
                            </p>

                            {/* Status Labels */}
                            {isOngoing && !isDone && (
                                <p className="px-3 sm:px-4 py-1 bg-yellow-400 text-yellow-900 font-bold rounded-full mb-2 text-sm sm:text-lg">
                                    ⚡ Ongoing
                                </p>
                            )}
                            {isUpcoming && (
                                <p className="px-3 sm:px-4 py-1 bg-blue-400 text-blue-900 font-bold rounded-full mb-2 text-sm sm:text-lg">
                                    Starts On: {formatDate(event.event_date)}
                                </p>
                            )}
                            {isDone && (
                                <p className="px-3 sm:px-4 py-1 bg-red-500 text-white font-bold rounded-full mb-2 text-sm sm:text-lg">
                                    ✅ Finished
                                </p>
                            )}
                            {event.registration_end_date && !isDone && (
                                <p className="text-sm sm:text-md text-white font-semibold mb-4 drop-shadow">
                                    Registration Until:{" "}
                                    {formatDate(event.registration_end_date)}
                                </p>
                            )}

                            {/* Buttons */}
                            <div className="flex flex-wrap gap-3 mt-4 justify-center">
                                {/* Register Button */}
                                {isUpcoming && !isRegistrationClosed ? (
                                    <Link
                                        href={route(
                                            "events.register",
                                            event.id
                                        )}
                                        className="w-[140px] h-[48px] rounded-[15px] cursor-pointer 
                                                   transition duration-300 ease-in-out 
                                                   bg-gradient-to-br from-[#2e8eff] to-[#2e8eff]/0 
                                                   bg-[#2e8eff]/20 flex items-center justify-center 
                                                   hover:bg-[#2e8eff]/70 hover:shadow-[0_0_10px_rgba(46,142,255,0.5)] 
                                                   focus:outline-none focus:bg-[#2e8eff]/70 focus:shadow-[0_0_10px_rgba(46,142,255,0.5)]"
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
                                        href={route("bracket.show", {
                                            event: event.id,
                                        })}
                                        onClick={handleViewBracket}
                                        className="btn-blue-glow"
                                    >
                                        View Bracket
                                    </Link>
                                )}

                                {/* View Standing Button */}
                                {(isOngoing || isDone) && (
                                    <Link
                                        href={route("standing.show", {
                                            event: event.id,
                                        })}
                                        onClick={handleViewBracket}
                                        className="btn-blue-glow"
                                    >
                                        View Standing
                                    </Link>
                                )}
                            </div>

                            {/* Back Link */}
                            <Link
                                href={route("home")}
                                className="relative
                                            text-[18px] font-extrabold font-inherit uppercase
                                            text-[#e1e1e1]
                                            cursor-pointer bg-none border-0
                                            transition-colors duration-400 [transition-timing-function:cubic-bezier(0.25,0.8,0.25,1)]
                                            hover:text-white focus:text-white
                                            after:content-[''] after:absolute after:bottom-[-2px] after:left-1/2
                                            after:w-0 after:h-[2px] after:bg-white
                                            after:transition-[width,left] after:duration-400 [after:transition-timing-function:cubic-bezier(0.25,0.8,0.25,1)]
                                            hover:after:w-full hover:after:left-0
                                            focus:after:w-full focus:after:left-0
                                            h-10 px-4 mt-10"
                            >
                                ← Back to Events
                            </Link>
                        </div>
                    </div>
                ) : (
                    // Fallback if no images
                    <div className="p-6 sm:p-12 text-center">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-300">
                                {event.title}
                            </span>
                        </h1>
                        <p className="text-lg sm:text-xl md:text-2xl mb-2 text-slate-200">
                            {event.description}
                        </p>
                        <p className="text-md sm:text-lg md:text-lg text-slate-300 mb-2">
                            By {event.coordinator_name}
                        </p>
                        <p className="text-lg sm:text-xl mb-4 text-slate-300">
                            ⏳ Starts On: {formatDate(event.event_date)}
                        </p>

                        <div className="flex flex-wrap gap-3 mt-4 justify-center">
                            {isUpcoming && !isRegistrationClosed ? (
                                <Link
                                    href={route("events.register", event.id)}
                                    className="inline-block btn-blue-glow"
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
                                        href={route("bracket.show", {
                                            event: event.id,
                                        })}
                                        onClick={handleViewBracket}
                                        className="inline-block btn-blue-glow"
                                    >
                                        View Bracket
                                    </Link>

                                    <Link
                                        href={route("standing.show", {
                                            event: event.id,
                                        })}
                                        onClick={handleViewBracket}
                                        className="inline-block btn-blue-glow"
                                    >
                                        View Standing
                                    </Link>
                                </>
                            )}
                        </div>

                        <Link
                            href={route("home")}
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
                            <h2 className="text-xl font-bold mb-4">
                                Coming Soon
                            </h2>
                            <p className="text-slate-300 mb-4">
                                The bracket for{" "}
                                <span className="font-semibold">
                                    {event.title}
                                </span>{" "}
                                is not yet available.
                            </p>
                            <button
                                onClick={() => setShowSoonModal(false)}
                                className="mt-2 btn-blue-glow"
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
