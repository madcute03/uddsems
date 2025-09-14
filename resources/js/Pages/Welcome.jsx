import { Head } from '@inertiajs/react';
import EventTabs from '@/Components/EventTabs';
import PublicLayout from '@/Layouts/PublicLayout';

export default function Welcome({ events = [] }) {
    return (
        <PublicLayout>
            <Head title="Welcome" />

            <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-extrabold text-center py-8">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-300">
                        Featured Programs and Events
                    </span>
                </h1>

                {/* Full wide container */}
                <div className="w-full bg-slate-900/60 border border-slate-800 rounded-none shadow-lg shadow-blue-950/30 p-4 md:p-6">
                    <EventTabs events={events} />
                </div>
            </div>
        </PublicLayout>
    );
}
