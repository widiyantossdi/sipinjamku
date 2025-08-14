/**
 * Script Test Otomatis - Verifikasi Data Publik
 * UNUGHA Sistem Peminjaman
 * 
 * Jalankan script ini di browser console untuk memverifikasi
 * bahwa data ruangan, kendaraan, dan kalender dapat diakses secara publik
 */

class PublicDataTester {
  constructor() {
    this.baseUrl = window.location.origin
    this.results = {
      rooms: { status: 'pending', data: null, error: null },
      vehicles: { status: 'pending', data: null, error: null },
      calendar: { status: 'pending', data: null, error: null },
      navigation: { status: 'pending', links: [], error: null }
    }
  }

  // Test navigasi ke halaman ruangan
  async testRoomsPage() {
    console.log('🏢 Testing Rooms Page...')
    try {
      // Cek apakah halaman rooms dapat diakses
      const response = await fetch(`${this.baseUrl}/rooms`)
      if (response.ok) {
        this.results.rooms.status = 'success'
        console.log('✅ Rooms page accessible')
        
        // Cek apakah ada elemen data ruangan
        if (window.location.pathname === '/rooms') {
          const roomElements = document.querySelectorAll('[data-testid="room-card"], .room-card, .card')
          this.results.rooms.data = {
            elementsFound: roomElements.length,
            hasSearchFilter: !!document.querySelector('input[type="search"], input[placeholder*="cari"]'),
            hasStatusFilter: !!document.querySelector('select, .filter'),
            hasRoomData: roomElements.length > 0
          }
          console.log(`📊 Found ${roomElements.length} room elements`)
        }
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      this.results.rooms.status = 'error'
      this.results.rooms.error = error.message
      console.error('❌ Rooms page test failed:', error)
    }
  }

  // Test navigasi ke halaman kendaraan
  async testVehiclesPage() {
    console.log('🚗 Testing Vehicles Page...')
    try {
      const response = await fetch(`${this.baseUrl}/vehicles`)
      if (response.ok) {
        this.results.vehicles.status = 'success'
        console.log('✅ Vehicles page accessible')
        
        if (window.location.pathname === '/vehicles') {
          const vehicleElements = document.querySelectorAll('[data-testid="vehicle-card"], .vehicle-card, .card')
          this.results.vehicles.data = {
            elementsFound: vehicleElements.length,
            hasSearchFilter: !!document.querySelector('input[type="search"], input[placeholder*="cari"]'),
            hasTypeFilter: !!document.querySelector('select, .filter'),
            hasVehicleData: vehicleElements.length > 0
          }
          console.log(`📊 Found ${vehicleElements.length} vehicle elements`)
        }
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      this.results.vehicles.status = 'error'
      this.results.vehicles.error = error.message
      console.error('❌ Vehicles page test failed:', error)
    }
  }

  // Test navigasi ke halaman kalender
  async testCalendarPage() {
    console.log('📅 Testing Calendar Page...')
    try {
      const response = await fetch(`${this.baseUrl}/calendar`)
      if (response.ok) {
        this.results.calendar.status = 'success'
        console.log('✅ Calendar page accessible')
        
        if (window.location.pathname === '/calendar') {
          const calendarElement = document.querySelector('.react-calendar, .calendar, [class*="calendar"]')
          const bookingElements = document.querySelectorAll('[data-testid="booking-item"], .booking-item, .booking')
          this.results.calendar.data = {
            hasCalendar: !!calendarElement,
            bookingElementsFound: bookingElements.length,
            hasDateFilter: !!document.querySelector('.react-calendar, input[type="date"]'),
            hasBookingData: bookingElements.length > 0
          }
          console.log(`📊 Calendar found: ${!!calendarElement}, Bookings: ${bookingElements.length}`)
        }
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      this.results.calendar.status = 'error'
      this.results.calendar.error = error.message
      console.error('❌ Calendar page test failed:', error)
    }
  }

  // Test navigasi dan link publik
  testNavigation() {
    console.log('🧭 Testing Navigation...')
    try {
      const publicLinks = [
        { name: 'Home', selector: 'a[href="/"], a[href="#/"]' },
        { name: 'Rooms', selector: 'a[href="/rooms"], a[href="#/rooms"]' },
        { name: 'Vehicles', selector: 'a[href="/vehicles"], a[href="#/vehicles"]' },
        { name: 'Calendar', selector: 'a[href="/calendar"], a[href="#/calendar"]' },
        { name: 'Guide', selector: 'a[href="/guide"], a[href="#/guide"]' }
      ]

      const foundLinks = []
      publicLinks.forEach(link => {
        const element = document.querySelector(link.selector)
        if (element) {
          foundLinks.push({
            name: link.name,
            href: element.href,
            text: element.textContent.trim(),
            visible: element.offsetParent !== null
          })
        }
      })

      this.results.navigation.status = 'success'
      this.results.navigation.links = foundLinks
      console.log(`✅ Found ${foundLinks.length} navigation links`)
    } catch (error) {
      this.results.navigation.status = 'error'
      this.results.navigation.error = error.message
      console.error('❌ Navigation test failed:', error)
    }
  }

  // Test akses tanpa autentikasi
  testPublicAccess() {
    console.log('🔓 Testing Public Access...')
    
    // Cek apakah ada token autentikasi
    const hasAuthToken = !!(localStorage.getItem('supabase.auth.token') || 
                           sessionStorage.getItem('supabase.auth.token') ||
                           document.cookie.includes('auth'))
    
    // Cek apakah ada redirect ke login
    const isOnLoginPage = window.location.pathname.includes('/login')
    const isOnRegisterPage = window.location.pathname.includes('/register')
    
    console.log(`🔍 Auth token present: ${hasAuthToken}`)
    console.log(`🔍 On login page: ${isOnLoginPage}`)
    console.log(`🔍 On register page: ${isOnRegisterPage}`)
    
    return {
      hasAuthToken,
      isOnLoginPage,
      isOnRegisterPage,
      publicAccessWorking: !isOnLoginPage && !isOnRegisterPage
    }
  }

  // Test responsivitas
  testResponsiveness() {
    console.log('📱 Testing Responsiveness...')
    
    const viewports = [
      { name: 'Mobile', width: 375 },
      { name: 'Tablet', width: 768 },
      { name: 'Desktop', width: 1024 }
    ]
    
    const currentWidth = window.innerWidth
    const currentViewport = viewports.find(v => currentWidth >= v.width) || viewports[0]
    
    console.log(`📊 Current viewport: ${currentViewport.name} (${currentWidth}px)`)
    
    return {
      currentWidth,
      currentViewport: currentViewport.name,
      isMobile: currentWidth < 768,
      isTablet: currentWidth >= 768 && currentWidth < 1024,
      isDesktop: currentWidth >= 1024
    }
  }

  // Jalankan semua test
  async runAllTests() {
    console.log('🚀 Starting Public Data Verification Tests...')
    console.log('=' .repeat(50))
    
    // Test akses publik
    const publicAccess = this.testPublicAccess()
    
    // Test responsivitas
    const responsiveness = this.testResponsiveness()
    
    // Test navigasi
    this.testNavigation()
    
    // Test halaman berdasarkan lokasi saat ini
    const currentPath = window.location.pathname
    
    if (currentPath === '/' || currentPath === '/rooms') {
      await this.testRoomsPage()
    }
    
    if (currentPath === '/' || currentPath === '/vehicles') {
      await this.testVehiclesPage()
    }
    
    if (currentPath === '/' || currentPath === '/calendar') {
      await this.testCalendarPage()
    }
    
    // Tampilkan hasil
    this.displayResults(publicAccess, responsiveness)
  }

  // Tampilkan hasil test
  displayResults(publicAccess, responsiveness) {
    console.log('\n' + '=' .repeat(50))
    console.log('📋 TEST RESULTS SUMMARY')
    console.log('=' .repeat(50))
    
    // Public Access
    console.log('\n🔓 PUBLIC ACCESS:')
    console.log(`   ✅ Public access working: ${publicAccess.publicAccessWorking}`)
    console.log(`   🔍 Auth token present: ${publicAccess.hasAuthToken}`)
    
    // Navigation
    console.log('\n🧭 NAVIGATION:')
    console.log(`   Status: ${this.results.navigation.status}`)
    console.log(`   Links found: ${this.results.navigation.links.length}`)
    this.results.navigation.links.forEach(link => {
      console.log(`   - ${link.name}: ${link.visible ? '✅' : '❌'} ${link.href}`)
    })
    
    // Rooms
    console.log('\n🏢 ROOMS PAGE:')
    console.log(`   Status: ${this.results.rooms.status}`)
    if (this.results.rooms.data) {
      console.log(`   Elements found: ${this.results.rooms.data.elementsFound}`)
      console.log(`   Has search: ${this.results.rooms.data.hasSearchFilter ? '✅' : '❌'}`)
      console.log(`   Has filter: ${this.results.rooms.data.hasStatusFilter ? '✅' : '❌'}`)
    }
    
    // Vehicles
    console.log('\n🚗 VEHICLES PAGE:')
    console.log(`   Status: ${this.results.vehicles.status}`)
    if (this.results.vehicles.data) {
      console.log(`   Elements found: ${this.results.vehicles.data.elementsFound}`)
      console.log(`   Has search: ${this.results.vehicles.data.hasSearchFilter ? '✅' : '❌'}`)
      console.log(`   Has filter: ${this.results.vehicles.data.hasTypeFilter ? '✅' : '❌'}`)
    }
    
    // Calendar
    console.log('\n📅 CALENDAR PAGE:')
    console.log(`   Status: ${this.results.calendar.status}`)
    if (this.results.calendar.data) {
      console.log(`   Has calendar: ${this.results.calendar.data.hasCalendar ? '✅' : '❌'}`)
      console.log(`   Booking elements: ${this.results.calendar.data.bookingElementsFound}`)
    }
    
    // Responsiveness
    console.log('\n📱 RESPONSIVENESS:')
    console.log(`   Current viewport: ${responsiveness.currentViewport} (${responsiveness.currentWidth}px)`)
    console.log(`   Mobile: ${responsiveness.isMobile ? '✅' : '❌'}`)
    console.log(`   Tablet: ${responsiveness.isTablet ? '✅' : '❌'}`)
    console.log(`   Desktop: ${responsiveness.isDesktop ? '✅' : '❌'}`)
    
    // Overall Status
    const overallSuccess = this.results.navigation.status === 'success' &&
                          publicAccess.publicAccessWorking
    
    console.log('\n' + '=' .repeat(50))
    console.log(`🎯 OVERALL STATUS: ${overallSuccess ? '✅ PASSED' : '❌ FAILED'}`)
    console.log('=' .repeat(50))
    
    return {
      success: overallSuccess,
      results: this.results,
      publicAccess,
      responsiveness
    }
  }
}

// Fungsi helper untuk menjalankan test
window.testPublicData = async function() {
  const tester = new PublicDataTester()
  return await tester.runAllTests()
}

// Fungsi untuk test halaman spesifik
window.testCurrentPage = async function() {
  const tester = new PublicDataTester()
  const path = window.location.pathname
  
  console.log(`🔍 Testing current page: ${path}`)
  
  if (path === '/rooms') {
    await tester.testRoomsPage()
  } else if (path === '/vehicles') {
    await tester.testVehiclesPage()
  } else if (path === '/calendar') {
    await tester.testCalendarPage()
  } else {
    console.log('ℹ️ Current page is not a data page')
  }
  
  tester.testNavigation()
  const publicAccess = tester.testPublicAccess()
  const responsiveness = tester.testResponsiveness()
  
  return tester.displayResults(publicAccess, responsiveness)
}

// Auto-run jika script dijalankan langsung
if (typeof window !== 'undefined') {
  console.log('🔧 Public Data Test Script Loaded!')
  console.log('📝 Available commands:')
  console.log('   - testPublicData() : Run all tests')
  console.log('   - testCurrentPage() : Test current page only')
  console.log('')
  console.log('💡 Example usage:')
  console.log('   await testPublicData()')
  console.log('')
}

// Export untuk penggunaan sebagai module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PublicDataTester
}