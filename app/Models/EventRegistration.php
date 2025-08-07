<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventRegistration extends Model
{
    protected $fillable = [
    'event_id',
    'department',
    'student_id',
    'name',
    'image_path',
    'is_leader',
];

    public function players()
    {
        return $this->hasMany(Player::class);
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
