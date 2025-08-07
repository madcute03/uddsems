<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Registration extends Model
{
    protected $fillable = ['event_id', 'department'];

    public function players()
    {
            return $this->hasMany(Player::class);

        return $this->hasMany(RegistrationPlayer::class);
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
    
}
