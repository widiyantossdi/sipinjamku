import React from 'react'
import { Link } from 'react-router-dom'
import { 
  UserPlus, 
  LogIn, 
  Calendar, 
  FileText, 
  CheckCircle, 
  QrCode, 
  Clock, 
  ArrowRight,
  Building,
  Car,
  Users,
  Mail,
  MessageSquare,
  HelpCircle
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const GuidePage: React.FC = () => {
  const { user } = useAuth()

  const steps = [
    {
      id: 1,
      title: 'Registrasi Akun',
      description: 'Daftar akun baru dengan email dan data diri yang valid',
      icon: <UserPlus className="w-8 h-8" />,
      details: [
        'Klik tombol "Daftar" di halaman utama',
        'Isi form registrasi dengan data yang benar',
        'Pilih role sesuai status (Mahasiswa/Dosen)',
        'Verifikasi email yang dikirim ke inbox Anda'
      ],
      completed: !!user
    },
    {
      id: 2,
      title: 'Login ke Sistem',
      description: 'Masuk menggunakan email dan password yang telah didaftarkan',
      icon: <LogIn className="w-8 h-8" />,
      details: [
        'Klik tombol "Masuk" di halaman utama',
        'Masukkan email dan password',
        'Klik "Masuk" untuk mengakses dashboard'
      ],
      completed: !!user
    },
    {
      id: 3,
      title: 'Cek Ketersediaan',
      description: 'Lihat jadwal dan ketersediaan ruangan/kendaraan',
      icon: <Calendar className="w-8 h-8" />,
      details: [
        'Buka halaman "Kalender Peminjaman"',
        'Pilih tanggal yang diinginkan',
        'Lihat jadwal yang sudah terisi',
        'Pastikan tidak ada bentrok waktu'
      ]
    },
    {
      id: 4,
      title: 'Ajukan Peminjaman',
      description: 'Isi form peminjaman dengan lengkap dan benar',
      icon: <FileText className="w-8 h-8" />,
      details: [
        'Pilih jenis peminjaman (Ruangan/Kendaraan)',
        'Pilih aset yang akan dipinjam',
        'Tentukan tanggal dan waktu peminjaman',
        'Isi keperluan dengan jelas',
        'Upload surat pendukung jika diperlukan'
      ]
    },
    {
      id: 5,
      title: 'Menunggu Persetujuan',
      description: 'Admin akan meninjau dan memproses pengajuan Anda',
      icon: <Clock className="w-8 h-8" />,
      details: [
        'Pengajuan akan diproses maksimal 1x24 jam',
        'Anda akan mendapat notifikasi via email/WhatsApp',
        'Cek status di dashboard secara berkala',
        'Siapkan dokumen tambahan jika diminta'
      ]
    },
    {
      id: 6,
      title: 'Penggunaan Fasilitas',
      description: 'Gunakan QR Code untuk validasi saat pengambilan',
      icon: <QrCode className="w-8 h-8" />,
      details: [
        'Download QR Code dari dashboard',
        'Datang tepat waktu sesuai jadwal',
        'Tunjukkan QR Code ke petugas',
        'Petugas akan scan untuk validasi',
        'Gunakan fasilitas sesuai keperluan'
      ]
    },
    {
      id: 7,
      title: 'Pengembalian',
      description: 'Kembalikan fasilitas dalam kondisi baik',
      icon: <CheckCircle className="w-8 h-8" />,
      details: [
        'Kembalikan sesuai waktu yang ditentukan',
        'Pastikan kondisi fasilitas tetap baik',
        'Petugas akan scan QR Code pengembalian',
        'Peminjaman selesai dan tercatat di sistem'
      ]
    }
  ]

  const faqs = [
    {
      question: 'Berapa lama proses persetujuan peminjaman?',
      answer: 'Proses persetujuan biasanya memakan waktu maksimal 1x24 jam kerja. Untuk peminjaman mendesak, Anda dapat menghubungi admin langsung.'
    },
    {
      question: 'Apakah bisa meminjam untuk hari yang sama?',
      answer: 'Peminjaman untuk hari yang sama dapat dilakukan jika masih tersedia slot dan mendapat persetujuan admin. Disarankan untuk mengajukan minimal H-1.'
    },
    {
      question: 'Bagaimana jika terlambat mengembalikan?',
      answer: 'Keterlambatan pengembalian akan dicatat dalam sistem dan dapat mempengaruhi pengajuan peminjaman selanjutnya. Segera hubungi petugas jika ada kendala.'
    },
    {
      question: 'Apakah bisa membatalkan peminjaman?',
      answer: 'Pembatalan dapat dilakukan melalui dashboard dengan memberikan alasan yang jelas. Pembatalan mendadak dapat mempengaruhi reputasi peminjaman Anda.'
    },
    {
      question: 'Dokumen apa saja yang diperlukan?',
      answer: 'Untuk peminjaman ruangan biasanya diperlukan surat kegiatan. Untuk kendaraan diperlukan fotokopi SIM dan surat perjalanan dinas.'
    }
  ]

  const tips = [
    {
      icon: <Calendar className="w-6 h-6 text-blue-600" />,
      title: 'Rencanakan Jauh Hari',
      description: 'Ajukan peminjaman minimal 2-3 hari sebelumnya untuk memastikan ketersediaan.'
    },
    {
      icon: <FileText className="w-6 h-6 text-green-600" />,
      title: 'Lengkapi Dokumen',
      description: 'Pastikan semua dokumen pendukung sudah disiapkan untuk mempercepat proses persetujuan.'
    },
    {
      icon: <Clock className="w-6 h-6 text-orange-600" />,
      title: 'Tepat Waktu',
      description: 'Datang tepat waktu saat pengambilan dan pengembalian untuk menghindari masalah.'
    },
    {
      icon: <Users className="w-6 h-6 text-purple-600" />,
      title: 'Komunikasi Aktif',
      description: 'Jaga komunikasi dengan admin dan petugas jika ada perubahan atau kendala.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Panduan Peminjaman
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ikuti langkah-langkah berikut untuk melakukan peminjaman ruangan dan kendaraan di UNUGHA Cilacap
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <Building className="w-12 h-12 text-primary-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ruangan</h3>
            <p className="text-gray-600">Berbagai ruangan untuk kegiatan akademik dan non-akademik</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <Car className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Kendaraan</h3>
            <p className="text-gray-600">Kendaraan operasional untuk keperluan dinas dan kegiatan</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
            <QrCode className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">QR Code</h3>
            <p className="text-gray-600">Sistem validasi modern untuk kemudahan dan keamanan</p>
          </div>
        </div>

        {/* Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Langkah-langkah Peminjaman
          </h2>
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-8 top-16 w-0.5 h-16 bg-gray-300"></div>
                )}
                
                <div className="flex items-start space-x-6">
                  {/* Step Icon */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-primary-100 text-primary-600'
                  }`}>
                    {step.completed ? <CheckCircle className="w-8 h-8" /> : step.icon}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {step.id}. {step.title}
                      </h3>
                      {step.completed && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Selesai
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start">
                          <ArrowRight className="w-4 h-4 text-primary-600 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Tips & Saran
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {tip.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {tip.title}
                    </h3>
                    <p className="text-gray-600">{tip.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Pertanyaan yang Sering Diajukan
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <details className="group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <HelpCircle className="w-5 h-5 text-primary-600 mr-3" />
                      {faq.question}
                    </h3>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-primary-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Butuh Bantuan?
          </h2>
          <p className="text-gray-600 mb-6">
            Jika Anda mengalami kesulitan atau memiliki pertanyaan, jangan ragu untuk menghubungi kami
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2 text-gray-700">
              <Mail className="w-5 h-5" />
              <span>admin@unugha.ac.id</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-700">
              <MessageSquare className="w-5 h-5" />
              <span>+62 812-3456-7890</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        {!user && (
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Siap Memulai?
              </h2>
              <p className="text-gray-600 mb-6">
                Daftar sekarang dan mulai ajukan peminjaman ruangan atau kendaraan
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-colors"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Daftar Sekarang
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sudah Punya Akun?
                </Link>
              </div>
            </div>
          </div>
        )}

        {user && (
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Mulai Peminjaman
              </h2>
              <p className="text-gray-600 mb-6">
                Anda sudah login dan siap untuk mengajukan peminjaman
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/booking"
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-colors"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Ajukan Peminjaman
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Lihat Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GuidePage