<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    // ✅ Allow mass assignment
    protected $fillable = [
        'title',
        'description',
        'coordinator_name',
        'event_date',
        'is_done',
        'required_players',
    ];

    // ✅ Relationship: Event has many registrations
    public function registrations()
    {
        return $this->hasMany(Registration::class);
    }

    // ✅ Relationship: Event has many attendees (many-to-many with users)
    public function attendees()
    {
        return $this->belongsToMany(User::class, 'event_user'); // adjust pivot table if needed
    }

    // ✅ Relationship: Event has many images
  public function images()
{
    return $this->hasMany(EventImage::class);
}


}
