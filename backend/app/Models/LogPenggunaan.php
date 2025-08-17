<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogPenggunaan extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'log_penggunaan';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id_log';

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
        'id_log',
        'id_peminjaman',
        'id_user',
        'aksi',
        'waktu_aksi',
        'keterangan',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'waktu_aksi' => 'datetime',
    ];

    /**
     * Get the peminjaman that owns the log penggunaan.
     */
    public function peminjaman()
    {
        return $this->belongsTo(Peminjaman::class, 'id_peminjaman', 'id_peminjaman');
    }

    /**
     * Get the user that owns the log penggunaan.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }
}
