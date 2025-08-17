<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RuanganController;
use App\Http\Controllers\Api\KendaraanController;
use App\Http\Controllers\Api\PeminjamanController;
use App\Http\Controllers\Api\LogPenggunaanController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Health check route (public)
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Backend API is running',
        'timestamp' => now()->toISOString(),
        'version' => '1.0.0'
    ]);
});

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    
    // User routes
    Route::apiResource('users', UserController::class);
    
    // Ruangan routes
    Route::apiResource('ruangan', RuanganController::class);
    
    // Kendaraan routes
    Route::apiResource('kendaraan', KendaraanController::class);
    
    // Peminjaman routes
    Route::apiResource('peminjaman', PeminjamanController::class);
    
    // Log Penggunaan routes
    Route::apiResource('log-penggunaan', LogPenggunaanController::class);
});