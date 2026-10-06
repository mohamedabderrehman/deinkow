/**
 * Toast Notification System
 * Modern replacement for alert()
 */
class Toast {
  static container = null;
  static toasts = [];

  static init() {
    if (this.container) return;
    
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(this.container);
  }

  static show(message, type = 'info', duration = 4000) {
    this.init();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    
    const icon = this.getIcon(type);
    const messageText = document.createElement('span');
    messageText.className = 'toast-message';
    messageText.textContent = message;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.innerHTML = '×';
    closeBtn.setAttribute('aria-label', 'إغلاق');
    closeBtn.onclick = () => this.remove(toast);
    
    toast.appendChild(icon);
    toast.appendChild(messageText);
    toast.appendChild(closeBtn);
    
    this.container.appendChild(toast);
    this.toasts.push(toast);
    
    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    // Auto remove
    if (duration > 0) {
      setTimeout(() => this.remove(toast), duration);
    }
    
    return toast;
  }

  static getIcon(type) {
    const icon = document.createElement('div');
    icon.className = 'toast-icon';
    
    const icons = {
      success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
      warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3.33333L3.33333 16.6667H16.6667L10 3.33333Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 11.6667V14.1667" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="8.33333" r="0.833333" fill="currentColor"/></svg>',
      info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8.33333" stroke="currentColor" stroke-width="2"/><path d="M10 6.66667V10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="13.3333" r="0.833333" fill="currentColor"/></svg>'
    };
    
    icon.innerHTML = icons[type] || icons.info;
    return icon;
  }

  static remove(toast) {
    if (!toast || !toast.parentNode) return;
    
    toast.classList.remove('show');
    toast.classList.add('hide');
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      this.toasts = this.toasts.filter(t => t !== toast);
    }, 300);
  }

  static success(message, duration) {
    return this.show(message, 'success', duration);
  }

  static error(message, duration) {
    return this.show(message, 'error', duration || 6000);
  }

  static warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  static info(message, duration) {
    return this.show(message, 'info', duration);
  }

  static clear() {
    this.toasts.forEach(toast => this.remove(toast));
  }
}

// Make Toast available globally
window.Toast = Toast;
