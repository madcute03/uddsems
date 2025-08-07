<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegistrationPlayer extends Model
{
    protected $fillable = ['registration_id', 'student_id', 'name', 'image_path'];

    public function registration()
    {
        return $this->belongsTo(Registration::class);
    }
}
