/**
 * Custom Cursor
 * Replaces default cursor with custom animated cursor
 */
class CustomCursor {
  constructor() {
    this.cursor = null;
    this.isHovering = false;
    this.isTouchDevice = this.detectTouchDevice();
    this.init();
  }

  detectTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  init() {
    // Skip on touch devices
    if (this.isTouchDevice) {
      return;
    }

    // Create cursor element
    this.cursor = document.createElement('div');
    this.cursor.className = 'custom-cursor';
    document.body.appendChild(this.cursor);

    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
      this.moveCursor(e);
    });

    // Track mouse leave
    document.addEventListener('mouseleave', () => {
      this.hideCursor();
    });

    // Track mouse enter
    document.addEventListener('mouseenter', () => {
      this.showCursor();
    });

    // Track clicks
    document.addEventListener('click', () => {
      this.pulse();
    });

    // Track hoverable elements
    this.attachHoverListeners();
  }

  moveCursor(e) {
    if (!this.cursor) return;
    
    this.cursor.style.left = e.clientX + 'px';
    this.cursor.style.top = e.clientY + 'px';
  }

  hideCursor() {
    if (this.cursor) {
      this.cursor.classList.add('hidden');
    }
  }

  showCursor() {
    if (this.cursor) {
      this.cursor.classList.remove('hidden');
    }
  }

  pulse() {
    if (!this.cursor) return;
    
    this.cursor.classList.add('click');
    setTimeout(() => {
      this.cursor.classList.remove('click');
    }, 300);
  }

  attachHoverListeners() {
    // Select all hoverable elements
    const hoverableSelectors = [
      'a',
      'button:not([disabled])',
      '.btn',
      '.nav-item',
      '.notifications-btn',
      '.user-avatar-btn',
      'input[type="submit"]',
      'input[type="button"]',
      '[role="button"]',
      '[onclick]'
    ].join(', ');

    const hoverableElements = document.querySelectorAll(hoverableSelectors);

    hoverableElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        if (this.cursor) {
          this.cursor.classList.add('hover');
          this.isHovering = true;
        }
      });

      element.addEventListener('mouseleave', () => {
        if (this.cursor) {
          this.cursor.classList.remove('hover');
          this.isHovering = false;
        }
      });
    });

    // Also handle dynamically added elements
    const observer = new MutationObserver(() => {
      const newElements = document.querySelectorAll(hoverableSelectors);
      newElements.forEach(element => {
        if (!element.dataset.cursorAttached) {
          element.dataset.cursorAttached = 'true';
          element.addEventListener('mouseenter', () => {
            if (this.cursor) {
              this.cursor.classList.add('hover');
            }
          });
          element.addEventListener('mouseleave', () => {
            if (this.cursor) {
              this.cursor.classList.remove('hover');
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialize cursor
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.customCursor = new CustomCursor();
  });
} else {
  window.customCursor = new CustomCursor();
}

// Make available globally
window.CustomCursor = CustomCursor;
