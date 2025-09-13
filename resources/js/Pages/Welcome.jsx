import { Head } from '@inertiajs/react';
import EventTabs from '@/Components/EventTabs';

export default function Welcome({ events = [] }) {
    return (
        <>
            <Head title="Welcome" />

            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black text-slate-100 py-12 px-4">
                <div className="max-w-5xl mx-auto space-y-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-center">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-300">Featured Programs and Events</span>
                    </h1>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl shadow-lg shadow-blue-950/30 p-4 md:p-6">
                        <EventTabs events={events} />
                    </div>
                </div>
            </div>
        </>
    );
}