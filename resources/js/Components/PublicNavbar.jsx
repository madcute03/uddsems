import { Link } from '@inertiajs/react';

export default function PublicNavbar() {
    return (
        <nav className="bg-slate-900 border-b border-slate-800 shadow-md shadow-blue-950/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    
                    {/* Left - Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/">
                            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                                MyEvents
                            </span>
                        </Link>
                    </div>

                    {/* Right - Navigation links */}
                    <div className="hidden md:flex space-x-6">
                        <Link href="/" className="text-slate-300 hover:text-white">Home</Link>
                        <Link href="/events" className="text-slate-300 hover:text-white">Events</Link>
                        <Link href="/about" className="text-slate-300 hover:text-white">About</Link>
                        <Link href="/contact" className="text-slate-300 hover:text-white">Contact</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
