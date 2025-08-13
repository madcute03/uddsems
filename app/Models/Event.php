<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'coordinator_name',
        'event_date',
        'required_players',
    ];

    // Event images
    public function images()
    {
        return $this->hasMany(EventImage::class);
    }

    // Event registrations
    public function registrations()
    {
        return $this->hasMany(EventRegistration::class);
    }
}
