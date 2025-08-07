<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Player extends Model
{
    protected $fillable = [
    'event_registration_id',
    'student_id',
    'name',
    'image_path',
];

    public function registration()
    {
        return $this->belongsTo(EventRegistration::class);
    }
}
