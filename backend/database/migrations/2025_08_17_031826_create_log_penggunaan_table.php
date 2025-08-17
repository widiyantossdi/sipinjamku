<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('log_penggunaan', function (Blueprint $table) {
            $table->string('id_log')->primary();
            $table->string('id_peminjaman');
            $table->string('id_user');
            $table->enum('aksi', ['mulai', 'selesai', 'batal']);
            $table->dateTime('waktu_aksi');
            $table->text('keterangan')->nullable();
            $table->timestamps();
            
            $table->foreign('id_peminjaman')->references('id_peminjaman')->on('peminjaman')->onDelete('cascade');
            $table->foreign('id_user')->references('id_user')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('log_penggunaan');
    }
};
