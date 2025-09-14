// EventTabs.jsx
import { Link } from '@inertiajs/react';
import dayjs from 'dayjs';
import { useState } from 'react';

export default function EventTabs({ events }) {
    const today = dayjs();

    // Separate by category
    const upcomingEvents = events.filter(e => dayjs(e.event_date).isAfter(today) && !e.is_done);
    const ongoingEvents = events.filter(e => dayjs(e.event_date).isSame(today, 'day') && !e.is_done);
    const recentEvents = events.filter(e => e.is_done);

    const EventCard = ({ event }) => {
        const [index, setIndex] = useState(0);

        const nextImage = () => {
            if (!event.images) return;
            setIndex((prev) => (prev + 1) % event.images.length);
        };

        const prevImage = () => {
            if (!event.images) return;
            setIndex((prev) => (prev - 1 + event.images.length) % event.images.length);
        };

        return (
            <Link
                href={route('events.show', event.id)}
                className="block border border-slate-800 bg-slate-900/40 p-5 md:p-8 rounded-lg hover:bg-slate-800/60 transition"
            >
                <h3 className="text-2xl md:text-3xl font-bold text-blue-300 mb-3 md:mb-4">
                    {event.title}
                </h3>
                <p className="text-lg md:text-xl text-slate-200 mb-3 md:mb-5 leading-relaxed">
                    {event.description}
                </p>
                <p className="text-base md:text-lg text-slate-400 mb-5">
                    By <span className="font-semibold">{event.coordinator_name}</span> |{" "}
                    {dayjs(event.event_date).format('MMM D, YYYY')}
                </p>

                {event.images && event.images.length > 0 && (
                    <div className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] xl:h-screen overflow-hidden rounded-xl">
                        <img
                            src={`/storage/${event.images[index].image_path}`}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />

                        {/* Prev Button */}
                        <button
                            onClick={(e) => { e.preventDefault(); prevImage(); }}
                            className="absolute top-1/2 left-3 md:left-5 -translate-y-1/2 bg-black/50 text-white text-xl md:text-2xl p-3 md:p-4 rounded-full hover:bg-black/70"
                        >
                            ‹
                        </button>

                        {/* Next Button */}
                        <button
                            onClick={(e) => { e.preventDefault(); nextImage(); }}
                            className="absolute top-1/2 right-3 md:right-5 -translate-y-1/2 bg-black/50 text-white text-xl md:text-2xl p-3 md:p-4 rounded-full hover:bg-black/70"
                        >
                            ›
                        </button>
                    </div>
                )}
            </Link>
        );
    };

    const renderEvents = (list) => {
        if (list.length === 0) return <p className="text-slate-400">No events available.</p>;
        return (
            <div className="space-y-12 md:space-y-16">
                {list.map(event => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-20 md:space-y-24 w-full">
            {/* Upcoming Section */}
            <section className="w-full">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-6 md:mb-10 text-blue-300">
                    Upcoming Events
                </h2>
                <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl shadow-lg shadow-blue-950/30 p-5 md:p-10">
                    {renderEvents(upcomingEvents)}
                </div>
            </section>

            {/* Ongoing Section */}
            <section className="w-full">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-6 md:mb-10 text-green-300">
                    Ongoing Events
                </h2>
                <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl shadow-lg shadow-blue-950/30 p-5 md:p-10">
                    {renderEvents(ongoingEvents)}
                </div>
            </section>

            {/* Recent Section */}
            <section className="w-full">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-6 md:mb-10 text-cyan-300">
                    Recent Events
                </h2>
                <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl shadow-lg shadow-blue-950/30 p-5 md:p-10">
                    {renderEvents(recentEvents)}
                </div>
            </section>
        </div>
    );
}
