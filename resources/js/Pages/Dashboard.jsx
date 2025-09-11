import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import React from 'react'
import {usePage} from '@inertiajs/react'
function Dashboard() {
    const user = usePage().props.auth.user;

    return (
        <AuthenticatedLayout>
            Welcome! {user.name}
        </AuthenticatedLayout>
    )
}

export default Dashboard