import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function ShowEvent({ event }) {
    const [showSuccess, setShowSuccess] = useState(false);
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash.success) {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [flash]);
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
            {showSuccess && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300">
                        {flash.success}
                    </div>
                </div>
            )}
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
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-center px-4 sm:px-6 md:px-12">
                            <div className="max-w-4xl mx-auto space-y-4">
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl leading-tight">
                                    {event.title}
                                </h1>
                                <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 mb-6">
                                    <p className="text-xl sm:text-2xl md:text-3xl text-white mb-4 drop-shadow-lg leading-relaxed font-light">
                                        {event.description}
                                    </p>
                                    <p className="text-lg sm:text-xl md:text-2xl text-slate-200 mb-4 drop-shadow font-medium">
                                        Organized by <span className="text-blue-300 font-semibold">{event.coordinator_name}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Status Labels */}
                            <div className="flex flex-wrap justify-center gap-3 mb-6">
                                {isOngoing && !isDone && (
                                    <div className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 font-bold rounded-full text-lg shadow-lg">
                                        <span className="text-xl">⚡</span> Event Ongoing
                                    </div>
                                )}
                                {isUpcoming && (
                                    <div className="px-6 py-3 bg-gradient-to-r from-blue-400 to-cyan-400 text-blue-900 font-bold rounded-full text-lg shadow-lg">
                                        <span className="text-xl">📅</span> Starts: {formatDate(event.event_date)}
                                    </div>
                                )}
                                {isDone && (
                                    <div className="px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-400 text-green-900 font-bold rounded-full text-lg shadow-lg">
                                        <span className="text-xl">✅</span> Event Completed
                                    </div>
                                )}
                            </div>
                            {event.registration_end_date && !isDone && !isOngoing && (
                                <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg px-6 py-3 mb-6">
                                    <p className="text-lg text-slate-200 font-medium">
                                        <span className="text-red-300 font-semibold">⏰ Registration Deadline:</span>
                                        <br />
                                        <span className="text-xl text-white">{formatDate(event.registration_end_date)}</span>
                                    </p>
                                </div>
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
                    <div className="p-8 sm:p-16 text-center min-h-screen flex flex-col justify-center">
                        <div className="max-w-4xl mx-auto space-y-8">
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-8 leading-tight">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-300">
                                    {event.title}
                                </span>
                            </h1>
                            
                            <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-slate-700">
                                <p className="text-2xl sm:text-3xl md:text-4xl mb-6 text-slate-100 leading-relaxed font-light">
                                    {event.description}
                                </p>
                                <p className="text-xl sm:text-2xl text-slate-300 mb-6">
                                    Organized by <span className="text-blue-300 font-semibold text-2xl">{event.coordinator_name}</span>
                                </p>
                                
                                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-400/30">
                                    <p className="text-2xl sm:text-3xl text-blue-200 font-medium">
                                        <span className="text-3xl">📅</span> Event Date
                                    </p>
                                    <p className="text-xl sm:text-2xl text-white font-bold mt-2">
                                        {formatDate(event.event_date)}
                                    </p>
                                </div>
                            </div>
                        </div>

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

                        <div className="mt-12">
                            <Link
                                href={route("home")}
                                className="inline-flex items-center gap-2 text-xl font-semibold text-blue-300 hover:text-blue-200 transition-colors duration-300 group"
                            >
                                <span className="text-2xl group-hover:-translate-x-1 transition-transform duration-300">←</span>
                                Back to Events
                            </Link>
                        </div>
                    </div>
                )}

                {/* Popup Modal kapag wala pang bracket settings */}
                {showSoonModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
                        <div className="bg-slate-900/95 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md mx-4 text-center text-slate-100">
                            <div className="text-6xl mb-4">⏳</div>
                            <h2 className="text-2xl font-bold mb-6 text-blue-300">
                                Coming Soon
                            </h2>
                            <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                                The bracket for{" "}
                                <span className="font-semibold text-white text-xl">
                                    {event.title}
                                </span>{" "}
                                is not yet available. Please check back later!
                            </p>
                            <button
                                onClick={() => setShowSoonModal(false)}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-300 text-lg"
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
