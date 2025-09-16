<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'category',
        'tags',
        'published_at',
        'location',
        'author',
        'cover_image',
    ];

    protected $casts = [
        'tags' => 'array',
        'published_at' => 'datetime',
    ];
}
