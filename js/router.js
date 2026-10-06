/**
 * Simple SPA Router
 * Handles client-side routing without page reloads
 */
class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = '/';
    this.contentArea = null;
    this.init();
  }

  init() {
    this.contentArea = document.getElementById('contentArea');
    if (!this.contentArea) {
      console.error('Content area not found');
      return;
    }

    // Listen to popstate (browser back/forward)
    window.addEventListener('popstate', (e) => {
      this.loadRoute(e.state?.route || this.normalizeRoute(window.location.pathname), false);
    });

    // Handle initial route
    this.handleInitialRoute();
  }

  handleInitialRoute() {
    const path = window.location.pathname;
    const route = this.normalizeRoute(path);
    this.loadRoute(route, false);
  }

  normalizeRoute(path) {
    // Remove leading/trailing slashes and normalize
    let route = path.replace(/^\/+|\/+$/g, '').replace(/\.html$/, '').toLowerCase();
    if (!route || ['app', 'index'].includes(route)) route = 'dashboard';
    return '/' + route;
  }

  register(route, handler) {
    this.routes[route] = handler;
  }

  navigate(route, pushState = true) {
    const normalizedRoute = this.normalizeRoute(route);
    
    if (pushState) {
      window.history.pushState({ route: normalizedRoute }, '', route);
    }
    
    this.loadRoute(normalizedRoute);
  }

  async loadRoute(route, animate = true) {
    // Close mobile sidebar if open
    if (window.sidebarInstance) {
      window.sidebarInstance.closeMobile();
    }

    // Update active nav item
    if (window.sidebarInstance) {
      window.sidebarInstance.setActiveItem();
    }

    // Update topbar title
    if (window.topbarInstance) {
      const title = this.getRouteTitle(route);
      window.topbarInstance.setTitle(title);
    }

    // Find route handler
    const handler = this.routes[route];
    
    if (!handler) {
      // Try to load as page file
      await this.loadPage(route, animate);
      return;
    }

    // Execute handler with smooth transitions
    try {
      // Fade out current content
      if (animate && this.contentArea) {
        this.contentArea.classList.add('transitioning', 'loading');
        const pageContainer = this.contentArea.querySelector('.page-container');
        if (pageContainer) {
          pageContainer.classList.add('fade-out');
        }
        
        // Wait for fade out
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      const content = await handler();
      
      // Update content
      if (typeof content === 'string') {
        this.contentArea.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        this.contentArea.innerHTML = '';
        this.contentArea.appendChild(content);
      }
      
      this.currentRoute = route;
      
      // Fade in new content
      if (animate && this.contentArea) {
        const pageContainer = this.contentArea.querySelector('.page-container');
        if (pageContainer) {
          pageContainer.classList.add('fade-in');
        }
        
        // Remove loading state
        setTimeout(() => {
          this.contentArea.classList.remove('transitioning', 'loading');
          if (pageContainer) {
            pageContainer.classList.remove('fade-out');
          }
        }, 100);
      }
    } catch (error) {
      console.error('Route loading error:', error);
      this.showError('حدث خطأ أثناء تحميل الصفحة');
      if (this.contentArea) {
        this.contentArea.classList.remove('transitioning', 'loading');
      }
    }
  }

  async loadPage(route, animate = true) {
    try {
      // Convert route to page file path
      let pagePath = route.replace(/^\//, '');
      if (!pagePath || pagePath === '/') {
        pagePath = 'dashboard';
      }
      
      // Try to load page component
      const pageModule = `js/pages/${pagePath}.js`;
      
      // For now, load HTML content
      // In production, you'd load JS modules that return HTML
      const response = await fetch(`pages/${pagePath}.html`);
      
      if (!response.ok) {
        throw new Error('Page not found');
      }
      
      const html = await response.text();
      
      if (animate) {
        this.contentArea.style.opacity = '0';
      }
      
      this.contentArea.innerHTML = html;
      this.currentRoute = route;
      
      // Execute any scripts in the loaded content
      this.executeScripts(this.contentArea);
      
      if (animate) {
        requestAnimationFrame(() => {
          this.contentArea.style.opacity = '1';
        });
      }
    } catch (error) {
      console.error('Page loading error:', error);
      this.showError('الصفحة غير موجودة');
    }
  }

  executeScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  getRouteTitle(route) {
    const titles = {
      '/dashboard': 'لوحة التحكم',
      '/projects': 'مشاريعي',
      '/request-project': 'طلب مشروع جديد',
      '/profile': 'الملف الشخصي',
      '/support': 'الدعم الفني',
      '/workroom': 'غرفة المشروع',
      '/admin': 'لوحة الإدارة',
      '/login': 'تسجيل الدخول',
      '/register': 'إنشاء حساب'
    };
    
    return titles[route] || 'Deinkow';
  }

  getCurrentRoute() {
    return this.currentRoute;
  }

  showError(message) {
    if (window.Toast) {
      Toast.error(message);
    }
    
    this.contentArea.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h2 class="empty-state-title">خطأ</h2>
        <p class="empty-state-description">${message}</p>
        <button class="btn btn-primary" onclick="window.Router.navigate('/dashboard')">العودة للوحة التحكم</button>
      </div>
    `;
  }
}

// Make Router available globally
window.Router = Router;
