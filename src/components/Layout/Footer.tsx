import React from 'react'
import { Link } from 'react-router-dom'
import { Building, Mail, Phone, MapPin } from 'lucide-react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">UNUGHA Cilacap</h3>
                <p className="text-sm text-gray-400">Sistem Peminjaman</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Sistem informasi peminjaman ruangan dan kendaraan kampus 
              Universitas Nahdlatul Ulama Al Ghazali (UNUGHA) Cilacap.
            </p>
            <p className="text-gray-400 text-sm">
              Memudahkan civitas akademika dalam melakukan peminjaman 
              fasilitas kampus dengan sistem yang terintegrasi dan real-time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Menu Utama</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link 
                  to="/rooms" 
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Data Ruangan
                </Link>
              </li>
              <li>
                <Link 
                  to="/vehicles" 
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Data Kendaraan
                </Link>
              </li>
              <li>
                <Link 
                  to="/calendar" 
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Kalender Peminjaman
                </Link>
              </li>
              <li>
                <Link 
                  to="/guide" 
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Panduan Peminjaman
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Kontak</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  Jl. Diponegoro No. 15, Cilacap, Jawa Tengah
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  (0282) 123456
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  info@unugha.ac.id
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Universitas Nahdlatul Ulama Al Ghazali Cilacap. 
              All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link 
                to="/" 
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Kebijakan Privasi
              </Link>
              <Link 
                to="/" 
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Syarat & Ketentuan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer