/**
 * Smart CTA Button
 * Appears on scroll after 40% of page height
 */
class SmartCTA {
  constructor(options = {}) {
    this.text = options.text || 'Start Project';
    this.route = options.route || '/request-project';
    this.threshold = options.threshold || 0.4; // 40% of page
    this.init();
  }

  init() {
    this.createButton();
    this.attachScrollListener();
    this.checkScrollPosition();
  }

  createButton() {
    // Check if button already exists
    if (document.getElementById('smartCTA')) {
      return;
    }

    const button = document.createElement('a');
    button.id = 'smartCTA';
    button.className = 'smart-cta-button';
    button.href = '#';
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="margin-left: 8px;">
        <path d="M10 3V17M3 10H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      ${this.text}
    `;
    
    button.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.Router) {
        window.Router.navigate(this.route);
      } else {
        window.location.href = this.route;
      }
    });

    document.body.appendChild(button);
  }

  attachScrollListener() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.checkScrollPosition();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  checkScrollPosition() {
    const button = document.getElementById('smartCTA');
    if (!button) return;

    const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    
    if (scrollPercent >= this.threshold) {
      button.classList.add('visible');
    } else {
      button.classList.remove('visible');
    }
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.smartCTA = new SmartCTA();
  });
} else {
  window.smartCTA = new SmartCTA();
}

// Make available globally
window.SmartCTA = SmartCTA;
