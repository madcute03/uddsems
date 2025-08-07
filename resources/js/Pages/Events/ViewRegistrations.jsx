import { useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function RegisterEvent({ event }) {
  const { data, setData, post, errors, reset } = useForm({
    department: '',
    players: [{ studentId: '', name: '', image: null }],
  });

  const handlePlayerChange = (index, field, value) => {
    const updatedPlayers = [...data.players];
    updatedPlayers[index][field] = value;
    setData('players', updatedPlayers);
  };

  const addPlayer = () => {
    setData('players', [...data.players, { studentId: '', name: '', image: null }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('department', data.department);

    data.players.forEach((player, index) => {
      formData.append(`players[${index}][studentId]`, player.studentId);
      formData.append(`players[${index}][name]`, player.name);
      if (player.image) {
        formData.append(`players[${index}][image]`, player.image);
      }
    });

    post(route('events.register', event.id), {
      data: formData,
      forceFormData: true,
      onSuccess: () => reset(),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Department</label>
        <input
          type="text"
          value={data.department}
          onChange={(e) => setData('department', e.target.value)}
        />
        {errors.department && <div>{errors.department}</div>}
      </div>

      {data.players.map((player, index) => (
        <div key={index}>
          <label>Student ID</label>
          <input
            type="text"
            value={player.studentId}
            onChange={(e) => handlePlayerChange(index, 'studentId', e.target.value)}
          />
          {errors[`players.${index}.studentId`] && (
            <div>{errors[`players.${index}.studentId`]}</div>
          )}

          <label>Name</label>
          <input
            type="text"
            value={player.name}
            onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
          />
          {errors[`players.${index}.name`] && (
            <div>{errors[`players.${index}.name`]}</div>
          )}

          <label>Image (optional)</label>
          <input
            type="file"
            onChange={(e) => handlePlayerChange(index, 'image', e.target.files[0])}
          />
          {errors[`players.${index}.image`] && (
            <div>{errors[`players.${index}.image`]}</div>
          )}
        </div>
      ))}

      <button type="button" onClick={addPlayer}>Add Player</button>
      <button type="submit">Register</button>

      {errors.players && <div>{errors.players}</div>}
    </form>
  );
}
