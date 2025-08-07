<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    // ✅ Add this to allow mass assignment
    protected $fillable = [
        'title',
        'description',
        'coordinator_name',
        'event_date',
        'image_path', // only if you're saving image path!
        'is_done',
        'required_players',     // only if you're updating this
    ];
    public function registrations()
{
    return $this->hasMany(Registration::class);
}
// In App\Models\Event.php
// In App\Models\Event.php
public function attendees()
{
    return $this->belongsToMany(User::class, 'event_user'); // adjust table name if different
}


}
