/**
 * Sidebar Navigation Component
 */
class Sidebar {
  constructor(container) {
    this.container = container;
    this.isCollapsed = false;
    this.isMobileOpen = false;
    this.init();
  }

  init() {
    if (!this.container) return;
    
    this.render();
    this.attachEvents();
    this.loadNavigation();
  }

  render() {
    this.container.innerHTML = `
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <img src="logo.png" alt="Deinkow" onerror="this.style.display='none'">
          <span class="sidebar-logo-text">Deinkow</span>
        </div>
        <button class="sidebar-toggle" aria-label="طي القائمة">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <nav class="sidebar-nav" id="sidebarNav"></nav>
      <div class="sidebar-footer">
        <div class="nav-item">
          <div class="nav-item-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" fill="currentColor"/>
              <path d="M10 12C5.58172 12 2 13.7909 2 16V20H18V16C18 13.7909 14.4183 12 10 12Z" fill="currentColor"/>
            </svg>
          </div>
          <span class="nav-item-text" id="userNameNav">جاري التحميل...</span>
        </div>
      </div>
    `;
  }

  loadNavigation() {
    const nav = document.getElementById('sidebarNav');
    if (!nav) return;

    const token = API?.getAuthToken?.();
    const isAdmin = false; // Will be updated from user data

    const navItems = [
      {
        section: 'الرئيسية',
        items: [
          { id: 'dashboard', label: 'لوحة التحكم', icon: 'dashboard', route: '/dashboard' },
          { id: 'projects', label: 'مشاريعي', icon: 'folder', route: '/projects' },
          { id: 'request', label: 'طلب مشروع', icon: 'plus', route: '/request-project' }
        ]
      },
      {
        section: 'إدارة',
        items: [
          { id: 'profile', label: 'الملف الشخصي', icon: 'user', route: '/profile' },
          { id: 'support', label: 'الدعم الفني', icon: 'help', route: '/support' }
        ]
      }
    ];

    if (isAdmin) {
      navItems.push({
        section: 'الإدارة',
        items: [
          { id: 'admin', label: 'لوحة الإدارة', icon: 'settings', route: '/admin' }
        ]
      });
    }

    nav.innerHTML = navItems.map(section => `
      <div class="nav-section">
        <div class="nav-section-title">${section.section}</div>
        ${section.items.map(item => `
          <a href="#" class="nav-item" data-route="${item.route}" data-id="${item.id}">
            <div class="nav-item-icon">
              ${this.getIcon(item.icon)}
            </div>
            <span class="nav-item-text">${item.label}</span>
          </a>
        `).join('')}
      </div>
    `).join('');

    // Load user name
    if (token && API?.auth?.getCurrentUser) {
      API.auth.getCurrentUser().then(response => {
        if (response?.success && response?.data?.user) {
          const userNameEl = document.getElementById('userNameNav');
          if (userNameEl) {
            userNameEl.textContent = response.data.user.username || 'مستخدم';
          }
        }
      }).catch(() => {
        const userNameEl = document.getElementById('userNameNav');
        if (userNameEl) {
          userNameEl.textContent = 'مستخدم';
        }
      });
    }

    // Attach click events
    nav.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const route = item.dataset.route;
        if (route && window.Router) {
          window.Router.navigate(route);
        }
      });
    });

    // Set active item
    this.setActiveItem();
  }

  getIcon(type) {
    const icons = {
      dashboard: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/><rect x="11" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="2"/><rect x="3" y="12" width="6" height="5" rx="1" stroke="currentColor" stroke-width="2"/><rect x="11" y="10" width="6" height="7" rx="1" stroke="currentColor" stroke-width="2"/></svg>',
      folder: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5C3 3.89543 3.89543 3 5 3H8.58579C8.851 3 9.10536 3.10536 9.29289 3.29289L11.7071 5.70711C11.8946 5.89464 12.149 6 12.4142 6H15C16.1046 6 17 6.89543 17 8V15C17 16.1046 16.1046 17 15 17H5C3.89543 17 3 16.1046 3 15V5Z" stroke="currentColor" stroke-width="2"/></svg>',
      plus: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3V17M3 10H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
      user: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="4" stroke="currentColor" stroke-width="2"/><path d="M3 18C3 14.134 6.13401 11 10 11C13.866 11 17 14.134 17 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
      help: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/><path d="M10 7C9.44772 7 9 7.44772 9 8C9 8.55228 9.44772 9 10 9C10.5523 9 11 8.55228 11 8C11 7.44772 10.5523 7 10 7Z" fill="currentColor"/><path d="M10 12V11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
      settings: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="2" stroke="currentColor" stroke-width="2"/><path d="M10 3V1M10 19V17M17 10H19M1 10H3M15.6569 4.34315L17.0711 2.92893M2.92893 17.0711L4.34315 15.6569M15.6569 15.6569L17.0711 17.0711M2.92893 2.92893L4.34315 4.34315" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
    };
    return icons[type] || icons.dashboard;
  }

  setActiveItem() {
    if (!window.Router) return;
    const currentRoute = window.Router.getCurrentRoute();
    
    this.container.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.route === currentRoute) {
        item.classList.add('active');
      }
    });
  }

  attachEvents() {
    const toggleBtn = this.container.querySelector('.sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
    }
  }

  toggle() {
    if (window.innerWidth <= 1024) {
      this.toggleMobile();
    } else {
      this.toggleCollapse();
    }
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.container.classList.toggle('collapsed', this.isCollapsed);
    localStorage.setItem('sidebarCollapsed', this.isCollapsed);
  }

  toggleMobile() {
    this.isMobileOpen = !this.isMobileOpen;
    this.container.classList.toggle('mobile-open', this.isMobileOpen);
    
    if (this.isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobile() {
    if (this.isMobileOpen) {
      this.toggleMobile();
    }
  }
}

// Make Sidebar available globally
window.Sidebar = Sidebar;
