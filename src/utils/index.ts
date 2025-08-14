import { format, parseISO, isAfter, isBefore, isEqual } from 'date-fns'
import { id } from 'date-fns/locale'
import QRCode from 'qrcode'

// Date utilities
export const formatDate = (date: string | Date, formatStr: string = 'dd MMMM yyyy') => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: id })
}

export const formatTime = (time: string) => {
  return format(parseISO(`2000-01-01T${time}`), 'HH:mm')
}

export const formatDateTime = (date: string, time: string) => {
  return `${formatDate(date)} ${formatTime(time)}`
}

export const isDateTimeConflict = (
  startDate1: string,
  startTime1: string,
  endDate1: string,
  endTime1: string,
  startDate2: string,
  startTime2: string,
  endDate2: string,
  endTime2: string
) => {
  const start1 = new Date(`${startDate1}T${startTime1}`)
  const end1 = new Date(`${endDate1}T${endTime1}`)
  const start2 = new Date(`${startDate2}T${startTime2}`)
  const end2 = new Date(`${endDate2}T${endTime2}`)

  return (
    (isAfter(start1, start2) && isBefore(start1, end2)) ||
    (isAfter(end1, start2) && isBefore(end1, end2)) ||
    (isBefore(start1, start2) && isAfter(end1, end2)) ||
    isEqual(start1, start2) ||
    isEqual(end1, end2)
  )
}

// QR Code utilities
export const generateQRCode = async (data: string): Promise<string> => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    return qrCodeDataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

export const generateQRCodeData = (peminjamanId: string, userId: string) => {
  return JSON.stringify({
    id_peminjaman: peminjamanId,
    id_user: userId,
    timestamp: new Date().toISOString(),
    app: 'UNUGHA_BOOKING_SYSTEM'
  })
}

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type)
}

export const isValidFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return file.size <= maxSizeInBytes
}

// String utilities
export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/
  return phoneRegex.test(phone.replace(/[\s-]/g, ''))
}

// Status utilities
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'diajukan':
      return 'bg-yellow-100 text-yellow-800'
    case 'disetujui':
      return 'bg-green-100 text-green-800'
    case 'ditolak':
      return 'bg-red-100 text-red-800'
    case 'selesai':
      return 'bg-blue-100 text-blue-800'
    case 'tersedia':
      return 'bg-green-100 text-green-800'
    case 'tidak_tersedia':
      return 'bg-red-100 text-red-800'
    case 'maintenance':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const getStatusText = (status: string): string => {
  switch (status) {
    case 'diajukan':
      return 'Diajukan'
    case 'disetujui':
      return 'Disetujui'
    case 'ditolak':
      return 'Ditolak'
    case 'selesai':
      return 'Selesai'
    case 'tersedia':
      return 'Tersedia'
    case 'tidak_tersedia':
      return 'Tidak Tersedia'
    case 'maintenance':
      return 'Maintenance'
    default:
      return status
  }
}

// API utilities
export const handleApiError = (error: any): string => {
  if (error?.message) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return 'Terjadi kesalahan yang tidak diketahui'
}

// Local storage utilities
export const setLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error setting localStorage:', error)
  }
}

export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error('Error getting localStorage:', error)
    return defaultValue
  }
}

export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing localStorage:', error)
  }
}