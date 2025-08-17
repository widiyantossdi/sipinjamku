import axios from 'axios';

// Define interfaces for API responses
export interface User {
  id_user: string
  nama: string
  email: string
  no_telepon?: string
  divisi?: string
  role: 'user' | 'admin'
  created_at?: string
  updated_at?: string
}

export interface Room {
  id_ruangan: string
  nama_ruangan: string
  lokasi: string
  kapasitas: number
  fasilitas: string
  status: 'tersedia' | 'tidak_tersedia' | 'maintenance'
  created_at?: string
  updated_at?: string
}

export interface Vehicle {
  id_kendaraan: string
  jenis: string
  merk: string
  plat_nomor: string
  kapasitas_penumpang: number
  status: 'tersedia' | 'tidak_tersedia' | 'maintenance'
  created_at?: string
  updated_at?: string
}

export interface Booking {
  id_peminjaman: string
  id_user: string
  jenis_peminjaman: 'ruangan' | 'kendaraan'
  id_ruangan?: string
  id_kendaraan?: string
  tanggal_mulai: string
  jam_mulai: string
  tanggal_selesai: string
  jam_selesai: string
  keperluan: string
  status: 'diajukan' | 'disetujui' | 'ditolak' | 'selesai' | 'dibatalkan'
  created_at?: string
  updated_at?: string
}

export interface UsageLog {
  id_log: string
  id_user: string
  jenis_penggunaan: 'ruangan' | 'kendaraan'
  id_ruangan?: string
  id_kendaraan?: string
  tanggal: string
  jam_mulai: string
  jam_selesai: string
  keterangan?: string
  created_at?: string
  updated_at?: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  status?: string
}

// API Base URL - Use environment variable or fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Set default axios configuration for CSRF
axios.defaults.withCredentials = true;

// Function to get CSRF token
const getCsrfToken = async () => {
  try {
    await axios.get(`${API_BASE_URL.replace('/api', '')}/sanctum/csrf-cookie`, {
      withCredentials: true
    });
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
  }
};

// Function to get CSRF token from cookie
const getCSRFTokenFromCookie = (): string | null => {
  const name = 'XSRF-TOKEN=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return decodeURIComponent(c.substring(name.length, c.length));
    }
  }
  return null;
};

// Request interceptor to add auth token and CSRF token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token for state-changing requests
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      const csrfToken = getCSRFTokenFromCookie();
      if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    await getCsrfToken();
    const response = await api.post('/login', { email, password });
    return response.data;
  },
  
  register: async (userData: {
    nama: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'admin' | 'user';
    no_telepon?: string;
    divisi?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> => {
    await getCsrfToken();
    const response = await api.post('/register', userData);
    return response.data;
  },
  
  logout: async (): Promise<ApiResponse<any>> => {
    const response = await api.post('/logout');
    return response.data;
  },
  
  profile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/profile');
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get('/users');
    return response.data;
  },
  
  getById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  create: async (userData: Partial<User> & { password: string; password_confirmation: string }): Promise<ApiResponse<User>> => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  update: async (id: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  
  delete: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  updatePassword: async (id: string, passwordData: { current_password: string; new_password: string }): Promise<ApiResponse<any>> => {
    const response = await api.put(`/users/${id}/password`, passwordData);
    return response.data;
  },
};

// Ruangan API
export const ruanganAPI = {
  getAll: async (): Promise<ApiResponse<Room[]>> => {
    const response = await api.get('/ruangan');
    return response.data;
  },
  
  getById: async (id: string): Promise<ApiResponse<Room>> => {
    const response = await api.get(`/ruangan/${id}`);
    return response.data;
  },
  
  create: async (ruanganData: Partial<Room>): Promise<ApiResponse<Room>> => {
    const response = await api.post('/ruangan', ruanganData);
    return response.data;
  },
  
  update: async (id: string, ruanganData: Partial<Room>): Promise<ApiResponse<Room>> => {
    const response = await api.put(`/ruangan/${id}`, ruanganData);
    return response.data;
  },
  
  delete: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/ruangan/${id}`);
    return response.data;
  },
};

// Kendaraan API
export const kendaraanAPI = {
  getAll: async (): Promise<ApiResponse<Vehicle[]>> => {
    const response = await api.get('/kendaraan');
    return response.data;
  },
  
  getById: async (id: string): Promise<ApiResponse<Vehicle>> => {
    const response = await api.get(`/kendaraan/${id}`);
    return response.data;
  },
  
  create: async (kendaraanData: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> => {
    const response = await api.post('/kendaraan', kendaraanData);
    return response.data;
  },
  
  update: async (id: string, kendaraanData: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> => {
    const response = await api.put(`/kendaraan/${id}`, kendaraanData);
    return response.data;
  },
  
  delete: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/kendaraan/${id}`);
    return response.data;
  },
};

// Peminjaman API
export const peminjamanAPI = {
  getAll: async (): Promise<ApiResponse<Booking[]>> => {
    const response = await api.get('/peminjaman');
    return response.data;
  },
  
  getById: async (id: string): Promise<ApiResponse<Booking>> => {
    const response = await api.get(`/peminjaman/${id}`);
    return response.data;
  },
  
  create: async (peminjamanData: Partial<Booking>): Promise<ApiResponse<Booking>> => {
    const response = await api.post('/peminjaman', peminjamanData);
    return response.data;
  },
  
  update: async (id: string, peminjamanData: Partial<Booking>): Promise<ApiResponse<Booking>> => {
    const response = await api.put(`/peminjaman/${id}`, peminjamanData);
    return response.data;
  },
  
  delete: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/peminjaman/${id}`);
    return response.data;
  },
};

// Log Penggunaan API
export const logPenggunaanAPI = {
  getAll: async (): Promise<ApiResponse<UsageLog[]>> => {
    const response = await api.get('/log-penggunaan');
    return response.data;
  },
  
  getById: async (id: string): Promise<ApiResponse<UsageLog>> => {
    const response = await api.get(`/log-penggunaan/${id}`);
    return response.data;
  },
  
  create: async (logData: Partial<UsageLog>): Promise<ApiResponse<UsageLog>> => {
    const response = await api.post('/log-penggunaan', logData);
    return response.data;
  },
};

export default api;