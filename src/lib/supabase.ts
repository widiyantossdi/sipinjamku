import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id_user: string
          nama: string
          email: string
          role: 'mahasiswa' | 'dosen' | 'admin' | 'petugas'
          no_hp: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id_user?: string
          nama: string
          email: string
          role: 'mahasiswa' | 'dosen' | 'admin' | 'petugas'
          no_hp: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id_user?: string
          nama?: string
          email?: string
          role?: 'mahasiswa' | 'dosen' | 'admin' | 'petugas'
          no_hp?: string
          created_at?: string
          updated_at?: string
        }
      }
      ruangan: {
        Row: {
          id_ruangan: string
          nama_ruangan: string
          lokasi: string
          kapasitas: number
          fasilitas: string
          status: 'tersedia' | 'tidak_tersedia' | 'maintenance'
          created_at: string
          updated_at: string
        }
        Insert: {
          id_ruangan?: string
          nama_ruangan: string
          lokasi: string
          kapasitas: number
          fasilitas: string
          status?: 'tersedia' | 'tidak_tersedia' | 'maintenance'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id_ruangan?: string
          nama_ruangan?: string
          lokasi?: string
          kapasitas?: number
          fasilitas?: string
          status?: 'tersedia' | 'tidak_tersedia' | 'maintenance'
          created_at?: string
          updated_at?: string
        }
      }
      kendaraan: {
        Row: {
          id_kendaraan: string
          jenis: string
          merk: string
          plat_nomor: string
          kapasitas_penumpang: number
          status: 'tersedia' | 'tidak_tersedia' | 'maintenance'
          created_at: string
          updated_at: string
        }
        Insert: {
          id_kendaraan?: string
          jenis: string
          merk: string
          plat_nomor: string
          kapasitas_penumpang: number
          status?: 'tersedia' | 'tidak_tersedia' | 'maintenance'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id_kendaraan?: string
          jenis?: string
          merk?: string
          plat_nomor?: string
          kapasitas_penumpang?: number
          status?: 'tersedia' | 'tidak_tersedia' | 'maintenance'
          created_at?: string
          updated_at?: string
        }
      }
      peminjaman: {
        Row: {
          id_peminjaman: string
          id_user: string
          jenis_peminjaman: 'ruangan' | 'kendaraan'
          id_ruangan: string | null
          id_kendaraan: string | null
          tanggal_mulai: string
          jam_mulai: string
          tanggal_selesai: string
          jam_selesai: string
          keperluan: string
          file_surat: string | null
          status: 'diajukan' | 'disetujui' | 'ditolak' | 'selesai'
          qr_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id_peminjaman?: string
          id_user: string
          jenis_peminjaman: 'ruangan' | 'kendaraan'
          id_ruangan?: string | null
          id_kendaraan?: string | null
          tanggal_mulai: string
          jam_mulai: string
          tanggal_selesai: string
          jam_selesai: string
          keperluan: string
          file_surat?: string | null
          status?: 'diajukan' | 'disetujui' | 'ditolak' | 'selesai'
          qr_code: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id_peminjaman?: string
          id_user?: string
          jenis_peminjaman?: 'ruangan' | 'kendaraan'
          id_ruangan?: string | null
          id_kendaraan?: string | null
          tanggal_mulai?: string
          jam_mulai?: string
          tanggal_selesai?: string
          jam_selesai?: string
          keperluan?: string
          file_surat?: string | null
          status?: 'diajukan' | 'disetujui' | 'ditolak' | 'selesai'
          qr_code?: string
          created_at?: string
          updated_at?: string
        }
      }
      log_penggunaan: {
        Row: {
          id_log: string
          id_peminjaman: string
          waktu_scan_mulai: string | null
          waktu_scan_selesai: string | null
          petugas: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id_log?: string
          id_peminjaman: string
          waktu_scan_mulai?: string | null
          waktu_scan_selesai?: string | null
          petugas: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id_log?: string
          id_peminjaman?: string
          waktu_scan_mulai?: string | null
          waktu_scan_selesai?: string | null
          petugas?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']