import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import React from 'react'

function Dashboard() {
    return (
        <AuthenticatedLayout>
            Welcome!
        </AuthenticatedLayout>
    )
}

export default Dashboard