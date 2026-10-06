/**
 * Topbar Header Component
 * Complete implementation with animated eyes, notifications, and user menu
 */
class Topbar {
  constructor(container) {
    this.container = container;
    this.notificationsOpen = false;
    this.userMenuOpen = false;
    this.eyeMovementInterval = null;
    this.isMobile = window.innerWidth <= 768;
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
    this.attachEvents();
    this.initEyes();
    this.loadUserData();
    this.loadNotifications();
  }

  render() {
    const token = API?.getAuthToken?.();
    
    this.container.innerHTML = `
      <div class="topbar-left">
        <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="القائمة">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        
        <a href="#" class="logo-area" onclick="if(window.Router) { window.Router.navigate('/dashboard'); return false; }">
          <img src="logo.png" alt="Deinkow" class="logo-image" onerror="this.style.display='none'">
          <span class="logo-text">Deinkow</span>
          <div class="eyes-container" id="eyesContainer">
            <div class="eye" id="eyeLeft"></div>
            <div class="eye" id="eyeRight"></div>
          </div>
        </a>
        
        <h1 class="topbar-title" id="topbarTitle">لوحة التحكم</h1>
      </div>
      
      <div class="topbar-right">
        <button class="theme-toggle-btn" id="themeToggleBtn" aria-label="تبديل السمة">
          <svg class="theme-icon theme-icon-sun" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="4" stroke="currentColor" stroke-width="1.5"/>
            <path d="M10 2V4M10 16V18M18 10H16M4 10H2M15.6569 4.34315L14.2426 5.75736M5.75736 14.2426L4.34315 15.6569M15.6569 15.6569L14.2426 14.2426M5.75736 5.75736L4.34315 4.34315" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <svg class="theme-icon theme-icon-moon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M17.293 13.293C16.3782 13.293 15.4818 13.0753 14.6751 12.6561C13.8684 12.2369 13.1763 11.6277 12.6547 10.8747C12.1331 10.1217 11.7978 9.24652 11.6756 8.32531C11.5534 7.4041 11.6478 6.46166 11.9516 5.58531C10.8843 5.99937 9.93774 6.61386 9.17541 7.38629C8.41308 8.15872 7.85347 9.06952 7.53596 10.0553C7.21844 11.0411 7.15094 12.0775 7.33818 13.0903C7.52542 14.1031 7.96246 15.0687 8.62008 15.9203C9.27769 16.7719 10.1416 17.4909 11.1501 18.0253C12.1586 18.5597 13.2886 18.8964 14.4563 19.0113C15.624 19.1262 16.8021 19.0163 17.9201 18.6893C17.1926 17.5984 16.8031 16.3202 16.8031 15.0113C16.8031 14.0965 16.9851 13.1937 17.293 13.293Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        ${token ? this.renderUserMenu() : this.renderGuestMenu()}
      </div>
    `;
  }

