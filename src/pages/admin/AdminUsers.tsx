import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { Plus, Edit, Trash2, Search, Users, Shield, User, Mail, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface UserData {
  id: string
  email: string
  nama: string
  no_telepon?: string
  role: 'admin' | 'staff' | 'user'
  created_at: string
  last_sign_in_at?: string
}

interface UserFormData {
  email: string
  nama: string
  no_telepon: string
  role: 'admin' | 'staff' | 'user'
  password: string
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'staff' | 'user'>('all')
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    nama: '',
    no_telepon: '',
    role: 'user',
    password: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Gagal memuat data pengguna')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingUser) {
        // Update existing user
        const updateData: any = {
          nama: formData.nama,
          no_telepon: formData.no_telepon || null,
          role: formData.role
        }

        // Only update email if it's different
        if (formData.email !== editingUser.email) {
          updateData.email = formData.email
        }

        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', editingUser.id)

        if (error) throw error
        toast.success('Pengguna berhasil diperbarui')
      } else {
        // Create new user
        if (!formData.password) {
          toast.error('Password harus diisi untuk pengguna baru')
          return
        }

        // First create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password
        })

        if (authError) throw authError

        if (authData.user) {
          // Then create user profile
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              {
                id: authData.user.id,
                email: formData.email,
                nama: formData.nama,
                no_telepon: formData.no_telepon || null,
                role: formData.role
              }
            ])

          if (profileError) throw profileError
        }

        toast.success('Pengguna berhasil ditambahkan')
      }

      setShowModal(false)
      setEditingUser(null)
      setFormData({
        email: '',
        nama: '',
        no_telepon: '',
        role: 'user',
        password: ''
      })
      fetchUsers()
    } catch (error: any) {
      console.error('Error saving user:', error)
      if (error.message?.includes('already registered')) {
        toast.error('Email sudah terdaftar')
      } else {
        toast.error('Gagal menyimpan pengguna')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (user: UserData) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      nama: user.nama,
      no_telepon: user.no_telepon || '',
      role: user.role,
      password: ''
    })
    setShowModal(true)
  }

  const handleDelete = async (user: UserData) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pengguna "${user.nama}"?`)) {
      return
    }

    try {
      // Delete from users table (auth user will be handled by RLS)
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)

      if (error) throw error
      toast.success('Pengguna berhasil dihapus')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Gagal menghapus pengguna')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.no_telepon || '').includes(searchTerm)
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'staff': return 'bg-blue-100 text-blue-800'
      case 'user': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin'
      case 'staff': return 'Staff'
      case 'user': return 'User'
      default: return role
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />
      case 'staff': return <Users className="h-4 w-4" />
      case 'user': return <User className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Memuat pengguna..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Kelola Pengguna</h1>
            <p className="text-gray-600">Tambah, edit, dan kelola akun pengguna sistem</p>
          </div>
          <button
            onClick={() => {
              setEditingUser(null)
              setFormData({
                email: '',
                nama: '',
                no_telepon: '',
                role: 'user',
                password: ''
              })
              setShowModal(true)
            }}
            className="btn btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Tambah Pengguna
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari pengguna..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="input w-full sm:w-auto"
        >
          <option value="all">Semua Role</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || roleFilter !== 'all' ? 'Tidak ada pengguna yang sesuai' : 'Belum ada pengguna'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || roleFilter !== 'all'
              ? 'Coba ubah filter pencarian'
              : 'Tambahkan pengguna pertama untuk memulai'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="card">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      {getRoleIcon(user.role)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{user.nama}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
                          getRoleColor(user.role)
                        }`}>
                          {getRoleIcon(user.role)}
                          {getRoleText(user.role)}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        {user.no_telepon && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{user.no_telepon}</span>
                          </div>
                        )}
                        <p className="text-xs text-gray-500">
                          Bergabung: {format(new Date(user.created_at), 'dd MMM yyyy', { locale: id })}
                          {user.last_sign_in_at && (
                            <span className="ml-2">
                              • Login terakhir: {format(new Date(user.last_sign_in_at), 'dd MMM yyyy', { locale: id })}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="btn btn-outline btn-sm"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                  className="input"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="input"
                  placeholder="Masukkan email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. Telepon
                </label>
                <input
                  type="tel"
                  value={formData.no_telepon}
                  onChange={(e) => setFormData(prev => ({ ...prev, no_telepon: e.target.value }))}
                  className="input"
                  placeholder="Masukkan nomor telepon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                  className="input"
                  required
                >
                  <option value="user">User</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="input pr-10"
                      placeholder="Masukkan password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setShowPassword(false)
                  }}
                  className="btn btn-outline flex-1"
                  disabled={submitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary flex-1"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Menyimpan...</span>
                    </>
                  ) : (
                    editingUser ? 'Perbarui' : 'Tambah'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers