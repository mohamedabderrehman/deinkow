/**
 * Theme Toggle Manager
 * Handles Dark/Light theme switching
 */
class ThemeToggle {
  constructor() {
    this.storageKey = 'deinkow_theme';
    this.init();
  }

  init() {
    // Apply saved theme or system preference on page load
    this.applyTheme();
  }

  getSavedTheme() {
    return localStorage.getItem(this.storageKey);
  }

  saveTheme(theme) {
    localStorage.setItem(this.storageKey, theme);
  }

  getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  getCurrentTheme() {
    const saved = this.getSavedTheme();
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    // If no saved preference, respect system preference
    return this.getSystemPreference();
  }

  applyTheme(theme = null) {
    const themeToApply = theme || this.getCurrentTheme();
    const html = document.documentElement;
    
    if (themeToApply === 'dark') {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }
    
    // Save if explicitly set
    if (theme) {
      this.saveTheme(theme);
    }
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme: themeToApply }
    }));
  }

  toggle() {
    const current = this.getCurrentTheme();
    const newTheme = current === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    return newTheme;
  }

  setTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
      this.applyTheme(theme);
    }
  }

  isDark() {
    return this.getCurrentTheme() === 'dark';
  }
}

// Initialize theme manager immediately (before DOM ready)
// This ensures theme is applied before page renders to prevent flash
if (document.readyState === 'loading') {
  // Apply theme synchronously before DOM is ready
  const storageKey = 'deinkow_theme';
  const savedTheme = localStorage.getItem(storageKey);
  const html = document.documentElement;
  
  if (savedTheme === 'dark') {
    html.setAttribute('data-theme', 'dark');
  } else if (savedTheme === 'light') {
    html.removeAttribute('data-theme');
  } else {
    // Respect system preference if no saved preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      html.setAttribute('data-theme', 'dark');
    }
  }
}

// Initialize theme manager
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.themeToggle = new ThemeToggle();
  });
} else {
  window.themeToggle = new ThemeToggle();
}

// Make available globally
window.ThemeToggle = ThemeToggle;
