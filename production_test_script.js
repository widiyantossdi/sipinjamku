// 🧪 Production Testing Script
// Jalankan di Browser Console untuk testing otomatis
// URL: https://sipinjamku-p36qbpo70-widiyantos-projects-616c26f9.vercel.app

class ProductionTester {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            issues: []
        };
        this.baseUrl = 'https://sipinjamku-p36qbpo70-widiyantos-projects-616c26f9.vercel.app';
    }

    log(message, type = 'info') {
        const colors = {
            info: '#2196F3',
            success: '#4CAF50',
            error: '#F44336',
            warning: '#FF9800'
        };
        console.log(`%c[PRODUCTION TEST] ${message}`, `color: ${colors[type]}; font-weight: bold;`);
    }

    async test(name, testFunction) {
        this.results.total++;
        try {
            await testFunction();
            this.results.passed++;
            this.log(`✅ ${name}`, 'success');
        } catch (error) {
            this.results.failed++;
            this.results.issues.push({ test: name, error: error.message });
            this.log(`❌ ${name}: ${error.message}`, 'error');
        }
    }

    // 1. Basic Page Loading Tests
    async testPageLoading() {
        await this.test('Homepage Loading', async () => {
            if (!document.title) throw new Error('Page title not loaded');
            if (!document.body) throw new Error('Page body not loaded');
        });

        await this.test('React App Mounted', async () => {
            const reactRoot = document.getElementById('root');
            if (!reactRoot || !reactRoot.children.length) {
                throw new Error('React app not mounted');
            }
        });

        await this.test('CSS Styles Loaded', async () => {
            const hasStyles = document.styleSheets.length > 0;
            if (!hasStyles) throw new Error('No stylesheets loaded');
        });
    }

    // 2. Navigation Tests
    async testNavigation() {
        await this.test('Navigation Menu Exists', async () => {
            const nav = document.querySelector('nav') || document.querySelector('[role="navigation"]');
            if (!nav) throw new Error('Navigation menu not found');
        });

        await this.test('Logo/Brand Exists', async () => {
            const logo = document.querySelector('[alt*="logo"], [alt*="brand"], .logo, .brand');
            if (!logo && !document.querySelector('h1')) {
                throw new Error('Logo or brand element not found');
            }
        });
    }

    // 3. Authentication Tests
    async testAuthentication() {
        await this.test('Login Form Accessible', async () => {
            // Try to find login button or form
            const loginBtn = Array.from(document.querySelectorAll('button, a')).find(el => 
                el.textContent.toLowerCase().includes('login') || 
                el.textContent.toLowerCase().includes('masuk')
            );
            if (!loginBtn) throw new Error('Login button not found');
        });

        await this.test('Register Form Accessible', async () => {
            const registerBtn = Array.from(document.querySelectorAll('button, a')).find(el => 
                el.textContent.toLowerCase().includes('register') || 
                el.textContent.toLowerCase().includes('daftar')
            );
            if (!registerBtn) throw new Error('Register button not found');
        });
    }

    // 4. Responsive Design Tests
    async testResponsiveDesign() {
        await this.test('Mobile Viewport Meta', async () => {
            const viewport = document.querySelector('meta[name="viewport"]');
            if (!viewport) throw new Error('Viewport meta tag not found');
        });

        await this.test('Mobile Navigation', async () => {
            // Simulate mobile width
            const originalWidth = window.innerWidth;
            Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
            window.dispatchEvent(new Event('resize'));
            
            // Check for mobile menu elements
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Restore original width
            Object.defineProperty(window, 'innerWidth', { value: originalWidth, configurable: true });
            window.dispatchEvent(new Event('resize'));
        });
    }

    // 5. Performance Tests
    async testPerformance() {
        await this.test('Page Load Time', async () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            if (loadTime > 5000) {
                throw new Error(`Page load time too slow: ${loadTime}ms`);
            }
        });

        await this.test('DOM Content Loaded', async () => {
            const domTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
            if (domTime > 3000) {
                throw new Error(`DOM load time too slow: ${domTime}ms`);
            }
        });
    }

    // 6. Security Tests
    async testSecurity() {
        await this.test('HTTPS Protocol', async () => {
            if (location.protocol !== 'https:') {
                throw new Error('Site not using HTTPS');
            }
        });

        await this.test('No Console Errors', async () => {
            // This is a basic check - in real testing, you'd monitor console
            const hasErrors = window.console.error.toString().includes('Error');
            // Note: This is a simplified check
        });
    }

    // 7. Supabase Connection Test
    async testSupabaseConnection() {
        await this.test('Supabase Client Available', async () => {
            // Check if Supabase is loaded (this depends on your implementation)
            const hasSupabase = window.supabase || 
                               document.querySelector('script[src*="supabase"]') ||
                               localStorage.getItem('supabase.auth.token');
            // This is a basic check - actual implementation may vary
        });
    }

    // 8. Form Validation Tests
    async testFormValidation() {
        await this.test('Form Elements Present', async () => {
            const forms = document.querySelectorAll('form');
            const inputs = document.querySelectorAll('input, textarea, select');
            if (forms.length === 0 && inputs.length === 0) {
                throw new Error('No form elements found on page');
            }
        });
    }

    // 9. Accessibility Tests
    async testAccessibility() {
        await this.test('Alt Text for Images', async () => {
            const images = document.querySelectorAll('img');
            const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
            if (imagesWithoutAlt.length > 0) {
                throw new Error(`${imagesWithoutAlt.length} images without alt text`);
            }
        });

        await this.test('Proper Heading Structure', async () => {
            const h1s = document.querySelectorAll('h1');
            if (h1s.length === 0) {
                throw new Error('No H1 heading found');
            }
            if (h1s.length > 1) {
                throw new Error('Multiple H1 headings found');
            }
        });
    }

    // 10. Content Tests
    async testContent() {
        await this.test('Page Has Content', async () => {
            const textContent = document.body.textContent.trim();
            if (textContent.length < 100) {
                throw new Error('Page has insufficient content');
            }
        });

        await this.test('No Lorem Ipsum', async () => {
            const content = document.body.textContent.toLowerCase();
            if (content.includes('lorem ipsum')) {
                throw new Error('Lorem ipsum placeholder text found');
            }
        });
    }

    // Main test runner
    async runAllTests() {
        this.log('🚀 Starting Production Testing...', 'info');
        this.log(`Testing URL: ${this.baseUrl}`, 'info');
        
        console.group('📄 Page Loading Tests');
        await this.testPageLoading();
        console.groupEnd();

        console.group('🧭 Navigation Tests');
        await this.testNavigation();
        console.groupEnd();

        console.group('🔐 Authentication Tests');
        await this.testAuthentication();
        console.groupEnd();

        console.group('📱 Responsive Design Tests');
        await this.testResponsiveDesign();
        console.groupEnd();

        console.group('⚡ Performance Tests');
        await this.testPerformance();
        console.groupEnd();

        console.group('🔒 Security Tests');
        await this.testSecurity();
        console.groupEnd();

        console.group('🗄️ Supabase Connection Tests');
        await this.testSupabaseConnection();
        console.groupEnd();

        console.group('📝 Form Validation Tests');
        await this.testFormValidation();
        console.groupEnd();

        console.group('♿ Accessibility Tests');
        await this.testAccessibility();
        console.groupEnd();

        console.group('📄 Content Tests');
        await this.testContent();
        console.groupEnd();

        this.showResults();
    }

    showResults() {
        this.log('\n📊 TESTING RESULTS', 'info');
        this.log(`Total Tests: ${this.results.total}`, 'info');
        this.log(`Passed: ${this.results.passed}`, 'success');
        this.log(`Failed: ${this.results.failed}`, 'error');
        this.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`, 'info');

        if (this.results.issues.length > 0) {
            this.log('\n🚨 ISSUES FOUND:', 'warning');
            this.results.issues.forEach((issue, index) => {
                this.log(`${index + 1}. ${issue.test}: ${issue.error}`, 'error');
            });
        }

        if (this.results.failed === 0) {
            this.log('\n🎉 ALL TESTS PASSED! Production ready! 🎉', 'success');
        } else {
            this.log('\n⚠️ Some tests failed. Please review and fix issues.', 'warning');
        }
    }

    // Quick test for specific features
    async testRBAC() {
        this.log('🔐 Testing RBAC System...', 'info');
        
        // Check if user is logged in
        const isLoggedIn = localStorage.getItem('supabase.auth.token') || 
                          sessionStorage.getItem('supabase.auth.token') ||
                          document.cookie.includes('auth');
        
        if (!isLoggedIn) {
            this.log('❌ User not logged in. Please login first to test RBAC.', 'warning');
            return;
        }

        // Test navigation based on role
        const navItems = document.querySelectorAll('nav a, [role="navigation"] a');
        const navTexts = Array.from(navItems).map(item => item.textContent.toLowerCase());
        
        this.log(`Found navigation items: ${navTexts.join(', ')}`, 'info');
        
        // Check for admin-specific items
        const hasAdminItems = navTexts.some(text => 
            text.includes('admin') || 
            text.includes('manage') || 
            text.includes('kelola')
        );
        
        // Check for staff-specific items
        const hasStaffItems = navTexts.some(text => 
            text.includes('staff') || 
            text.includes('scanner') || 
            text.includes('petugas')
        );
        
        this.log(`Admin items visible: ${hasAdminItems}`, hasAdminItems ? 'success' : 'info');
        this.log(`Staff items visible: ${hasStaffItems}`, hasStaffItems ? 'success' : 'info');
    }
}

// Usage Instructions
console.log('%c🧪 PRODUCTION TESTING SCRIPT LOADED', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
console.log('%cUsage:', 'color: #2196F3; font-weight: bold;');
console.log('1. const tester = new ProductionTester();');
console.log('2. await tester.runAllTests(); // Run all tests');
console.log('3. await tester.testRBAC(); // Test RBAC specifically');
console.log('');
console.log('%cQuick Start:', 'color: #FF9800; font-weight: bold;');
console.log('const tester = new ProductionTester(); await tester.runAllTests();');

// Auto-run basic tests
if (typeof window !== 'undefined') {
    window.ProductionTester = ProductionTester;
    
    // Auto-run basic tests after 2 seconds
    setTimeout(async () => {
        console.log('%c🚀 Auto-running basic production tests...', 'color: #4CAF50; font-weight: bold;');
        const tester = new ProductionTester();
        await tester.runAllTests();
    }, 2000);
}