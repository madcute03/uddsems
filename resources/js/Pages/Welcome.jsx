import { Head } from '@inertiajs/react';
import EventTabs from '@/Components/EventTabs';

export default function Welcome({ events = [] }) {
    return (
        <>
            <Head title="Welcome" />

            <div className="min-h-screen bg-gray-100 py-10 px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6 text-center">Welcome to Our Event Page</h1>
                    <EventTabs events={events} />
                </div>
            </div>
        </>
    );
}
