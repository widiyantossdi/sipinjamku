<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kendaraan extends Model
{
    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id_kendaraan';

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
        'id_kendaraan',
        'nama_kendaraan',
        'jenis',
        'plat_nomor',
        'deskripsi',
        'status',
    ];

    /**
     * Get the peminjaman for the kendaraan.
     */
    public function peminjaman()
    {
        return $this->hasMany(Peminjaman::class, 'id_kendaraan', 'id_kendaraan');
    }
}
