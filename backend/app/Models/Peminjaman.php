<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Peminjaman extends Model
{
    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id_peminjaman';

    /**
     * Indicates if the model's ID is auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The data type of the auto-incrementing ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'id_peminjaman',
        'id_user',
        'id_ruangan',
        'id_kendaraan',
        'jenis_peminjaman',
        'tanggal_mulai',
        'tanggal_selesai',
        'keperluan',
        'status',
        'catatan',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'tanggal_mulai' => 'datetime',
        'tanggal_selesai' => 'datetime',
    ];

    /**
     * Get the user that owns the peminjaman.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    /**
     * Get the ruangan that belongs to the peminjaman.
     */
    public function ruangan()
    {
        return $this->belongsTo(Ruangan::class, 'id_ruangan', 'id_ruangan');
    }

    /**
     * Get the kendaraan that belongs to the peminjaman.
     */
    public function kendaraan()
    {
        return $this->belongsTo(Kendaraan::class, 'id_kendaraan', 'id_kendaraan');
    }

    /**
     * Get the log penggunaan for the peminjaman.
     */
    public function logPenggunaan()
    {
        return $this->hasMany(LogPenggunaan::class, 'id_peminjaman', 'id_peminjaman');
    }
}
