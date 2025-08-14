import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Building, 
  Car, 
  Calendar, 
  BookOpen, 
  Users, 
  Clock,
  Shield,
  Smartphone,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

const HomePage: React.FC = () => {
  const { user } = useAuth()

  const features = [
    {
      icon: Calendar,
      title: 'Kalender Real-time',
      description: 'Lihat ketersediaan ruangan dan kendaraan secara real-time dengan kalender terintegrasi'
    },
    {
      icon: Smartphone,
      title: 'QR Code Validation',
      description: 'Validasi peminjaman menggunakan QR Code untuk keamanan dan kemudahan tracking'
    },
    {
      icon: Shield,
      title: 'Sistem Approval',
      description: 'Proses persetujuan yang terstruktur dengan notifikasi otomatis via WhatsApp dan Email'
    },
    {
      icon: Clock,
      title: 'Tracking Penggunaan',
      description: 'Pencatatan waktu penggunaan yang akurat untuk laporan dan analisis'
    }
  ]

  const stats = [
    { label: 'Ruangan Tersedia', value: '25+', icon: Building },
    { label: 'Kendaraan Aktif', value: '10+', icon: Car },
    { label: 'Pengguna Terdaftar', value: '500+', icon: Users },
    { label: 'Peminjaman Selesai', value: '1000+', icon: CheckCircle }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Sistem Peminjaman
              <span className="block text-primary-200">UNUGHA Cilacap</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Solusi digital untuk peminjaman ruangan dan kendaraan kampus 
              yang mudah, cepat, dan terintegrasi
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
                >
                  Buka Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
                  >
                    Mulai Sekarang
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
                  >
                    Masuk
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sistem yang dirancang khusus untuk memenuhi kebutuhan 
              peminjaman fasilitas kampus modern
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Akses Cepat
            </h2>
            <p className="text-xl text-gray-600">
              Jelajahi fasilitas yang tersedia
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/rooms"
              className="group bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300"
            >
              <Building className="w-8 h-8 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Ruangan</h3>
              <p className="text-gray-600 text-sm">Lihat semua ruangan yang tersedia untuk dipinjam</p>
            </Link>
            
            <Link
              to="/vehicles"
              className="group bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300"
            >
              <Car className="w-8 h-8 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Kendaraan</h3>
              <p className="text-gray-600 text-sm">Lihat semua kendaraan yang tersedia untuk dipinjam</p>
            </Link>
            
            <Link
              to="/calendar"
              className="group bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300"
            >
              <Calendar className="w-8 h-8 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Kalender</h3>
              <p className="text-gray-600 text-sm">Cek jadwal peminjaman secara real-time</p>
            </Link>
            
            <Link
              to="/guide"
              className="group bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-300"
            >
              <BookOpen className="w-8 h-8 text-orange-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Panduan</h3>
              <p className="text-gray-600 text-sm">Pelajari cara menggunakan sistem peminjaman</p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 bg-primary-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Siap Memulai?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Bergabunglah dengan sistem peminjaman UNUGHA Cilacap dan 
              nikmati kemudahan dalam meminjam fasilitas kampus
            </p>
            <Link
              to="/register"
              className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
            >
              Daftar Sekarang
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

export default HomePage