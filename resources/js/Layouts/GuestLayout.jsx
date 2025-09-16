import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-slate-950 via-blue-950 to-black text-slate-100 pt-6 sm:justify-center sm:pt-0">
            <div className="mb-4">
                <Link href="/">
                </Link>
            </div>

            {/* Let pages render their own card/layout */}
            <div className="w-full px-4 sm:px-0 flex justify-center">
                {children}
            </div>
        </div>
    );
}