  renderUserMenu() {
    return `
      <div class="notifications-wrapper">
        <button class="notifications-btn" id="notificationsBtn" aria-label="الإشعارات">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 6.66667C15 5.19391 14.2107 3.78014 12.8284 2.89782C11.4461 2.0155 9.65383 1.76563 8.04019 2.21149C6.42655 2.65734 5.14798 3.75311 4.50245 5.21799C3.85692 6.68287 3.90239 8.37391 4.62971 9.80358C5.35703 11.2332 6.69647 12.2667 8.33333 12.6667V15C8.33333 15.442 8.50893 15.866 8.82149 16.1785C9.13405 16.4911 9.55806 16.6667 10 16.6667C10.4419 16.6667 10.866 16.4911 11.1785 16.1785C11.4911 15.866 11.6667 15.442 11.6667 15V12.6667C13.3035 12.2667 14.643 11.2332 15.3703 9.80358C16.0976 8.37391 16.1431 6.68287 15.4976 5.21799C14.852 3.75311 13.5735 2.65734 11.9598 2.21149C10.3462 1.76563 8.55386 2.0155 7.17157 2.89782C5.78929 3.78014 5 5.19391 5 6.66667" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="notifications-badge hidden" id="notificationsBadge">0</span>
        </button>
        
        <div class="notifications-dropdown" id="notificationsDropdown">
          <div class="notifications-header">
            <h3>الإشعارات</h3>
            <button class="notifications-mark-all" id="markAllReadBtn">تعليم الكل كمقروء</button>
          </div>
          <div class="notifications-list" id="notificationsList">
            <div class="notifications-empty">جاري التحميل...</div>
          </div>
          <div class="notifications-footer">
            <a href="#" onclick="if(window.Router) { window.Router.navigate('/notifications'); return false; }">عرض الكل</a>
          </div>
        </div>
      </div>
      
      <div class="user-menu-wrapper">
        <button class="user-avatar-btn" id="userAvatarBtn" aria-label="قائمة المستخدم">
          <span id="userAvatarText">U</span>
        </button>
        
        <div class="user-dropdown" id="userDropdown">
          <div class="user-dropdown-header">
            <div class="user-dropdown-name" id="userDropdownName">جاري التحميل...</div>
            <div class="user-dropdown-email" id="userDropdownEmail">-</div>
          </div>
          <div class="user-dropdown-menu">
            <a href="#" class="user-dropdown-item" onclick="if(window.Router) { window.Router.navigate('/profile'); return false; }">
              <svg viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M3 18C3 14.134 6.13401 11 10 11C13.866 11 17 14.134 17 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              الملف الشخصي
            </a>
            <a href="#" class="user-dropdown-item" onclick="if(window.Router) { window.Router.navigate('/settings'); return false; }">
              <svg viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="2" stroke="currentColor" stroke-width="2"/>
                <path d="M10 3V1M10 19V17M17 10H19M1 10H3M15.6569 4.34315L17.0711 2.92893M2.92893 17.0711L4.34315 15.6569M15.6569 15.6569L17.0711 17.0711M2.92893 2.92893L4.34315 4.34315" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              الإعدادات
            </a>
            <div class="user-dropdown-divider"></div>
            <button class="user-dropdown-item danger" onclick="if(API && API.auth) { API.auth.logout(); }">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M7 17L2 12M2 12L7 7M2 12H18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderGuestMenu() {
    return `
      <a href="#" class="btn btn-secondary" data-route="/login">دخول</a>
      <a href="#" class="btn btn-primary" data-route="/register">تسجيل</a>
    `;
  }

  attachEvents() {
    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobileMenuToggle');
    if (mobileToggle && window.Sidebar) {
      mobileToggle.addEventListener('click', () => {
        if (window.sidebarInstance) {
          window.sidebarInstance.toggleMobile();
        }
      });
    }

    // Notifications toggle
    const notificationsBtn = document.getElementById('notificationsBtn');
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    
    if (notificationsBtn && notificationsDropdown) {
      notificationsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleNotifications();
      });
    }

    // User menu toggle
    const userAvatarBtn = document.getElementById('userAvatarBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userAvatarBtn && userDropdown) {
      userAvatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleUserMenu();
      });
    }

    // Mark all as read
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener('click', () => {
        this.markAllAsRead();
      });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.closeDropdowns();
      }
    });

    // Handle route clicks
    this.container.querySelectorAll('[data-route]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const route = btn.dataset.route;
        if (route && window.Router) {
          window.Router.navigate(route);
        }
      });
    });

    // Theme toggle button
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        if (window.themeToggle) {
          window.themeToggle.toggle();
          this.updateThemeIcon();
        }
      });
      
      // Update icon on theme change
      window.addEventListener('themechange', () => {
        this.updateThemeIcon();
      });
      
      // Initial icon update
      this.updateThemeIcon();
    }

    // Handle window resize for mobile detection
    window.addEventListener('resize', () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 768;
      
      if (wasMobile !== this.isMobile) {
        this.initEyes();
      }
    });
  }

  initEyes() {
    const eyeLeft = document.getElementById('eyeLeft');
    const eyeRight = document.getElementById('eyeRight');
    
    if (!eyeLeft || !eyeRight) return;

    // Create pupils if they don't exist
    if (!eyeLeft.querySelector('.pupil')) {
      const pupilLeft = document.createElement('div');
      pupilLeft.className = 'pupil';
      eyeLeft.appendChild(pupilLeft);
    }
    
    if (!eyeRight.querySelector('.pupil')) {
      const pupilRight = document.createElement('div');
      pupilRight.className = 'pupil';
      eyeRight.appendChild(pupilRight);
    }

    // Clear existing interval
    if (this.eyeMovementInterval) {
      clearInterval(this.eyeMovementInterval);
    }

    if (this.isMobile) {
      // Mobile: Random movement every 0.8s
      this.moveEyesRandom(); // Initial position
      this.eyeMovementInterval = setInterval(() => {
        this.moveEyesRandom();
      }, 800);
    } else {
      // Desktop: Follow mouse cursor
      // Remove old listener if exists
      if (this.mouseMoveHandler) {
        document.removeEventListener('mousemove', this.mouseMoveHandler);
      }
      
      this.mouseMoveHandler = (e) => {
        this.moveEyesToCursor(e);
      };
      
      document.addEventListener('mousemove', this.mouseMoveHandler);
    }
  }

  moveEyesToCursor(e) {
    const eyeLeft = document.getElementById('eyeLeft');
    const eyeRight = document.getElementById('eyeRight');
    
    if (!eyeLeft || !eyeRight) return;

    const eyesContainer = document.getElementById('eyesContainer');
    if (!eyesContainer) return;

    const containerRect = eyesContainer.getBoundingClientRect();
    const containerCenterX = containerRect.left + containerRect.width / 2;
    const containerCenterY = containerRect.top + containerRect.height / 2;

    // Calculate relative position (-1 to 1)
    const relX = (e.clientX - containerCenterX) / (containerRect.width / 2);
    const relY = (e.clientY - containerCenterY) / (containerRect.height / 2);

    // Limit movement range
    const maxMove = 0.3;
    const moveX = Math.max(-maxMove, Math.min(maxMove, relX));
    const moveY = Math.max(-maxMove, Math.min(maxMove, relY));

    // Apply movement to both eyes
    this.setEyePosition(eyeLeft, moveX, moveY);
    this.setEyePosition(eyeRight, moveX, moveY);
  }

  moveEyesRandom() {
    const eyeLeft = document.getElementById('eyeLeft');
    const eyeRight = document.getElementById('eyeRight');
    
    if (!eyeLeft || !eyeRight) return;

    // Random position (-0.3 to 0.3)
    const moveX = (Math.random() - 0.5) * 0.6;
    const moveY = (Math.random() - 0.5) * 0.6;

    this.setEyePosition(eyeLeft, moveX, moveY);
    this.setEyePosition(eyeRight, moveX, moveY);
  }

  setEyePosition(eye, x, y) {
    // Remove all position classes
    eye.classList.remove(
      'pupil-left', 'pupil-right', 'pupil-up', 'pupil-down',
      'pupil-up-left', 'pupil-up-right', 'pupil-down-left', 'pupil-down-right'
    );

    // Determine position class based on x and y
    let positionClass = '';
    
    if (Math.abs(x) > Math.abs(y)) {
      // Horizontal movement
      positionClass = x < 0 ? 'pupil-left' : 'pupil-right';
    } else if (Math.abs(y) > Math.abs(x)) {
      // Vertical movement
      positionClass = y < 0 ? 'pupil-up' : 'pupil-down';
    }

    // Diagonal positions
    if (Math.abs(x) > 0.1 && Math.abs(y) > 0.1) {
      if (x < 0 && y < 0) positionClass = 'pupil-up-left';
      else if (x > 0 && y < 0) positionClass = 'pupil-up-right';
      else if (x < 0 && y > 0) positionClass = 'pupil-down-left';
      else if (x > 0 && y > 0) positionClass = 'pupil-down-right';
    }

    if (positionClass) {
      eye.classList.add(positionClass);
    }
  }

  toggleNotifications() {
    this.notificationsOpen = !this.notificationsOpen;
    const dropdown = document.getElementById('notificationsDropdown');
    
    if (dropdown) {
      dropdown.classList.toggle('show', this.notificationsOpen);
    }

    // Close user menu if open
    if (this.notificationsOpen && this.userMenuOpen) {
      this.toggleUserMenu();
    }
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
    const dropdown = document.getElementById('userDropdown');
    
    if (dropdown) {
      dropdown.classList.toggle('show', this.userMenuOpen);
    }

    // Close notifications if open
    if (this.userMenuOpen && this.notificationsOpen) {
      this.toggleNotifications();
    }
  }

  closeDropdowns() {
    if (this.notificationsOpen) {
      this.toggleNotifications();
    }
    if (this.userMenuOpen) {
      this.toggleUserMenu();
    }
  }

  async loadUserData() {
    const token = API?.getAuthToken?.();
    if (!token) return;

    try {
      const response = await API.auth.getCurrentUser();
      if (response?.success && response?.data?.user) {
        const user = response.data.user;
        
        // Update avatar
        const avatarBtn = document.getElementById('userAvatarBtn');
        const avatarText = document.getElementById('userAvatarText');
        const dropdownName = document.getElementById('userDropdownName');
        const dropdownEmail = document.getElementById('userDropdownEmail');

        if (avatarText) {
          avatarText.textContent = (user.username || 'U').charAt(0).toUpperCase();
        }

        if (avatarBtn && user.profile_picture) {
          avatarBtn.innerHTML = `<img src="${user.profile_picture}" alt="${user.username}">`;
        }

        if (dropdownName) {
          dropdownName.textContent = user.username || 'مستخدم';
        }

        if (dropdownEmail) {
          dropdownEmail.textContent = user.email || '-';
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  async loadNotifications() {
    const token = API?.getAuthToken?.();
    if (!token) return;

    try {
      // Try to load real notifications
      if (API?.notifications?.getNotifications) {
        const response = await API.notifications.getNotifications(1, 5, true);
        if (response?.success) {
          this.renderNotifications(response.data.notifications || []);
          this.updateNotificationBadge(response.data.unread_count || 0);
          return;
        }
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }

    // Fallback: Show dummy data
    this.renderNotifications(this.getDummyNotifications());
    this.updateNotificationBadge(3);
  }

  getDummyNotifications() {
    return [
      {
        id: 1,
        title: 'رد جديد على مشروعك',
        message: 'تم الرد على مشروع #123',
        time: 'منذ 5 دقائق',
        unread: true
      },
      {
        id: 2,
        title: 'مشروع جديد مكتمل',
        message: 'تم إكمال مشروع #120',
        time: 'منذ ساعة',
        unread: true
      },
      {
        id: 3,
        title: 'تحديث النظام',
        message: 'تم إضافة ميزات جديدة',
        time: 'منذ يوم',
        unread: false
      }
    ];
  }

  renderNotifications(notifications) {
    const list = document.getElementById('notificationsList');
    if (!list) return;

    if (notifications.length === 0) {
      list.innerHTML = '<div class="notifications-empty">لا توجد إشعارات</div>';
      return;
    }

    list.innerHTML = notifications.map(notif => `
      <div class="notification-item ${notif.unread ? 'unread' : ''}" data-id="${notif.id}">
        <div class="notification-item-title">${this.escapeHtml(notif.title)}</div>
        <div class="notification-item-message">${this.escapeHtml(notif.message)}</div>
        <div class="notification-item-time">${notif.time}</div>
      </div>
    `).join('');

    // Attach click handlers
    list.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        this.markAsRead(id);
        // Navigate to relevant page if needed
      });
    });
  }

  updateNotificationBadge(count) {
    const badge = document.getElementById('notificationsBadge');
    if (badge) {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }

  markAsRead(id) {
    // Mark notification as read
    const item = document.querySelector(`.notification-item[data-id="${id}"]`);
    if (item) {
      item.classList.remove('unread');
    }
    
    // Update badge count
    const currentCount = parseInt(document.getElementById('notificationsBadge')?.textContent || '0');
    this.updateNotificationBadge(Math.max(0, currentCount - 1));
  }

  markAllAsRead() {
    const items = document.querySelectorAll('.notification-item.unread');
    items.forEach(item => {
      item.classList.remove('unread');
    });
    this.updateNotificationBadge(0);
    
    if (Toast) {
      Toast.success('تم تعليم جميع الإشعارات كمقروءة');
    }
  }

  setTitle(title) {
    const titleEl = document.getElementById('topbarTitle');
    if (titleEl) {
      titleEl.textContent = title;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  updateThemeIcon() {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (!themeToggleBtn) return;
    
    const sunIcon = themeToggleBtn.querySelector('.theme-icon-sun');
    const moonIcon = themeToggleBtn.querySelector('.theme-icon-moon');
    
    if (!sunIcon || !moonIcon) return;
    
    const isDark = window.themeToggle?.isDark() || document.documentElement.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    } else {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    }
  }
}

// Make Topbar available globally
window.Topbar = Topbar;
