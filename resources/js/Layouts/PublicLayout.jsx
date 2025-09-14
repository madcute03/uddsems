import PublicNavbar from '@/Components/PublicNavbar';

export default function PublicLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black text-slate-100">
            <PublicNavbar />
            <main className="p-6">{children}</main>
        </div>
    );
}
