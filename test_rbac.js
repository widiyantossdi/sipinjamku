// Role-Based Access Control Testing Script
// Jalankan di browser console untuk test otomatis

class RBACTester {
  constructor() {
    this.baseUrl = window.location.origin;
    this.testResults = [];
  }

  // Test data untuk setiap role
  testUsers = {
    mahasiswa: {
      email: 'ahmad.rizki@student.unugha.ac.id',
      role: 'mahasiswa',
      allowedPaths: [
        '/', '/rooms', '/vehicles', '/calendar', '/guide',
        '/dashboard', '/booking', '/my-bookings', '/profile'
      ],
      blockedPaths: [
        '/admin', '/admin/users', '/admin/rooms', '/admin/vehicles',
        '/admin/bookings', '/admin/reports', '/staff', '/staff/scanner'
      ]
    },
    dosen: {
      email: 'budi.santoso@unugha.ac.id',
      role: 'dosen',
      allowedPaths: [
        '/', '/rooms', '/vehicles', '/calendar', '/guide',
        '/dashboard', '/booking', '/my-bookings', '/profile'
      ],
      blockedPaths: [
        '/admin', '/admin/users', '/admin/rooms', '/admin/vehicles',
        '/admin/bookings', '/admin/reports', '/staff', '/staff/scanner'
      ]
    },
    petugas: {
      email: 'petugas@unugha.ac.id',
      role: 'petugas',
      allowedPaths: [
        '/', '/rooms', '/vehicles', '/calendar', '/guide',
        '/dashboard', '/booking', '/my-bookings', '/profile',
        '/staff', '/staff/scanner'
      ],
      blockedPaths: [
        '/admin', '/admin/users', '/admin/rooms', '/admin/vehicles',
        '/admin/bookings', '/admin/reports'
      ]
    },
    admin: {
      email: 'admin@unugha.ac.id',
      role: 'admin',
      allowedPaths: [
        '/', '/rooms', '/vehicles', '/calendar', '/guide',
        '/dashboard', '/booking', '/my-bookings', '/profile',
        '/admin', '/admin/users', '/admin/rooms', '/admin/vehicles',
        '/admin/bookings', '/admin/reports', '/staff', '/staff/scanner'
      ],
      blockedPaths: [] // Admin has access to everything
    }
  };

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    
    switch(type) {
      case 'success':
        console.log(`%c✅ ${logMessage}`, 'color: green');
        break;
      case 'error':
        console.log(`%c❌ ${logMessage}`, 'color: red');
        break;
      case 'warning':
        console.log(`%c⚠️ ${logMessage}`, 'color: orange');
        break;
      default:
        console.log(`%cℹ️ ${logMessage}`, 'color: blue');
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Test navigation menu visibility
  testNavigationMenu(expectedRole) {
    this.log(`Testing navigation menu for role: ${expectedRole}`);
    
    const menuItems = {
      admin: ['Admin Panel', 'Kelola Peminjaman', 'Kelola Ruangan', 'Kelola Kendaraan', 'Kelola User', 'Staff Panel', 'QR Scanner'],
      petugas: ['Staff Panel', 'QR Scanner'],
      mahasiswa: [],
      dosen: []
    };

    const expectedMenus = menuItems[expectedRole] || [];
    const actualMenus = [];

    // Check for admin menus
    if (document.querySelector('a[href="/admin"]')) actualMenus.push('Admin Panel');
    if (document.querySelector('a[href="/admin/bookings"]')) actualMenus.push('Kelola Peminjaman');
    if (document.querySelector('a[href="/admin/rooms"]')) actualMenus.push('Kelola Ruangan');
    if (document.querySelector('a[href="/admin/vehicles"]')) actualMenus.push('Kelola Kendaraan');
    if (document.querySelector('a[href="/admin/users"]')) actualMenus.push('Kelola User');
    if (document.querySelector('a[href="/staff"]')) actualMenus.push('Staff Panel');
    if (document.querySelector('a[href="/staff/scanner"]')) actualMenus.push('QR Scanner');

    const isCorrect = expectedMenus.every(menu => actualMenus.includes(menu)) &&
                     actualMenus.every(menu => expectedMenus.includes(menu));

    if (isCorrect) {
      this.log(`Navigation menu correct for ${expectedRole}`, 'success');
    } else {
      this.log(`Navigation menu incorrect for ${expectedRole}. Expected: [${expectedMenus.join(', ')}], Found: [${actualMenus.join(', ')}]`, 'error');
    }

    return isCorrect;
  }

  // Test route access
  async testRouteAccess(role) {
    const user = this.testUsers[role];
    if (!user) {
      this.log(`Unknown role: ${role}`, 'error');
      return false;
    }

    this.log(`Testing route access for ${role}`);
    let allTestsPassed = true;

    // Test allowed paths
    for (const path of user.allowedPaths) {
      try {
        // Navigate to path
        window.history.pushState({}, '', path);
        await this.delay(500);
        
        // Check if we're still on the intended path (not redirected)
        if (window.location.pathname === path || window.location.pathname === '/dashboard') {
          this.log(`✅ Access granted to ${path}`, 'success');
        } else {
          this.log(`❌ Unexpected redirect from ${path} to ${window.location.pathname}`, 'error');
          allTestsPassed = false;
        }
      } catch (error) {
        this.log(`❌ Error accessing ${path}: ${error.message}`, 'error');
        allTestsPassed = false;
      }
    }

    // Test blocked paths
    for (const path of user.blockedPaths) {
      try {
        const originalPath = window.location.pathname;
        window.history.pushState({}, '', path);
        await this.delay(500);
        
        // Should be redirected away from blocked path
        if (window.location.pathname !== path) {
          this.log(`✅ Access correctly blocked to ${path}`, 'success');
        } else {
          this.log(`❌ Access incorrectly allowed to ${path}`, 'error');
          allTestsPassed = false;
        }
      } catch (error) {
        this.log(`❌ Error testing blocked path ${path}: ${error.message}`, 'error');
        allTestsPassed = false;
      }
    }

    return allTestsPassed;
  }

  // Get current user info from page
  getCurrentUserInfo() {
    // Try to get user info from various sources
    const userNameElement = document.querySelector('[data-testid="user-name"]') || 
                           document.querySelector('.user-name') ||
                           document.querySelector('span:contains("@")');
    
    if (userNameElement) {
      return userNameElement.textContent;
    }
    
    return 'Unknown User';
  }

  // Main test runner
  async runAllTests() {
    this.log('🚀 Starting RBAC Testing Suite', 'info');
    this.log('='.repeat(50), 'info');

    // Check if user is logged in
    const currentUser = this.getCurrentUserInfo();
    this.log(`Current user: ${currentUser}`);

    if (currentUser === 'Unknown User') {
      this.log('⚠️ No user detected. Please login first.', 'warning');
      this.log('Manual testing steps:', 'info');
      this.log('1. Login with test users:', 'info');
      Object.values(this.testUsers).forEach(user => {
        this.log(`   - ${user.email} (${user.role})`, 'info');
      });
      this.log('2. Run: rbacTester.testCurrentUser()', 'info');
      return;
    }

    // Detect current user role
    let detectedRole = null;
    for (const [role, userData] of Object.entries(this.testUsers)) {
      if (currentUser.includes(userData.email) || currentUser.includes(role)) {
        detectedRole = role;
        break;
      }
    }

    if (!detectedRole) {
      this.log('⚠️ Could not detect user role. Running manual test...', 'warning');
      return this.testCurrentUser();
    }

    this.log(`Detected role: ${detectedRole}`);
    return this.testCurrentUser(detectedRole);
  }

  // Test current logged-in user
  async testCurrentUser(expectedRole = null) {
    this.log('Testing current user...', 'info');
    
    // Test navigation menu
    if (expectedRole) {
      this.testNavigationMenu(expectedRole);
    }

    // Test basic functionality
    this.testBasicFunctionality();

    // If role is known, test route access
    if (expectedRole) {
      await this.testRouteAccess(expectedRole);
    }

    this.log('='.repeat(50), 'info');
    this.log('🏁 RBAC Testing Complete', 'info');
  }

  // Test basic functionality
  testBasicFunctionality() {
    this.log('Testing basic functionality...');
    
    // Check if essential elements exist
    const tests = [
      { element: 'header', name: 'Header' },
      { element: 'nav', name: 'Navigation' },
      { element: '[data-testid="dashboard"], .dashboard, main', name: 'Main Content' }
    ];

    tests.forEach(test => {
      const element = document.querySelector(test.element);
      if (element) {
        this.log(`✅ ${test.name} found`, 'success');
      } else {
        this.log(`❌ ${test.name} not found`, 'error');
      }
    });
  }

  // Generate test report
  generateReport() {
    this.log('📊 Generating RBAC Test Report...', 'info');
    
    const report = {
      timestamp: new Date().toISOString(),
      currentUrl: window.location.href,
      userAgent: navigator.userAgent,
      testResults: this.testResults,
      recommendations: [
        'Test all user roles manually',
        'Verify route protection works correctly',
        'Check menu visibility for each role',
        'Test unauthorized access attempts',
        'Verify session management'
      ]
    };

    console.table(report.testResults);
    return report;
  }
}

// Initialize tester
const rbacTester = new RBACTester();

// Auto-run if in browser
if (typeof window !== 'undefined') {
  console.log('%c🔐 RBAC Testing Suite Loaded', 'color: blue; font-size: 16px; font-weight: bold');
  console.log('%cUsage:', 'color: green; font-weight: bold');
  console.log('rbacTester.runAllTests() - Run all tests');
  console.log('rbacTester.testCurrentUser() - Test current logged-in user');
  console.log('rbacTester.testNavigationMenu("admin") - Test navigation for specific role');
  console.log('rbacTester.generateReport() - Generate test report');
  console.log('');
  console.log('%cTest Users:', 'color: orange; font-weight: bold');
  Object.entries(rbacTester.testUsers).forEach(([role, user]) => {
    console.log(`${role}: ${user.email}`);
  });
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RBACTester;
}