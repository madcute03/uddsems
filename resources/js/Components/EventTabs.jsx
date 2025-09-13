import { useState } from 'react';
import { Link } from '@inertiajs/react';
import dayjs from 'dayjs';

export default function EventTabs({ events }) {
    const [activeTab, setActiveTab] = useState('upcoming');

    const today = dayjs();

    const upcomingEvents = events.filter(e => dayjs(e.event_date).isAfter(today) && !e.is_done);
    const ongoingEvents = events.filter(e => dayjs(e.event_date).isBefore(today) && !e.is_done);
    const recentEvents = events.filter(e => e.is_done);

    const renderEvents = (list) => {
        if (list.length === 0) return <p className="text-slate-400">No events available.</p>;

        return list.map(event => (
            <Link
                key={event.id}
                href={route('events.show', event.id)}
                className="block border-b border-slate-800 py-4 px-3 rounded-lg hover:bg-slate-800/40 transition"
            >
                <h3 className="text-lg font-semibold text-blue-300">{event.title}</h3>
                <p className="text-slate-200">{event.description}</p>
                <p className="text-sm text-slate-400">
                    By {event.coordinator_name} | {event.event_date}
                </p>
                {event.images && event.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {event.images.map(img => (
                            <img
                                key={img.id}
                                src={`/storage/${img.image_path}`}
                                alt={event.title}
                                className="w-24 h-24 object-cover rounded"
                            />
                        ))}
                    </div>
                )}
            </Link>
        ));
    };

    return (
        <div>
            <div className="flex gap-4 mb-6 border-b border-slate-800">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`py-2 px-4 text-slate-300 hover:text-white transition ${activeTab === 'upcoming' ? 'border-b-2 border-blue-400 text-white font-semibold' : ''}`}
                >
                    Upcoming Events
                </button>
                <button
                    onClick={() => setActiveTab('ongoing')}
                    className={`py-2 px-4 text-slate-300 hover:text-white transition ${activeTab === 'ongoing' ? 'border-b-2 border-blue-400 text-white font-semibold' : ''}`}
                >
                    Ongoing Events
                </button>
                <button
                    onClick={() => setActiveTab('recent')}
                    className={`py-2 px-4 text-slate-300 hover:text-white transition ${activeTab === 'recent' ? 'border-b-2 border-blue-400 text-white font-semibold' : ''}`}
                >
                    Recent Events
                </button>
            </div>

            <div>
                {activeTab === 'upcoming' && renderEvents(upcomingEvents)}
                {activeTab === 'ongoing' && renderEvents(ongoingEvents)}
                {activeTab === 'recent' && renderEvents(recentEvents)}
            </div>
        </div>
    );
}
