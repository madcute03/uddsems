import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import React from 'react'
import { usePage } from '@inertiajs/react'
import ApplicationLogo from '@/Components/ApplicationLogo';

function Dashboard() {
    const user = usePage().props.auth.user;

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex items-center space-x-10">
                    {/* Super Large Logo */}
                    <ApplicationLogo className="w-150 h-150" />

                    {/* Big Text */}
                    <h1 className="text-7xl font-extrabold text-gray-800">
                        Welcome! <span className="text-blue-600">{user.name}</span>
                    </h1>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}

export default Dashboard
