<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    /**
     * Get the event that owns this registration.
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get the players for this registration.
     */
    public function players(): HasMany
    {
    return $this->hasMany(Player::class, 'event_registration_id');
    }
}
