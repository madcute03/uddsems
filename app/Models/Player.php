<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Player extends Model
{
    //
    public function registration()
{
    return $this->belongsTo(Registration::class);
}

}
