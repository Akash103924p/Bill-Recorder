// Auto Bill Recorder JavaScript Application

class BillRecorder {
    constructor() {
        this.products = [];
        this.bills = [];
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.colorTheme = localStorage.getItem('colorTheme') || 'default';
        this.fontFamily = localStorage.getItem('fontFamily') || 'default';
        this.monthlyBudget = parseFloat(localStorage.getItem('monthlyBudget')) || 10000;
        this.isOnline = navigator.onLine;
        this.pendingSync = [];
        
        // Performance optimization: Cache DOM elements
        this.domCache = {};
        
        // PIN Lock properties
        this.pinEnabled = localStorage.getItem('pinEnabled') === 'true';
        this.savedPin = localStorage.getItem('savedPin') || '';
        this.currentPin = '';
        this.setupPin = '';
        this.isLocked = false;
        
        // Performance: Debounce timers
        this.debounceTimers = {};
        
        // Performance: Lazy load charts
        this.chartsLoaded = false;
        
        this.init();
    }

    init() {
        // Hide loader immediately
        this.hideLoader();
        
        // Ensure DOM is ready before setting up
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupApp();
            });
        } else {
            this.setupApp();
        }
    }

    setupApp() {
        // Performance: Load data in parallel
        this.loadFromStorage();
        
        // Performance: Cache DOM elements
        this.cacheDOMElements();
        
        // Performance: Setup event listeners with passive events where possible
        this.setupEventListeners();
        this.setupPinLock();
        
        // Performance: Lazy initialize charts
        this.lazyInitializeCharts();
        
        this.updateDashboard();
        
        // Ensure the first tab is active and visible
        const firstTab = this.domCache['nav-tab-add-products'] || document.querySelector('.nav-tab[data-tab="add-products"]');
        const firstContent = this.domCache['add-products'] || document.getElementById('add-products');
        
        if (firstTab) firstTab.classList.add('active');
        if (firstContent) {
            firstContent.classList.add('active');
            firstContent.style.display = 'block';
            firstContent.style.visibility = 'visible';
            firstContent.style.opacity = '1';
        }
        
        // Performance: Batch DOM updates
        requestAnimationFrame(() => {
            this.renderProducts();
            this.loadBills();
            this.addAnimations();
        });
        
        this.setupAndroidOptimizations();
        this.setupOfflineMode();
        this.setupBudgetAlerts();
        this.setupPaymentTracking();
        
        console.log('App initialized successfully'); // Debug log
    }

    // Performance: Cache frequently used DOM elements
    cacheDOMElements() {
        const elements = [
            'productsList', 'billsList', 'totalAmount', 'productForm', 
            'productName', 'price', 'quantity', 'category', 'paymentMethod',
            'billSearch', 'billFilter', 'themeToggle', 'colorTheme', 'fontFamily',
            'pinToggle', 'totalBills', 'totalExpenses', 'avgBillAmount', 
            'thisMonthTotal', 'budgetProgress', 'currentSpent', 'monthlyBudget'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.domCache[id] = element;
            }
        });

        // Cache navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            const tabName = tab.dataset.tab;
            if (tabName) {
                this.domCache[`nav-tab-${tabName}`] = tab;
            }
        });

        // Cache tab content areas
        document.querySelectorAll('.tab-content').forEach(content => {
            const contentId = content.id;
            if (contentId) {
                this.domCache[contentId] = content;
            }
        });
    }

    // Performance: Get cached DOM element or fallback to query
    getElement(id) {
        return this.domCache[id] || document.getElementById(id);
    }

    // Performance: Debounce function for frequent operations
    debounce(func, delay = 300) {
        return (...args) => {
            clearTimeout(this.debounceTimers[func.name]);
            this.debounceTimers[func.name] = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Performance: Lazy load charts only when needed
    lazyInitializeCharts() {
        // Only initialize charts when dashboard tab is first opened
        const dashboardTab = this.domCache['nav-tab-dashboard'] || document.querySelector('.nav-tab[data-tab="dashboard"]');
        if (dashboardTab) {
            dashboardTab.addEventListener('click', () => {
                if (!this.chartsLoaded) {
                    this.initializeCharts();
                    this.chartsLoaded = true;
                }
            }, { once: true });
        }
    }

    // Performance: Optimized localStorage loading
    loadFromStorage() {
        try {
            // Batch localStorage reads
            const storedData = {
                bills: localStorage.getItem('bills'),
                theme: localStorage.getItem('theme'),
                colorTheme: localStorage.getItem('colorTheme'),
                fontFamily: localStorage.getItem('fontFamily'),
                monthlyBudget: localStorage.getItem('monthlyBudget'),
                pinEnabled: localStorage.getItem('pinEnabled'),
                savedPin: localStorage.getItem('savedPin')
            };

            // Parse data in one batch
            if (storedData.bills) {
                this.bills = JSON.parse(storedData.bills);
            }
            
            this.currentTheme = storedData.theme || 'light';
            this.colorTheme = storedData.colorTheme || 'default';
            this.fontFamily = storedData.fontFamily || 'default';
            this.monthlyBudget = parseFloat(storedData.monthlyBudget) || 10000;
            this.pinEnabled = storedData.pinEnabled === 'true';
            this.savedPin = storedData.savedPin || '';
        } catch (error) {
            console.error('Error loading from storage:', error);
            this.bills = [];
        }
    }

    setupAndroidOptimizations() {
        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });

        // Handle resize events for Android
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Prevent zoom on double tap for Android
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Optimize scrolling performance
        this.optimizeScrolling();

        // Handle virtual keyboard
        this.handleVirtualKeyboard();
    }

    handleOrientationChange() {
        // Refresh charts when orientation changes
        if (this.bills.length > 0) {
            this.updateCharts();
        }

        // Adjust UI elements for new orientation
        this.adjustUIForOrientation();

        // Show notification for orientation change
        this.showNotification('Screen orientation adjusted', 'info');
    }

    handleResize() {
        // Debounce resize events
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            // Re-render charts with new dimensions
            if (this.bills.length > 0) {
                Object.values(this.charts || {}).forEach(chart => {
                    if (chart) chart.resize();
                });
            }
        }, 250);
    }

    adjustUIForOrientation() {
        const isLandscape = window.innerWidth > window.innerHeight;
        const mainContent = document.querySelector('.main-content');
        
        if (isLandscape) {
            mainContent?.classList.add('landscape-mode');
            mainContent?.classList.remove('portrait-mode');
        } else {
            mainContent?.classList.add('portrait-mode');
            mainContent?.classList.remove('landscape-mode');
        }

        // Adjust chart sizes based on orientation
        this.adjustChartSizes();
    }

    adjustChartSizes() {
        const isLandscape = window.innerWidth > window.innerHeight;
        const chartSections = document.querySelectorAll('.chart-section');
        
        chartSections.forEach(section => {
            const canvas = section.querySelector('canvas');
            if (canvas) {
                if (isLandscape) {
                    canvas.style.maxHeight = '150px';
                } else {
                    canvas.style.maxHeight = '200px';
                }
            }
        });
    }

    optimizeScrolling() {
        // Enable smooth scrolling with better performance
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Add touch-optimized scrolling
        const scrollableElements = document.querySelectorAll('.main-content, .bills-list, .products-list');
        scrollableElements.forEach(element => {
            element.style.webkitOverflowScrolling = 'touch';
            element.style.overflowScrolling = 'touch';
        });
    }

    handleVirtualKeyboard() {
        // Handle virtual keyboard appearance/disappearance
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                // Scroll input into view when keyboard appears
                setTimeout(() => {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            });

            input.addEventListener('blur', () => {
                // Restore scroll position when keyboard disappears
                setTimeout(() => {
                    window.scrollTo(0, 0);
                }, 100);
            });
        });
    }

    // Performance: Optimized chart initialization
    initializeCharts() {
        // Only initialize if charts are needed
        if (this.bills.length === 0) return;

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: window.innerWidth <= 768 ? 300 : 600,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    display: true,
                    position: window.innerWidth <= 768 ? 'bottom' : 'top',
                    labels: {
                        boxWidth: window.innerWidth <= 768 ? 10 : 15,
                        padding: window.innerWidth <= 768 ? 10 : 20,
                        font: {
                            size: window.innerWidth <= 768 ? 10 : 12
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    mode: 'nearest',
                    intersect: false,
                    titleFont: {
                        size: window.innerWidth <= 768 ? 12 : 14
                    },
                    bodyFont: {
                        size: window.innerWidth <= 768 ? 11 : 13
                    },
                    padding: window.innerWidth <= 768 ? 8 : 12
                }
            }
        };

        // Performance: Create charts only if elements exist
        const barCanvas = document.getElementById('barChart');
        const lineCanvas = document.getElementById('lineChart');
        const pieCanvas = document.getElementById('pieChart');
        const doughnutCanvas = document.getElementById('doughnutChart');
        const radarCanvas = document.getElementById('radarChart');

        if (barCanvas) {
            this.barChart = new Chart(barCanvas, {
                type: 'bar',
                data: { labels: [], datasets: [{ label: 'Monthly Expenses', data: [] }] },
                options: chartOptions
            });
        }

        if (lineCanvas) {
            this.lineChart = new Chart(lineCanvas, {
                type: 'line',
                data: { labels: [], datasets: [{ label: 'Expense Trend', data: [] }] },
                options: chartOptions
            });
        }

        if (pieCanvas) {
            this.pieChart = new Chart(pieCanvas, {
                type: 'pie',
                data: { labels: [], datasets: [{ data: [] }] },
                options: chartOptions
            });
        }

        if (doughnutCanvas) {
            this.doughnutChart = new Chart(doughnutCanvas, {
                type: 'doughnut',
                data: { labels: [], datasets: [{ data: [] }] },
                options: chartOptions
            });
        }

        if (radarCanvas) {
            this.radarChart = new Chart(radarCanvas, {
                type: 'radar',
                data: { labels: [], datasets: [{ label: 'Category Analysis', data: [] }] },
                options: chartOptions
            });
        }

        // Store charts reference for easy access
        this.charts = {
            bar: this.barChart,
            line: this.lineChart,
            pie: this.pieChart,
            doughnut: this.doughnutChart,
            radar: this.radarChart
        };

        // Update charts with data
        this.updateCharts();
    }

    hideLoader() {
        // Hide loader immediately without timeout
        const loader = document.getElementById('pageLoader');
        if (loader) {
            loader.style.display = 'none';
            loader.style.visibility = 'hidden';
            loader.style.opacity = '0';
        }
        
        // Ensure main content is visible
        const mainContent = document.querySelector('#app');
        if (mainContent) {
            mainContent.style.display = 'block';
            mainContent.style.visibility = 'visible';
            mainContent.style.opacity = '1';
        }
    }

    addAnimations() {
        // Add intersection observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-in-up, .animate-in-down, .animate-in-left, .animate-in-right').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            observer.observe(el);
        });
    }

    setupEventListeners() {
        // Performance: Use passive event listeners where possible
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab), { passive: true });
        });

        // Chart selection buttons
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchChart(e.target.dataset.chart), { passive: true });
        });

        // Product form
        const productForm = this.getElement('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addProduct();
            });
        }

        // Form controls
        const clearForm = this.getElement('clearForm');
        if (clearForm) clearForm.addEventListener('click', () => this.clearForm(), { passive: true });
        
        const voiceInput = this.getElement('voiceInput');
        if (voiceInput) voiceInput.addEventListener('click', () => this.startVoiceInput(), { passive: true });
        
        const generateBill = this.getElement('generateBill');
        if (generateBill) generateBill.addEventListener('click', () => this.generateBill(), { passive: true });

        // Theme controls
        const themeToggle = this.getElement('themeToggle');
        if (themeToggle) themeToggle.addEventListener('click', () => this.toggleTheme(), { passive: true });
        
        const colorTheme = this.getElement('colorTheme');
        if (colorTheme) colorTheme?.addEventListener('change', (e) => this.changeColorTheme(e.target.value), { passive: true });
        
        const fontFamily = this.getElement('fontFamily');
        if (fontFamily) fontFamily?.addEventListener('change', (e) => this.changeFontFamily(e.target.value), { passive: true });

        // PIN controls
        const pinToggle = this.getElement('pinToggle');
        if (pinToggle) pinToggle?.addEventListener('click', () => this.togglePinLock(), { passive: true });

        // Budget controls
        const setBudget = this.getElement('setBudget');
        if (setBudget) setBudget?.addEventListener('click', () => this.setBudget(), { passive: true });
        
        const budgetInput = this.getElement('budgetInput');
        if (budgetInput) budgetInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.setBudget();
        });

        // Performance: Debounced search and filter
        const billSearch = this.getElement('billSearch');
        if (billSearch) {
            const debouncedSearch = this.debounce((value) => this.searchBills(value), 250);
            billSearch.addEventListener('input', (e) => debouncedSearch(e.target.value), { passive: true });
        }
        
        const billFilter = this.getElement('billFilter');
        if (billFilter) billFilter?.addEventListener('change', (e) => this.filterBills(e.target.value), { passive: true });
        
        const exportBills = this.getElement('exportBills');
        if (exportBills) exportBills?.addEventListener('click', () => this.exportBills(), { passive: true });

        // Floating Action Button
        const fabButton = this.getElement('fabButton');
        if (fabButton) fabButton?.addEventListener('click', () => this.showFabMenu(), { passive: true });

        // Performance: Passive keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e), { passive: false });
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + N: New product
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            document.getElementById('productName').focus();
        }
        
        // Ctrl/Cmd + S: Generate bill
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.generateBill();
        }
        
        // Ctrl/Cmd + D: Toggle theme
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            this.toggleTheme();
        }
    }

    showFabMenu() {
        const actions = [
            { label: 'Add Product', action: () => document.getElementById('productName').focus() },
            { label: 'Generate Bill', action: () => this.generateBill() },
            { label: 'View Dashboard', action: () => this.switchTab('dashboard') },
            { label: 'Export Data', action: () => this.exportBills() }
        ];

        const menu = document.createElement('div');
        menu.className = 'fab-menu';
        menu.innerHTML = actions.map((action, index) => `
            <button class="fab-menu-item" style="animation-delay: ${index * 0.1}s">
                ${action.label}
            </button>
        `).join('');

        document.body.appendChild(menu);

        menu.querySelectorAll('.fab-menu-item').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                actions[index].action();
                document.body.removeChild(menu);
            });
        });

        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    document.body.removeChild(menu);
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }

    searchBills(query) {
        const filtered = this.bills.filter(bill => 
            bill.products.some(product => 
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.category.toLowerCase().includes(query.toLowerCase())
            )
        );
        this.renderBills(filtered);
    }

    filterBills(period) {
        const now = new Date();
        let filtered = this.bills;

        switch(period) {
            case 'today':
                filtered = this.bills.filter(bill => {
                    const billDate = new Date(bill.date);
                    return billDate.toDateString() === now.toDateString();
                });
                break;
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filtered = this.bills.filter(bill => new Date(bill.date) >= weekAgo);
                break;
            case 'month':
                filtered = this.bills.filter(bill => {
                    const billDate = new Date(bill.date);
                    return billDate.getMonth() === now.getMonth() && 
                           billDate.getFullYear() === now.getFullYear();
                });
                break;
        }

        this.renderBills(filtered);
    }

    exportBills() {
        const dataStr = JSON.stringify(this.bills, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `bills_export_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showNotification('Bills exported successfully!', 'success');
    }

    updateDashboard() {
        // Instant dashboard update - optimized calculations
        const totalBills = this.bills.length;
        const totalExpenses = this.bills.reduce((sum, bill) => sum + bill.total, 0);
        const avgBillAmount = totalBills > 0 ? totalExpenses / totalBills : 0;
        
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const thisMonthBills = this.bills.filter(bill => {
            const billDate = new Date(bill.date);
            return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
        });
        const thisMonthTotal = thisMonthBills.reduce((sum, bill) => sum + bill.total, 0);

        // Instant DOM updates - no batching
        const elements = {
            totalBills: document.getElementById('totalBills'),
            totalExpenses: document.getElementById('totalExpenses'),
            avgBillAmount: document.getElementById('avgBillAmount'),
            thisMonthTotal: document.getElementById('thisMonthTotal'),
            budgetProgress: document.getElementById('budgetProgress'),
            currentSpent: document.getElementById('currentSpent'),
            monthlyBudget: document.getElementById('monthlyBudget')
        };

        if (elements.totalBills) elements.totalBills.textContent = totalBills;
        if (elements.totalExpenses) elements.totalExpenses.textContent = totalExpenses.toFixed(2);
        if (elements.avgBillAmount) elements.avgBillAmount.textContent = avgBillAmount.toFixed(2);
        if (elements.thisMonthTotal) elements.thisMonthTotal.textContent = thisMonthTotal.toFixed(2);

        // Instant budget progress update
        const budgetProgress = Math.min((thisMonthTotal / this.monthlyBudget) * 100, 100);
        if (elements.budgetProgress) {
            elements.budgetProgress.style.width = `${budgetProgress}%`;
        }
        if (elements.currentSpent) elements.currentSpent.textContent = thisMonthTotal.toFixed(2);
        if (elements.monthlyBudget) elements.monthlyBudget.textContent = this.monthlyBudget.toFixed(2);
    }

    updateCharts() {
        // Instant chart updates - no delays
        if (this.bills.length === 0) return;

        // Update all charts instantly
        this.updateBarChart();
        this.updateLineChart();
        this.updatePieChart();
        this.updateDoughnutChart();
        this.updateRadarChart();
    }

    addProduct() {
        if (this.isLocked) {
            this.showPinModal();
            return;
        }
        
        // Performance: Use cached DOM elements
        const productNameEl = this.getElement('productName');
        const priceEl = this.getElement('price');
        const quantityEl = this.getElement('quantity');
        const categoryEl = this.getElement('category');
        const paymentMethodEl = this.getElement('paymentMethod');
        
        if (!productNameEl || !priceEl || !quantityEl || !categoryEl || !paymentMethodEl) {
            this.showNotification('Form elements not found', 'error');
            return;
        }
        
        const productName = productNameEl.value.trim();
        const price = parseFloat(priceEl.value);
        const quantity = parseInt(quantityEl.value);
        const category = categoryEl.value;
        const paymentMethod = paymentMethodEl.value;

        if (!productName || !price || !quantity) {
            this.showNotification('Please fill all fields correctly', 'error');
            return;
        }

        const product = {
            id: Date.now(),
            name: productName,
            price: price,
            quantity: quantity,
            category: category,
            paymentMethod: paymentMethod,
            total: price * quantity
        };

        this.products.push(product);
        
        // Performance: Batch UI updates with requestAnimationFrame
        requestAnimationFrame(() => {
            this.renderProducts();
            this.updateTotal();
            this.clearForm();
            this.showNotification('Product added successfully', 'success');
        });
    }

    // Helper method to escape HTML and prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    renderProducts() {
        const container = this.getElement('productsList');
        if (!container) return;
        
        if (this.products.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No products added yet</p></div>';
            return;
        }

        // Performance: Use document fragment and batch HTML generation
        const fragment = document.createDocumentFragment();
        const productsContainer = document.createElement('div');
        productsContainer.className = 'products-list';
        
        // Performance: Pre-escape HTML and batch generate
        const productsHTML = this.products.map(product => {
            const escapedName = this.escapeHtml(product.name);
            const escapedCategory = this.escapeHtml(product.category);
            return `
                <div class="product-item">
                    <div class="product-info">
                        <div class="product-name">${escapedName}</div>
                        <div class="product-details">
                            ${product.quantity} × ₹${product.price.toFixed(2)} • ${escapedCategory}
                        </div>
                    </div>
                    <div class="product-price">₹${product.total.toFixed(2)}</div>
                    <button class="remove-product" onclick="window.billRecorder.removeProduct(${product.id})">
                        🗑️ Remove
                    </button>
                </div>
            `;
        }).join('');
        
        productsContainer.innerHTML = productsHTML;
        fragment.appendChild(productsContainer);
        
        // Performance: Single DOM update
        container.innerHTML = '';
        container.appendChild(fragment);
    }

    renderBills(bills = this.bills) {
        const container = document.getElementById('billsList');
        
        if (bills.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No bills found</h3><p>Start by adding products and generating bills</p></div>';
            return;
        }

        container.innerHTML = '<div class="bills-list">' + 
            bills.slice().reverse().map(bill => `
                <div class="bill-item">
                    <div class="bill-info">
                        <div class="bill-date">${new Date(bill.date).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</div>
                        <div class="bill-details">
                            ${bill.products.length} items • 
                            Categories: ${[...new Set(bill.products.map(p => p.category))].join(', ')}
                        </div>
                    </div>
                    <div class="bill-amount">₹${bill.total.toFixed(2)}</div>
                    <div class="bill-actions">
                        <button class="btn btn-primary btn-small" onclick="billRecorder.viewBill(${bill.id})">
                            View
                        </button>
                        <button class="btn btn-secondary btn-small" onclick="billRecorder.printBill(${bill.id})">
                            Print
                        </button>
                        <button class="btn btn-small remove-product" onclick="billRecorder.deleteBill(${bill.id})">
                            Delete
                        </button>
                    </div>
                </div>
            `).join('') + '</div>';
    }

    loadBills() {
        // Instant bill loading - no delays
        this.renderBills();
    }

    renderBills(bills = this.bills) {
        const container = this.getElement('billsList');
        if (!container) return;
        
        if (bills.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No bills found</h3><p>Start by adding products and generating bills</p></div>';
            return;
        }

        // Performance: Use document fragment and batch HTML generation
        const fragment = document.createDocumentFragment();
        const billsList = document.createElement('div');
        billsList.className = 'bills-list';
        
        // Performance: Pre-calculate values and batch generate
        const billsHTML = bills.slice().reverse().map(bill => {
            const date = new Date(bill.date);
            const categories = [...new Set(bill.products.map(p => p.category))].join(', ');
            
            return `
                <div class="bill-item">
                    <div class="bill-info">
                        <div class="bill-date">${date.toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</div>
                        <div class="bill-details">
                            ${bill.products.length} items • Categories: ${categories}
                        </div>
                    </div>
                    <div class="bill-amount">₹${bill.total.toFixed(2)}</div>
                    <div class="bill-actions">
                        <button class="btn btn-primary btn-small" onclick="window.billRecorder.viewBill(${bill.id})">
                            👁️ View
                        </button>
                        <button class="btn btn-secondary btn-small" onclick="window.billRecorder.printBill(${bill.id})">
                            🖨️ Print
                        </button>
                        <button class="remove-product" onclick="window.billRecorder.deleteBill(${bill.id})">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        billsList.innerHTML = billsHTML;
        fragment.appendChild(billsList);
        
        // Performance: Single DOM update
        container.innerHTML = '';
        container.appendChild(fragment);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Instant removal - no delays
        setTimeout(() => {
            notification.style.animation = 'slideOutRightInstant 0.1s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 100); // Reduced from 300ms to 100ms
        }, 2000); // Reduced from 3000ms to 2000ms
    }

    switchChart(chartType) {
        // Instant chart switching - no delays
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-chart="${chartType}"]`).classList.add('active');

        // Update chart sections
        document.querySelectorAll('.chart-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${chartType}ChartSection`).classList.add('active');

        // Instant chart update - no requestAnimationFrame delay
        this.updateSpecificChart(chartType);
}

    updateSpecificChart(chartType) {
        if (this.bills.length === 0) {
            return;
        }

        switch(chartType) {
            case 'bar':
                this.updateBarChart();
                break;
            case 'line':
                this.updateLineChart();
                break;
            case 'pie':
                this.updatePieChart();
                break;
            case 'doughnut':
                this.updateDoughnutChart();
                break;
            case 'radar':
                this.updateRadarChart();
                break;
        }
    }

    updateBarChart() {
        const monthlyData = {};
        this.bills.forEach(bill => {
            const month = new Date(bill.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
            monthlyData[month] = (monthlyData[month] || 0) + bill.total;
        });

        const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
            const dateA = new Date(a);
            const dateB = new Date(b);
            return dateA - dateB;
        });

        this.barChart.data.labels = sortedMonths;
        this.barChart.data.datasets[0].data = sortedMonths.map(month => monthlyData[month]);
        this.barChart.data.datasets[0].backgroundColor = '#10b981';
        this.barChart.update();
    }

    updateLineChart() {
        const dailyData = {};
        this.bills.forEach(bill => {
            const day = new Date(bill.date).toLocaleDateString('en-IN');
            dailyData[day] = (dailyData[day] || 0) + bill.total;
        });

        const sortedDays = Object.keys(dailyData).sort();
        const cumulativeData = [];
        let cumulative = 0;
        sortedDays.forEach(day => {
            cumulative += dailyData[day];
            cumulativeData.push(cumulative);
        });

        this.lineChart.data.labels = sortedDays;
        this.lineChart.data.datasets[0].data = cumulativeData;
        this.lineChart.data.datasets[0].borderColor = '#06b6d4';
        this.lineChart.data.datasets[0].backgroundColor = 'rgba(6, 182, 212, 0.1)';
        this.lineChart.update();
    }

    updatePieChart() {
        const categoryData = {};
        this.bills.forEach(bill => {
            bill.products.forEach(product => {
                categoryData[product.category] = (categoryData[product.category] || 0) + product.total;
            });
        });

        this.pieChart.data.labels = Object.keys(categoryData);
        this.pieChart.data.datasets[0].data = Object.values(categoryData);
        this.pieChart.data.datasets[0].backgroundColor = [
            '#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6b7280'
        ];
        this.pieChart.update();
    }

    updateDoughnutChart() {
        const categoryData = {};
        this.bills.forEach(bill => {
            bill.products.forEach(product => {
                categoryData[product.category] = (categoryData[product.category] || 0) + product.total;
            });
        });

        this.doughnutChart.data.labels = Object.keys(categoryData);
        this.doughnutChart.data.datasets[0].data = Object.values(categoryData);
        this.doughnutChart.data.datasets[0].backgroundColor = [
            '#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6b7280'
        ];
        this.doughnutChart.data.datasets[0].borderWidth = 2;
        this.doughnutChart.data.datasets[0].borderColor = '#fff';
        this.doughnutChart.update();
    }

    updateRadarChart() {
        const categoryData = {};
        const categoryCount = {};
        
        this.bills.forEach(bill => {
            bill.products.forEach(product => {
                categoryData[product.category] = (categoryData[product.category] || 0) + product.total;
                categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
            });
        });

        // Calculate average per category for radar chart
        const radarData = {};
        Object.keys(categoryData).forEach(category => {
            radarData[category] = categoryData[category] / categoryCount[category];
        });

        this.radarChart.data.labels = Object.keys(radarData);
        this.radarChart.data.datasets[0].data = Object.values(radarData);
        this.radarChart.data.datasets[0].borderColor = '#8b5cf6';
        this.radarChart.data.datasets[0].backgroundColor = 'rgba(139, 92, 246, 0.2)';
        this.radarChart.data.datasets[0].pointBackgroundColor = '#8b5cf6';
        this.radarChart.data.datasets[0].pointBorderColor = '#fff';
        this.radarChart.data.datasets[0].pointHoverBackgroundColor = '#fff';
        this.radarChart.data.datasets[0].pointHoverBorderColor = '#8b5cf6';
        this.radarChart.update();
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Refresh data when switching tabs
        if (tabName === 'bill-history') {
            this.loadBills();
        } else if (tabName === 'monthly-reports') {
            this.updateCharts();
        } else if (tabName === 'dashboard') {
            this.updateDashboard();
        }
    }

    removeProduct(productId) {
        this.products = this.products.filter(p => p.id !== productId);
        this.renderProducts();
        this.updateTotal();
    }

    updateTotal() {
        const total = this.products.reduce((sum, product) => sum + product.total, 0);
        document.getElementById('totalAmount').textContent = total.toFixed(2);
    }

    clearForm() {
        document.getElementById('productForm').reset();
        document.getElementById('quantity').value = 1;
    }

    generateBill() {
        if (this.products.length === 0) {
            this.showNotification('Please add at least one product', 'error');
            return;
        }

        const bill = {
            id: Date.now(),
            date: new Date().toISOString(),
            products: [...this.products],
            total: this.products.reduce((sum, product) => sum + product.total, 0)
        };

        this.bills.push(bill);
        localStorage.setItem('bills', JSON.stringify(this.bills));
        
        this.products = [];
        this.renderProducts();
        this.updateTotal();
        
        this.showNotification('Bill generated successfully!', 'success');
        this.switchTab('bill-history');
        this.updateDashboard();
    }

    viewBill(billId) {
        const bill = this.bills.find(b => b.id === billId);
        if (!bill) return;

        const billContent = `
            <div style="padding: 20px; font-family: Arial, sans-serif;">
                <h2>Bill Details</h2>
                <p><strong>Date:</strong> ${new Date(bill.date).toLocaleDateString('en-IN')}</p>
                <p><strong>Time:</strong> ${new Date(bill.date).toLocaleTimeString('en-IN')}</p>
                <hr>
                <h3>Products:</h3>
                ${bill.products.map(product => `
                    <div style="margin: 10px 0; padding: 10px; border: 1px solid #ddd;">
                        <strong>${product.name}</strong><br>
                        Quantity: ${product.quantity} × ₹${product.price.toFixed(2)} = ₹${product.total.toFixed(2)}<br>
                        Category: ${product.category}
                    </div>
                `).join('')}
                <hr>
                <h3>Total Amount: ₹${bill.total.toFixed(2)}</h3>
            </div>
        `;

        const newWindow = window.open('', '_blank');
        newWindow.document.write(billContent);
        newWindow.document.close();
    }

    printBill(billId) {
        const bill = this.bills.find(b => b.id === billId);
        if (!bill) return;

        const printContent = document.createElement('div');
        printContent.innerHTML = `
            <div id="printBill_${billId}" style="display: none;">
                <div style="padding: 20px; font-family: Arial, sans-serif;">
                    <h1 style="text-align: center; color: #10b981;">Auto Bill Recorder</h1>
                    <h2 style="text-align: center;">Bill Receipt</h2>
                    <p style="text-align: center;">Made by Akash Mahato</p>
                    <hr>
                    <p><strong>Date:</strong> ${new Date(bill.date).toLocaleDateString('en-IN')}</p>
                    <p><strong>Time:</strong> ${new Date(bill.date).toLocaleTimeString('en-IN')}</p>
                    <p><strong>Bill ID:</strong> #${bill.id}</p>
                    <hr>
                    <h3>Products:</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid #ddd;">
                                <th style="text-align: left; padding: 8px;">Product</th>
                                <th style="text-align: center; padding: 8px;">Qty</th>
                                <th style="text-align: right; padding: 8px;">Price</th>
                                <th style="text-align: right; padding: 8px;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bill.products.map(product => `
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 8px;">${product.name}</td>
                                    <td style="text-align: center; padding: 8px;">${product.quantity}</td>
                                    <td style="text-align: right; padding: 8px;">₹${product.price.toFixed(2)}</td>
                                    <td style="text-align: right; padding: 8px;">₹${product.total.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <hr>
                    <h2 style="text-align: right;">Total Amount: ₹${bill.total.toFixed(2)}</h2>
                    <p style="text-align: center; margin-top: 30px; font-style: italic;">Thank you for your business!</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(printContent);
        
        const printElement = document.getElementById(`printBill_${billId}`);
        printElement.style.display = 'block';
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bill #${bill.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                ${printElement.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        
        document.body.removeChild(printContent);
    }

    deleteBill(billId) {
        if (confirm('Are you sure you want to delete this bill?')) {
            this.bills = this.bills.filter(b => b.id !== billId);
            localStorage.setItem('bills', JSON.stringify(this.bills));
            this.loadBills();
            this.updateDashboard();
            this.showNotification('Bill deleted successfully', 'success');
        }
    }

    initCharts() {
        // Initialize empty charts
        this.barChart = new Chart(document.getElementById('barChart'), {
            type: 'bar',
            data: { labels: [], datasets: [{ label: 'Monthly Expenses', data: [] }] },
            options: { responsive: true, maintainAspectRatio: false }
        });

        this.lineChart = new Chart(document.getElementById('lineChart'), {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Expense Trend', data: [] }] },
            options: { responsive: true, maintainAspectRatio: false }
        });

        this.pieChart = new Chart(document.getElementById('pieChart'), {
            type: 'pie',
            data: { labels: [], datasets: [{ data: [] }] },
            options: { responsive: true, maintainAspectRatio: false }
        });

        this.doughnutChart = new Chart(document.getElementById('doughnutChart'), {
            type: 'doughnut',
            data: { labels: [], datasets: [{ data: [] }] },
            options: { responsive: true, maintainAspectRatio: false }
        });

        this.radarChart = new Chart(document.getElementById('radarChart'), {
            type: 'radar',
            data: { labels: [], datasets: [{ label: 'Category Analysis', data: [] }] },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    updateCharts() {
        if (this.bills.length === 0) {
            this.initCharts();
            return;
        }

        // Update the currently active chart
        const activeChartBtn = document.querySelector('.chart-btn.active');
        if (activeChartBtn) {
            this.updateSpecificChart(activeChartBtn.dataset.chart);
        }
    }

    startVoiceInput() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showNotification('Voice input is not supported in your browser', 'error');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';

        recognition.onstart = () => {
            this.showNotification('Listening... Speak the product name', 'info');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('productName').value = transcript;
            this.showNotification(`Product name: "${transcript}"`, 'success');
        };

        recognition.onerror = (event) => {
            this.showNotification('Voice input error: ' + event.error, 'error');
        };

        recognition.start();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('theme', this.currentTheme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        document.documentElement.setAttribute('data-theme-color', this.colorTheme);
        document.documentElement.setAttribute('data-font', this.fontFamily);
        const themeIcon = document.querySelector('.theme-icon');
        themeIcon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        
        // Set theme selectors to current values
        const colorThemeSelect = document.getElementById('colorTheme');
        const fontSelect = document.getElementById('fontFamily');
        if (colorThemeSelect) {
            colorThemeSelect.value = this.colorTheme;
            console.log('Color theme set to:', this.colorTheme);
        }
        if (fontSelect) {
            fontSelect.value = this.fontFamily;
            console.log('Font family set to:', this.fontFamily);
        }
    }

    changeColorTheme(theme) {
        this.colorTheme = theme;
        localStorage.setItem('colorTheme', theme);
        document.documentElement.setAttribute('data-theme-color', theme);
        this.showNotification(`Color theme changed to ${theme}`, 'success');
        console.log('Color theme changed to:', theme);
    }

    changeFontFamily(font) {
        this.fontFamily = font;
        localStorage.setItem('fontFamily', font);
        document.documentElement.setAttribute('data-font', font);
        this.showNotification(`Font changed to ${font}`, 'success');
        console.log('Font family changed to:', font);
    }

    // Budget Alerts Feature
    setupBudgetAlerts() {
        this.updateBudgetAlerts();
        // Check budget alerts every time dashboard is updated
        setInterval(() => this.updateBudgetAlerts(), 60000); // Check every minute
    }

    setBudget() {
        const budgetInput = document.getElementById('budgetInput');
        const budget = parseFloat(budgetInput.value);
        
        if (!budget || budget <= 0) {
            this.showNotification('Please enter a valid budget amount', 'error');
            return;
        }

        this.monthlyBudget = budget;
        localStorage.setItem('monthlyBudget', budget);
        
        document.getElementById('monthlyBudget').textContent = budget.toFixed(2);
        budgetInput.value = '';
        
        this.updateDashboard();
        this.updateBudgetAlerts();
        this.showNotification(`Monthly budget set to ₹${budget.toFixed(2)}`, 'success');
    }

    updateBudgetAlerts() {
        const alertsContainer = document.getElementById('budgetAlerts');
        if (!alertsContainer) return;

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonthBills = this.bills.filter(bill => {
            const billDate = new Date(bill.date);
            return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
        });
        
        const thisMonthTotal = thisMonthBills.reduce((sum, bill) => sum + bill.total, 0);
        const percentageUsed = (thisMonthTotal / this.monthlyBudget) * 100;
        
        let alerts = [];
        
        if (percentageUsed >= 100) {
            alerts.push({
                type: 'critical',
                icon: '🚨',
                text: `Budget exceeded! You've spent ₹${thisMonthTotal.toFixed(2)} (₹${(thisMonthTotal - this.monthlyBudget).toFixed(2)} over budget)`
            });
        } else if (percentageUsed >= 90) {
            alerts.push({
                type: 'critical',
                icon: '⚠️',
                text: `Almost at budget limit! ₹${thisMonthTotal.toFixed(2)} spent (${percentageUsed.toFixed(1)}% of budget)`
            });
        } else if (percentageUsed >= 75) {
            alerts.push({
                type: 'warning',
                icon: '💡',
                text: `Budget warning: ₹${thisMonthTotal.toFixed(2)} spent (${percentageUsed.toFixed(1)}% of budget)`
            });
        } else if (percentageUsed >= 50) {
            alerts.push({
                type: 'info',
                icon: '📊',
                text: `Half budget reached: ₹${thisMonthTotal.toFixed(2)} spent (${percentageUsed.toFixed(1)}% of budget)`
            });
        }

        if (alerts.length === 0) {
            alerts.push({
                type: 'info',
                icon: '✅',
                text: `Budget on track: ₹${thisMonthTotal.toFixed(2)} spent (${percentageUsed.toFixed(1)}% of budget)`
            });
        }

        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="budget-alert ${alert.type}">
                <span class="budget-alert-icon">${alert.icon}</span>
                <span class="budget-alert-text">${alert.text}</span>
            </div>
        `).join('');
    }

    // Payment Method Tracking Feature
    setupPaymentTracking() {
        this.updatePaymentStats();
    }

    updatePaymentStats() {
        const statsContainer = document.getElementById('paymentStats');
        if (!statsContainer) return;

        const paymentStats = {};
        const paymentIcons = {
            'Cash': '💵',
            'Card': '💳',
            'UPI': '📱',
            'Net Banking': '🏦',
            'Wallet': '👛',
            'Other': '🔄'
        };

        this.bills.forEach(bill => {
            bill.products.forEach(product => {
                const method = product.paymentMethod || 'Other';
                if (!paymentStats[method]) {
                    paymentStats[method] = { count: 0, amount: 0 };
                }
                paymentStats[method].count++;
                paymentStats[method].amount += product.total;
            });
        });

        statsContainer.innerHTML = `
            <div class="payment-stats-grid">
                ${Object.entries(paymentStats).map(([method, stats]) => `
                    <div class="payment-stat-item">
                        <div class="payment-method-icon">${paymentIcons[method] || '💳'}</div>
                        <div class="payment-method-name">${method}</div>
                        <div class="payment-method-count">${stats.count} transactions</div>
                        <div class="payment-method-amount">₹${stats.amount.toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Offline Mode Feature
    setupOfflineMode() {
        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));
        
        // Initial status
        this.handleOnlineStatus(this.isOnline);
        
        // Load pending sync data
        this.loadPendingSync();
    }

    handleOnlineStatus(isOnline) {
        this.isOnline = isOnline;
        const offlineIndicator = document.getElementById('offlineIndicator');
        const syncStatus = document.getElementById('syncStatus');
        const offlineText = document.getElementById('offlineText');
        const syncText = document.getElementById('syncText');
        const syncIcon = syncStatus?.querySelector('.sync-icon');

        if (isOnline) {
            // Show online notification
            offlineIndicator?.classList.remove('show');
            offlineText.textContent = 'You\'re back online!';
            
            syncStatus?.classList.remove('offline', 'syncing');
            syncStatus?.classList.add('online');
            syncText.textContent = 'Online - Synced';
            if (syncIcon) syncIcon.textContent = '✓';
            
            // Sync pending data
            this.syncPendingData();
            
            this.showNotification('Back online! All data synced.', 'success');
        } else {
            // Show offline notification
            offlineIndicator?.classList.add('show');
            offlineIndicator?.classList.remove('online');
            offlineText.textContent = 'You\'re offline. Some features may be limited.';
            
            syncStatus?.classList.remove('online', 'syncing');
            syncStatus?.classList.add('offline');
            syncText.textContent = 'Offline - Local Mode';
            if (syncIcon) syncIcon.textContent = '⚠️';
            
            this.showNotification('You\'re now offline. Working in local mode.', 'warning');
        }
    }

    saveBillOffline(bill) {
        if (!this.isOnline) {
            this.pendingSync.push({
                type: 'bill',
                data: bill,
                timestamp: Date.now()
            });
            this.savePendingSync();
        }
    }

    savePendingSync() {
        localStorage.setItem('pendingSync', JSON.stringify(this.pendingSync));
    }

    loadPendingSync() {
        const pending = localStorage.getItem('pendingSync');
        if (pending) {
            this.pendingSync = JSON.parse(pending);
        }
    }

    syncPendingData() {
        if (this.pendingSync.length === 0 || !this.isOnline) return;

        const syncStatus = document.getElementById('syncStatus');
        const syncText = document.getElementById('syncText');
        const syncIcon = syncStatus?.querySelector('.sync-icon');

        // Show syncing status
        syncStatus?.classList.remove('offline', 'online');
        syncStatus?.classList.add('syncing');
        syncText.textContent = 'Syncing...';
        if (syncIcon) syncIcon.textContent = '🔄';

        // Simulate sync process (in real app, this would be API calls)
        setTimeout(() => {
            this.pendingSync = [];
            this.savePendingSync();
            
            syncStatus?.classList.remove('syncing', 'offline');
            syncStatus?.classList.add('online');
            syncText.textContent = 'Online - Synced';
            if (syncIcon) syncIcon.textContent = '✓';
            
            this.showNotification('All pending data synced successfully!', 'success');
        }, 2000);
    }

    // Override generateBill to include payment method tracking and offline support
    generateBill() {
        if (this.products.length === 0) {
            this.showNotification('Please add at least one product', 'error');
            return;
        }

        const bill = {
            id: Date.now(),
            date: new Date().toISOString(),
            products: [...this.products],
            total: this.products.reduce((sum, product) => sum + product.total, 0)
        };

        this.bills.push(bill);
        localStorage.setItem('bills', JSON.stringify(this.bills));
        
        // Save for offline sync
        this.saveBillOffline(bill);
        
        this.products = [];
        this.renderProducts();
        this.updateTotal();
        
        this.showNotification('Bill generated successfully!', 'success');
        this.switchTab('bill-history');
        this.updateDashboard();
        this.updateBudgetAlerts();
        this.updatePaymentStats();
    }

    // PIN Lock Feature
    setupPinLock() {
        // Update PIN toggle button state
        this.updatePinToggleButton();
        
        // Setup PIN modal event listeners
        this.setupPinModalListeners();
        
        // Check if app should be locked
        if (this.pinEnabled && this.savedPin) {
            this.lockApp();
        }
    }

    setupPinModalListeners() {
        // PIN entry modal
        document.getElementById('pinModalClose')?.addEventListener('click', () => this.hidePinModal());
        document.getElementById('pinClear')?.addEventListener('click', () => this.clearPinEntry());
        document.getElementById('pinDelete')?.addEventListener('click', () => this.deleteLastPinDigit());
        
        // PIN setup modal
        document.getElementById('pinSetupClose')?.addEventListener('click', () => this.hidePinSetupModal());
        document.getElementById('pinSetupClear')?.addEventListener('click', () => this.clearPinSetup());
        document.getElementById('pinSetupDelete')?.addEventListener('click', () => this.deleteLastSetupPinDigit());
        
        // PIN keypad buttons
        document.querySelectorAll('.pin-key[data-digit]').forEach(key => {
            key.addEventListener('click', (e) => {
                const digit = e.target.dataset.digit;
                const modal = e.target.closest('.pin-modal');
                
                if (modal.id === 'pinModal') {
                    this.addPinDigit(digit);
                } else if (modal.id === 'pinSetupModal') {
                    this.addSetupPinDigit(digit);
                }
            });
        });
        
        // Close modals on background click
        document.getElementById('pinModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'pinModal') {
                this.hidePinModal();
            }
        });
        
        document.getElementById('pinSetupModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'pinSetupModal') {
                this.hidePinSetupModal();
            }
        });
    }

    togglePinLock() {
        if (!this.pinEnabled) {
            // Enable PIN - show setup modal
            this.showPinSetupModal();
        } else {
            // Disable PIN - require confirmation
            if (confirm('Are you sure you want to disable PIN lock?')) {
                this.disablePinLock();
            }
        }
    }

    showPinSetupModal() {
        this.setupPin = '';
        this.updatePinSetupDisplay();
        document.getElementById('pinSetupMessage').textContent = 'Set your 4-digit PIN';
        document.getElementById('pinSetupMessage').className = 'pin-message';
        document.getElementById('pinSetupModal').classList.add('show');
    }

    hidePinSetupModal() {
        document.getElementById('pinSetupModal').classList.remove('show');
        this.setupPin = '';
    }

    showPinModal() {
        this.currentPin = '';
        this.updatePinDisplay();
        document.getElementById('pinMessage').textContent = 'Enter your 4-digit PIN';
        document.getElementById('pinMessage').className = 'pin-message';
        document.getElementById('pinModal').classList.add('show');
    }

    hidePinModal() {
        document.getElementById('pinModal').classList.remove('show');
        this.currentPin = '';
    }

    addSetupPinDigit(digit) {
        if (this.setupPin.length < 4) {
            this.setupPin += digit;
            this.updatePinSetupDisplay();
            
            if (this.setupPin.length === 4) {
                // PIN complete - save it
                this.savePin(this.setupPin);
            }
        }
    }

    addPinDigit(digit) {
        if (this.currentPin.length < 4) {
            this.currentPin += digit;
            this.updatePinDisplay();
            
            if (this.currentPin.length === 4) {
                // PIN complete - verify it
                this.verifyPin(this.currentPin);
            }
        }
    }

    clearPinSetup() {
        this.setupPin = '';
        this.updatePinSetupDisplay();
    }

    clearPinEntry() {
        this.currentPin = '';
        this.updatePinDisplay();
    }

    deleteLastSetupPinDigit() {
        if (this.setupPin.length > 0) {
            this.setupPin = this.setupPin.slice(0, -1);
            this.updatePinSetupDisplay();
        }
    }

    deleteLastPinDigit() {
        if (this.currentPin.length > 0) {
            this.currentPin = this.currentPin.slice(0, -1);
            this.updatePinDisplay();
        }
    }

    updatePinSetupDisplay() {
        const digits = document.querySelectorAll('#pinSetupDisplay .pin-digit');
        digits.forEach((digit, index) => {
            if (index < this.setupPin.length) {
                digit.classList.add('filled');
                digit.textContent = this.setupPin[index];
            } else {
                digit.classList.remove('filled');
                digit.textContent = '●';
            }
        });
    }

    updatePinDisplay() {
        const digits = document.querySelectorAll('#pinDisplay .pin-digit');
        digits.forEach((digit, index) => {
            if (index < this.currentPin.length) {
                digit.classList.add('filled');
                digit.textContent = this.currentPin[index];
            } else {
                digit.classList.remove('filled');
                digit.textContent = '●';
            }
        });
    }

    savePin(pin) {
        this.savedPin = pin;
        this.pinEnabled = true;
        localStorage.setItem('savedPin', pin);
        localStorage.setItem('pinEnabled', 'true');
        
        this.updatePinToggleButton();
        this.hidePinSetupModal();
        this.showNotification('PIN lock enabled successfully!', 'success');
    }

    disablePinLock() {
        this.pinEnabled = false;
        this.savedPin = '';
        localStorage.setItem('pinEnabled', 'false');
        localStorage.removeItem('savedPin');
        
        this.updatePinToggleButton();
        this.unlockApp();
        this.showNotification('PIN lock disabled', 'info');
    }

    verifyPin(pin) {
        if (pin === this.savedPin) {
            // Correct PIN
            document.getElementById('pinMessage').textContent = 'PIN correct!';
            document.getElementById('pinMessage').className = 'pin-message success';
            
            setTimeout(() => {
                this.hidePinModal();
                this.unlockApp();
            }, 500);
        } else {
            // Wrong PIN
            document.getElementById('pinMessage').textContent = 'Wrong PIN. Try again.';
            document.getElementById('pinMessage').className = 'pin-message error';
            
            setTimeout(() => {
                this.currentPin = '';
                this.updatePinDisplay();
                document.getElementById('pinMessage').textContent = 'Enter your 4-digit PIN';
                document.getElementById('pinMessage').className = 'pin-message';
            }, 1500);
        }
    }

    lockApp() {
        this.isLocked = true;
        document.getElementById('appLockOverlay').classList.remove('hidden');
        document.getElementById('app').style.opacity = '0.1';
        document.getElementById('app').style.pointerEvents = 'none';
    }

    unlockApp() {
        this.isLocked = false;
        document.getElementById('appLockOverlay').classList.add('hidden');
        document.getElementById('app').style.opacity = '1';
        document.getElementById('app').style.pointerEvents = 'auto';
    }

    updatePinToggleButton() {
        const pinButton = document.getElementById('pinToggle');
        const pinIcon = pinButton?.querySelector('.pin-icon');
        
        if (this.pinEnabled) {
            pinButton?.classList.add('active');
            if (pinIcon) pinIcon.textContent = '🔒';
        } else {
            pinButton?.classList.remove('active');
            if (pinIcon) pinIcon.textContent = '🔓';
        }
    }

    switchTab(tabName) {
        if (this.isLocked) {
            this.showPinModal();
            return;
        }
        
        // Ultra-fast tab switching with minimal DOM operations
        const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
        const selectedContent = document.getElementById(tabName);
        
        if (!selectedTab || !selectedContent) return;
        
        // Batch DOM updates for better performance
        requestAnimationFrame(() => {
            // Update tabs
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            selectedTab.classList.add('active');
            
            // Update content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });
            selectedContent.classList.add('active');
            selectedContent.style.display = 'block';
            selectedContent.style.visibility = 'visible';
            selectedContent.style.opacity = '1';
        });
        
        // Defer data loading to prevent blocking
        setTimeout(() => {
            if (tabName === 'bill-history') {
                this.loadBills();
            } else if (tabName === 'charts') {
                if (this.bills.length > 0) {
                    this.updateCharts();
                } else {
                    const chartsContainer = document.querySelector('.charts-container');
                    if (chartsContainer) {
                        chartsContainer.innerHTML = '<div class="empty-state"><h3>No data available</h3><p>Generate some bills first to see charts</p></div>';
                    }
                }
            } else if (tabName === 'dashboard') {
                this.updateDashboard();
            } else if (tabName === 'add-product') {
                this.renderProducts();
            }
        }, 0);
    }

    // Missing methods that are referenced in event listeners
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        console.log('Theme switched to:', this.currentTheme);
    }

    changeColorTheme(color) {
        this.colorTheme = color;
        document.documentElement.setAttribute('data-theme-color', color);
        localStorage.setItem('colorTheme', color);
        console.log('Color theme changed to:', color);
    }

    changeFontFamily(font) {
        this.fontFamily = font;
        document.documentElement.setAttribute('data-font', font);
        localStorage.setItem('fontFamily', font);
        console.log('Font family changed to:', font);
    }

    clearForm() {
        const form = document.getElementById('productForm');
        if (form) {
            form.reset();
            // Reset quantity to 1
            const quantityInput = document.getElementById('quantity');
            if (quantityInput) quantityInput.value = 1;
        }
        console.log('Form cleared');
    }

    startVoiceInput() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const productNameInput = document.getElementById('productName');
                if (productNameInput) {
                    productNameInput.value = transcript;
                }
                this.showNotification('Voice input captured: ' + transcript, 'success');
            };
            
            recognition.onerror = (event) => {
                this.showNotification('Voice input error: ' + event.error, 'error');
            };
            
            recognition.start();
            this.showNotification('Listening... Speak now', 'info');
        } else {
            this.showNotification('Voice input not supported in this browser', 'error');
        }
    }

    generateBill() {
        if (this.products.length === 0) {
            this.showNotification('Please add at least one product', 'error');
            return;
        }

        const bill = {
            id: Date.now(),
            date: new Date().toISOString(),
            products: [...this.products],
            total: this.products.reduce((sum, product) => sum + product.total, 0)
        };

        this.bills.push(bill);
        localStorage.setItem('bills', JSON.stringify(this.bills));
        
        this.products = [];
        this.renderProducts();
        this.updateTotal();
        
        this.showNotification('Bill generated successfully!', 'success');
        this.switchTab('bill-history');
        this.updateDashboard();
    }

    setBudget() {
        const budgetInput = document.getElementById('budgetInput');
        if (budgetInput) {
            const budget = parseFloat(budgetInput.value);
            if (!isNaN(budget) && budget > 0) {
                this.monthlyBudget = budget;
                localStorage.setItem('monthlyBudget', budget.toString());
                this.updateDashboard();
                this.showNotification('Budget set successfully!', 'success');
                budgetInput.value = '';
            } else {
                this.showNotification('Please enter a valid budget amount', 'error');
            }
        }
    }

    setupOfflineMode() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateSyncStatus();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateSyncStatus();
        });

        this.updateSyncStatus();
    }

    updateSyncStatus() {
        const syncStatus = document.getElementById('syncStatus');
        const syncText = document.getElementById('syncText');
        const offlineIndicator = document.getElementById('offlineIndicator');

        if (this.isOnline) {
            syncStatus?.classList.add('online');
            syncStatus?.classList.remove('offline');
            if (syncText) syncText.textContent = 'Online - Synced';
            if (offlineIndicator) offlineIndicator.style.display = 'none';
        } else {
            syncStatus?.classList.remove('online');
            syncStatus?.classList.add('offline');
            if (syncText) syncText.textContent = 'Offline - Some features limited';
            if (offlineIndicator) offlineIndicator.style.display = 'block';
        }
    }

    setupBudgetAlerts() {
        // Budget alerts will be checked in updateDashboard
    }

    setupPaymentTracking() {
        // Payment tracking setup
    }

    loadFromStorage() {
        // Load data from localStorage
        const savedBills = localStorage.getItem('bills');
        if (savedBills) {
            this.bills = JSON.parse(savedBills);
        }

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
            document.documentElement.setAttribute('data-theme', this.currentTheme);
        }

        const savedColorTheme = localStorage.getItem('colorTheme');
        if (savedColorTheme) {
            this.colorTheme = savedColorTheme;
            document.documentElement.setAttribute('data-theme-color', this.colorTheme);
        }

        const savedFontFamily = localStorage.getItem('fontFamily');
        if (savedFontFamily) {
            this.fontFamily = savedFontFamily;
            document.documentElement.setAttribute('data-font', this.fontFamily);
        }

        const savedBudget = localStorage.getItem('monthlyBudget');
        if (savedBudget) {
            this.monthlyBudget = parseFloat(savedBudget);
        }
    }

    initializeCharts() {
        // Charts will be initialized when needed
    }

    addAnimations() {
        // Add animations to elements
    }

    removeProduct(productId) {
        this.products = this.products.filter(p => p.id !== productId);
        this.renderProducts();
        this.updateTotal();
        this.showNotification('Product removed', 'info');
    }

    updateTotal() {
        const total = this.products.reduce((sum, product) => sum + product.total, 0);
        const totalElement = document.getElementById('totalAmount');
        if (totalElement) {
            totalElement.textContent = total.toFixed(2);
        }
    }

    viewBill(billId) {
        const bill = this.bills.find(b => b.id === billId);
        if (!bill) {
            this.showNotification('Bill not found', 'error');
            return;
        }

        // Store the bill data in localStorage for the invoice page
        localStorage.setItem('currentBill', JSON.stringify(bill));
        
        // Redirect to invoice page
        window.location.href = 'invoice.html';
    }

    printBill(billId) {
        const bill = this.bills.find(b => b.id === billId);
        if (bill) {
            window.print();
            this.showNotification('Print dialog opened', 'success');
        }
    }

    deleteBill(billId) {
        if (confirm('Are you sure you want to delete this bill?')) {
            this.bills = this.bills.filter(b => b.id !== billId);
            localStorage.setItem('bills', JSON.stringify(this.bills));
            this.loadBills();
            this.updateDashboard();
            this.showNotification('Bill deleted successfully', 'success');
        }
    }

    addProduct() {
        if (this.isLocked) {
            this.showPinModal();
            return;
        }
        
        // Instant product addition - no delays
        const productName = document.getElementById('productName').value.trim();
        const price = parseFloat(document.getElementById('price').value);
        const quantity = parseInt(document.getElementById('quantity').value);
        const category = document.getElementById('category').value;
        const paymentMethod = document.getElementById('paymentMethod').value;

        if (!productName || !price || !quantity) {
            this.showNotification('Please fill all fields correctly', 'error');
            return;
        }

        const product = {
            id: Date.now(),
            name: productName,
            price: price,
            quantity: quantity,
            category: category,
            paymentMethod: paymentMethod,
            total: price * quantity
        };

        this.products.push(product);
        
        // Instant UI updates - no requestAnimationFrame or setTimeout
        this.renderProducts();
        this.updateTotal();
        this.clearForm();
        this.showNotification('Product added successfully', 'success');
        
        // Instant animation - minimal delay
        const newProduct = document.querySelector('.product-item:last-child');
        if (newProduct) {
            newProduct.classList.add('animate-in-right');
        }
    }
}

// Initialize the app - Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing app...');
    window.billRecorder = new BillRecorder();
});

// Backup initialization in case DOM is already loaded
if (document.readyState !== 'loading') {
    console.log('DOM already loaded - Initializing app...');
    window.billRecorder = new BillRecorder();
}
