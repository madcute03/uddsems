<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_registration_id') // ✅ Fixed column name
                  ->constrained()
                  ->onDelete('cascade');
            $table->string('student_id');
            $table->string('name');
            $table->string('department');
            $table->string('image_path')->nullable(); // Optional image upload
            $table->longBlob('pdf_file')->nullable(); // PDF stored as binary

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('players');
    }
};
