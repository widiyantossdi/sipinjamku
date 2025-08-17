<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'id_user' => Str::uuid(),
            'nama' => 'Administrator',
            'email' => 'admin@sipinjamku.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'no_telepon' => '081234567890',
            'divisi' => 'IT',
        ]);

        // Create regular user
        User::create([
            'id_user' => Str::uuid(),
            'nama' => 'User Demo',
            'email' => 'user@sipinjamku.com',
            'password' => Hash::make('user123'),
            'role' => 'user',
            'no_telepon' => '081234567891',
            'divisi' => 'Umum',
        ]);
    }
}
