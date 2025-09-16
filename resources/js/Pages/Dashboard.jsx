import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import React, { useState } from 'react'
import { usePage, Link } from '@inertiajs/react'

function Dashboard() {
    const { auth, events = [] } = usePage().props;
    const user = auth.user;

    const [editingEventId, setEditingEventId] = useState(null);
    const [editData, setEditData] = useState({
        title: '',
        description: '',
        coordinator_name: '',
        event_date: '',
        registration_end_date: '',
        images: [],
        existingImages: [],
        required_players: '',
    });

    // Calendar states
    const [showEventDateCalendar, setShowEventDateCalendar] = useState(false);
    const [showRegistrationDateCalendar, setShowRegistrationDateCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    // Calendar component
    const CalendarPicker = ({ isOpen, onClose, onDateSelect, selectedDate, title }) => {
        if (!isOpen) return null;

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const today = new Date();
        const selectedDateObj = selectedDate ? new Date(selectedDate) : null;

        const days = [];
        
        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="p-2"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const isToday = date.toDateString() === today.toDateString();
            const isSelected = selectedDateObj && date.toDateString() === selectedDateObj.toDateString();
            const isPast = date < today.setHours(0, 0, 0, 0);

            days.push(
                <button
                    key={day}
                    onClick={() => {
                        const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        onDateSelect(formattedDate);
                        onClose();
                    }}
                    className={`p-2 text-sm rounded-lg transition-all duration-200 hover:bg-blue-500/20 ${
                        isSelected ? 'bg-blue-500 text-white' : 
                        isToday ? 'bg-blue-500/30 text-blue-200' :
                        isPast ? 'text-gray-500 hover:bg-gray-500/10' :
                        'text-gray-300 hover:text-white'
                    }`}
                >
                    {day}
                </button>
            );
        }

        const navigateMonth = (direction) => {
            if (direction === 'prev') {
                if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(currentYear - 1);
                } else {
                    setCurrentMonth(currentMonth - 1);
                }
            } else {
                if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(currentYear + 1);
                } else {
                    setCurrentMonth(currentMonth + 1);
                }
            }
        };

        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">{title}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">
                            ×
                        </button>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                        <button 
                            onClick={() => navigateMonth('prev')}
                            className="p-2 hover:bg-slate-700 rounded-lg text-gray-300 hover:text-white transition-colors"
                        >
                            ‹
                        </button>
                        <span className="text-white font-medium">
                            {monthNames[currentMonth]} {currentYear}
                        </span>
                        <button 
                            onClick={() => navigateMonth('next')}
                            className="p-2 hover:bg-slate-700 rounded-lg text-gray-300 hover:text-white transition-colors"
                        >
                            ›
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="p-2 text-center text-sm text-gray-400 font-medium">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {days}
                    </div>
                </div>
            </div>
        );
    };

    const startEdit = (event) => {
        setEditingEventId(event.id);
        setEditData({
            title: event.title || '',
            description: event.description || '',
            coordinator_name: event.coordinator_name || '',
            event_date: event.event_date || '',
            registration_end_date: event.registration_end_date || '',
            images: [],
            existingImages: event.images_path || [],
            required_players: event.required_players || '',
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(editData).forEach(([key, val]) => {
            if (key === 'images') {
                val.forEach((img) => img && formData.append('images[]', img));
            } else if (key === 'existingImages') {
                val.forEach((imgPath) => formData.append('existing_images[]', imgPath));
            } else {
                formData.append(key, val);
            }
        });

        fetch(`/events/${editingEventId}`, {
            method: 'POST',
            headers: {
                'X-HTTP-Method-Override': 'PUT',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            },
            body: formData,
        }).then(() => {
            setEditingEventId(null);
            window.location.reload();
        });
    };

    const handleDelete = (id) => {
        if (!confirm('Delete this event?')) return;
        fetch(`/events/${id}`, {
            method: 'POST',
            headers: {
                'X-HTTP-Method-Override': 'DELETE',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            },
        }).then(() => window.location.reload());
    };

    const handleMarkDone = (id) => {
        fetch(`/events/${id}/mark-done`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            },
        }).then(() => window.location.reload());
    };

    const handleMarkUndone = (id) => {
        fetch(`/events/${id}/mark-undone`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            },
        }).then(() => window.location.reload());
    };

    return (
        <AuthenticatedLayout>
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6  text-slate-100">
                <div className="flex items-center justify-center py-10">
                    <div className="flex items-center gap-10 flex-col md:flex-row">
                        <img src="/images/sems.png" alt="Logo" className="h-40 w-40 rounded-full object-cover ring-4 ring-blue-500/60 shadow-2xl shadow-blue-900/40" />
                        <div className="text-center md:text-left">
                            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-300">Welcome!</span>
                                <span className="block md:inline md:ml-3 text-blue-300">{user.name}</span>
                            </h1>
                           
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl shadow-lg shadow-blue-950/30">
                    <h2 className="text-lg font-semibold mb-4">Events</h2>
                    {events.length === 0 && <p>No events created.</p>}

                    {events.map(event => (
                        <div key={event.id} className="border-b py-4">
                            <p className="text-sm text-gray-500">Required Players: {event.required_players}</p>

                            {editingEventId === event.id ? (
                                <form onSubmit={handleEditSubmit} encType="multipart/form-data" className="space-y-2">
                                    <div>
                                        <label className="block text-sm">Title</label>
                                        <input
                                            type="text"
                                            value={editData.title}
                                            onChange={e => setEditData({ ...editData, title: e.target.value })}
                                            className="w-full border border-slate-600 bg-slate-700 text-white px-2 py-1 rounded focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm">Description</label>
                                        <textarea
                                            value={editData.description}
                                            onChange={e => setEditData({ ...editData, description: e.target.value })}
                                            className="w-full border border-slate-600 bg-slate-700 text-white px-2 py-1 rounded focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm">Coordinator Name</label>
                                        <input
                                            type="text"
                                            value={editData.coordinator_name}
                                            onChange={e => setEditData({ ...editData, coordinator_name: e.target.value })}
                                            className="w-full border border-slate-600 bg-slate-700 text-white px-2 py-1 rounded focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm">Event Date</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={editData.event_date ? new Date(editData.event_date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long', 
                                                    day: 'numeric'
                                                }) : 'Select event date'}
                                                onClick={() => setShowEventDateCalendar(true)}
                                                readOnly
                                                className="w-full border border-slate-600 bg-slate-700 text-white px-2 py-1 rounded cursor-pointer hover:bg-slate-600 transition-colors focus:border-blue-500 focus:outline-none"
                                                placeholder="Select event date"
                                            />
                                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                                                📅
                                            </div>
                                        </div>
                                        <CalendarPicker
                                            isOpen={showEventDateCalendar}
                                            onClose={() => setShowEventDateCalendar(false)}
                                            onDateSelect={(date) => setEditData({ ...editData, event_date: date })}
                                            selectedDate={editData.event_date}
                                            title="Select Event Date"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm">Registration End Date</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={editData.registration_end_date ? new Date(editData.registration_end_date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : 'Select registration end date'}
                                                onClick={() => setShowRegistrationDateCalendar(true)}
                                                readOnly
                                                className="w-full border border-slate-600 bg-slate-700 text-white px-2 py-1 rounded cursor-pointer hover:bg-slate-600 transition-colors focus:border-blue-500 focus:outline-none"
                                                placeholder="Select registration end date"
                                            />
                                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                                                📅
                                            </div>
                                        </div>
                                        <CalendarPicker
                                            isOpen={showRegistrationDateCalendar}
                                            onClose={() => setShowRegistrationDateCalendar(false)}
                                            onDateSelect={(date) => setEditData({ ...editData, registration_end_date: date })}
                                            selectedDate={editData.registration_end_date}
                                            title="Select Registration End Date"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm">Images</label>
                                        {editData.images.map((img, idx) => (
                                            <input
                                                key={idx}
                                                type="file"
                                                className="w-full border border-slate-600 bg-slate-700 mt-1 text-white focus:border-blue-500 focus:outline-none"
                                                onChange={e => {
                                                    const newImages = [...editData.images];
                                                    newImages[idx] = e.target.files[0];
                                                    setEditData({ ...editData, images: newImages });
                                                }}
                                            />
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setEditData({ ...editData, images: [...editData.images, null] })}
                                            className="text-blue-400 underline mt-2"
                                        >
                                            + Add image
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {editData.existingImages?.map((imgPath, idx) => (
                                            <div key={idx} className="relative">
                                                <img src={`/storage/${imgPath}`} alt="Existing event" className="w-24 h-24 object-cover rounded" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newImagesPath = [...editData.existingImages];
                                                        newImagesPath.splice(idx, 1);
                                                        setEditData({ ...editData, existingImages: newImagesPath });
                                                    }}
                                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div>
                                        <label className="block text-sm">Required Players</label>
                                        <select
                                            className="w-full border text-black px-2 py-1 rounded"
                                            value={editData.required_players || ''}
                                            onChange={e => setEditData({ ...editData, required_players: e.target.value })}
                                            required
                                        >
                                            <option value="">Select number of players</option>
                                            {[...Array(20)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex gap-2 mt-2">
                                        <button type="submit" className="w-[131px] h-[40px] rounded-[15px] cursor-pointer 
                                                               transition duration-300 ease-in-out 
                                                               bg-gradient-to-br from-[#2e8eff] to-[#2e8eff]/0 
                                                               bg-[#2e8eff]/20 flex items-center justify-center 
                                                               hover:bg-[#2e8eff]/70 hover:shadow-[0_0_10px_rgba(46,142,255,0.5)] 
                                                               focus:outline-none focus:bg-[#2e8eff]/70 focus:shadow-[0_0_10px_rgba(46,142,255,0.5)]">Save</button>
                                        <button type="button" onClick={() => setEditingEventId(null)} className="w-[131px] h-[40px] rounded-[15px] cursor-pointer 
                                                               transition duration-300 ease-in-out 
                                                               bg-gradient-to-br from-[#8b0000] to-[#8b0000]/0 
                                                               bg-[#8b0000]/20 flex items-center justify-center 
                                                               hover:bg-[#8b0000]/70 hover:shadow-[0_0_10px_rgba(46,142,255,0.5)] 
                                                               focus:outline-none focus:bg-[#8b0000]/70 focus:shadow-[0_0_10px_rgba(46,142,255,0.5)]">Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex justify-between items-start gap-3 flex-col md:flex-row">
                                    <div>
                                        <h3 className="text-lg font-semibold py-2">{event.title}</h3>
                                        <p>{event.description}</p>
                                        <p className="text-sm text-gray-500 py-2">By {event.coordinator_name} | {event.event_date}</p>
                                        <p className="text-sm text-red-500 py-2">Registration Until: {event.registration_end_date}</p>
                                        {event.images_path?.map((imgPath, idx) => (
                                            <img key={idx} src={`/storage/${imgPath}`} alt="Event" className="w-32 mt-2 rounded py-2" />
                                        ))}

                                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                                            {event.is_done ? (
                                                <>
                                                    <span className="text-green-500 font-semibold">✓ Done</span>
                                                    <button
                                                        onClick={() => handleMarkUndone(event.id)}
                                                        className="bg-slate-800 text-white px-3 py-1 rounded hover:bg-slate-700 transition"
                                                    >
                                                        Mark as Undone
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleMarkDone(event.id)}
                                                    className="w-[131px] h-[45px] rounded-[15px] cursor-pointer 
                                                               transition duration-300 ease-in-out 
                                                               bg-gradient-to-br from-[#2e8eff] to-[#2e8eff]/0 
                                                               bg-[#2e8eff]/20 flex items-center justify-center 
                                                               hover:bg-[#2e8eff]/70 hover:shadow-[0_0_10px_rgba(46,142,255,0.5)] 
                                                               focus:outline-none focus:bg-[#2e8eff]/70 focus:shadow-[0_0_10px_rgba(46,142,255,0.5)]"
                                                >
                                                    Mark as Done
                                                </button>
                                            )}

                                            <Link
                                                href={route('events.registrations', event.id)}
                                                className="w-[180px] h-[45px] rounded-[15px] cursor-pointer 
                                                           transition duration-300 ease-in-out 
                                                           bg-gradient-to-br from-[#00ff00] to-[#00ff00]/0 
                                                           bg-[#00ff00]/20 flex items-center justify-center 
                                                           hover:bg-[#00ff00]/70 hover:shadow-[0_0_10px_rgba(46,142,255,0.5)] 
                                                           focus:outline-none focus:bg-[#00ff00]/70 focus:shadow-[0_0_10px_rgba(46,142,255,0.5)]"
                                            >
                                                View Registered Teams
                                            </Link>

                                             
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-3 md:mt-0">
                                        <button onClick={() => startEdit(event)} className="w-[131px] h-[45px] rounded-[15px] cursor-pointer 
                                                                                            transition duration-300 ease-in-out 
                                                                                            bg-gradient-to-br from-[#2e8eff] to-[#2e8eff]/0 
                                                                                            bg-[#2e8eff]/20 flex items-center justify-center 
                                                                                            hover:bg-[#2e8eff]/70 hover:shadow-[0_0_10px_rgba(46,142,255,0.5)] 
                                                                                            focus:outline-none focus:bg-[#2e8eff]/70 focus:shadow-[0_0_10px_rgba(46,142,255,0.5)]">Edit</button>
                                        <button onClick={() => handleDelete(event.id)} className="w-[131px] h-[45px] rounded-[15px] cursor-pointer 
                                                                                            transition duration-300 ease-in-out 
                                                                                            bg-gradient-to-br from-[#8b0000] to-[#8b0000]/0 
                                                                                            bg-[#8b0000]/20 flex items-center justify-center 
                                                                                            hover:bg-[##8b0000]/70 hover:shadow-[0_0_10px_rgba(46,142,255,0.5)] 
                                                                                            focus:outline-none focus:bg-[#8b0000]/70 focus:shadow-[0_0_10px_rgba(46,142,255,0.5)]">Delete</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    )
}

export default Dashboard;
