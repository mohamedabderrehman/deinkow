/**
 * Cinematic Intro Screen
 * Shows on first visit only
 */
class Intro {
  constructor() {
    this.introShown = localStorage.getItem('deinkow_intro_shown') === 'true';
    this.init();
  }

  init() {
    if (this.introShown) {
      return; // Skip intro if already shown
    }

    this.showIntro();
  }

  showIntro() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'intro-overlay';
    overlay.id = 'introOverlay';
    
    // Create content
    const content = document.createElement('div');
    content.className = 'intro-content';
    
    const text = document.createElement('h1');
    text.className = 'intro-text';
    text.textContent = '';
    
    content.appendChild(text);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    
    // Prevent body scroll
    document.body.classList.add('intro-active');
    
    // Type text with effect
    const fullText = "Tell us what you need. We'll build it.";
    this.typeText(text, fullText, () => {
      // Wait a bit, then fade out
      setTimeout(() => {
        this.hideIntro(overlay);
      }, 1500);
    });
  }

  typeText(element, text, callback) {
    element.classList.add('typing');
    let index = 0;
    const speed = 50; // milliseconds per character
    
    const type = () => {
      if (index < text.length) {
        element.textContent = text.substring(0, index + 1);
        index++;
        setTimeout(type, speed);
      } else {
        element.classList.remove('typing');
        if (callback) callback();
      }
    };
    
    type();
  }

  hideIntro(overlay) {
    overlay.classList.add('hidden');
    
    // Remove from DOM after animation
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      document.body.classList.remove('intro-active');
      
      // Mark as shown
      localStorage.setItem('deinkow_intro_shown', 'true');
    }, 800);
  }
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new Intro();
  });
} else {
  new Intro();
}

// Make available globally
window.Intro = Intro;
