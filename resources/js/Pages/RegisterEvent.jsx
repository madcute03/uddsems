import { useForm, usePage, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function RegisterEvent({ event }) {
  const { flash } = usePage().props;
  const [showMessage, setShowMessage] = useState(true);

  const { data, setData, post, errors, reset } = useForm({
    players: [],
  });

  // Initialize players based on required_players
  useEffect(() => {
    const requiredPlayers = parseInt(event.required_players) || 0;
    const initialPlayers = Array.from({ length: requiredPlayers }, () => ({
      studentId: '',
      name: '',
      department: '',
      image: null,
    }));
    setData('players', initialPlayers);
  }, [event.required_players]);

  // Auto-hide flash messages after 4 seconds
  useEffect(() => {
    if (flash?.success || flash?.error) {
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  const handlePlayerChange = (idx, field, value) => {
    const updated = [...data.players];
    updated[idx][field] = value;
    setData('players', updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    data.players.forEach((player, index) => {
      formData.append(`players[${index}][studentId]`, player.studentId || '');
      formData.append(`players[${index}][name]`, player.name || '');
      formData.append(`players[${index}][department]`, player.department || '');
      if (player.image) {
        formData.append(`players[${index}][image]`, player.image);
      }
    });

    post(route('events.register', event.id), {
      data: formData,
      forceFormData: true,
      onSuccess: () => reset(),
      onError: () => setShowMessage(true),
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Register for: {event.title}</h1>

        {/* Flash Messages */}
        {showMessage && flash?.success && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded shadow transition-opacity duration-500">
            ✅ {flash.success}
          </div>
        )}
        {showMessage && flash?.error && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded shadow transition-opacity duration-500">
            ❌ {flash.error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {data.players.map((player, idx) => (
            <div key={idx} className="mb-6 border p-4 rounded bg-gray-50">
              <h2 className="font-semibold mb-2">Player {idx + 1}</h2>

              {/* Student ID */}
              <label className="block mb-1">Student ID</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded mb-2"
                value={player.studentId}
                onChange={(e) => handlePlayerChange(idx, 'studentId', e.target.value)}
              />
              {errors[`players.${idx}.studentId`] && (
                <div className="text-red-500 text-sm mb-1">{errors[`players.${idx}.studentId`]}</div>
              )}

              {/* Name */}
              <label className="block mb-1">Name</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded mb-2"
                value={player.name}
                onChange={(e) => handlePlayerChange(idx, 'name', e.target.value)}
              />
              {errors[`players.${idx}.name`] && (
                <div className="text-red-500 text-sm mb-1">{errors[`players.${idx}.name`]}</div>
              )}

              {/* Department */}
              <label className="block mb-1">Department</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded mb-2"
                value={player.department}
                onChange={(e) => handlePlayerChange(idx, 'department', e.target.value)}
              />
              {errors[`players.${idx}.department`] && (
                <div className="text-red-500 text-sm mb-1">{errors[`players.${idx}.department`]}</div>
              )}

              {/* Image Upload */}
              <label className="block mb-1">Image (optional)</label>
              <input
                type="file"
                className="mb-2"
                onChange={(e) => handlePlayerChange(idx, 'image', e.target.files[0])}
              />
              {errors[`players.${idx}.image`] && (
                <div className="text-red-500 text-sm">{errors[`players.${idx}.image`]}</div>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Submit Registration
          </button>
          
        </form>
        <Link href={route('home')} className="mt-6 block text-blue-600 hover:underline">
                        ← Back to Events
                    </Link>
        
      </div>
    </div>
  );
}
