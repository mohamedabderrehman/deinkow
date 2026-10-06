/**
 * Dynamic Typing Headline
 * Rotates words with typing effect
 */
class TypingHeadline {
  constructor(container, options = {}) {
    this.container = container;
    this.staticText = options.staticText || 'We build';
    this.words = options.words || ['Websites.', 'Apps.', 'Bots.', 'Scripts.'];
    this.typingSpeed = options.typingSpeed || 100; // ms per character
    this.deletingSpeed = options.deletingSpeed || 50; // ms per character
    this.pauseTime = options.pauseTime || 2000; // ms between words
    this.currentWordIndex = 0;
    this.currentText = '';
    this.isDeleting = false;
    this.init();
  }

  init() {
    if (!this.container) return;
    
    this.render();
    this.type();
  }

  render() {
    this.container.innerHTML = `
      <span class="typing-headline-static">${this.staticText}</span>
      <span class="typing-headline-dynamic" id="typingDynamic"></span>
      <span class="typing-headline-cursor">|</span>
    `;
    
    this.dynamicElement = document.getElementById('typingDynamic');
  }

  type() {
    if (!this.dynamicElement) return;
    
    const currentWord = this.words[this.currentWordIndex];
    
    if (this.isDeleting) {
      // Delete characters
      this.currentText = currentWord.substring(0, this.currentText.length - 1);
      this.dynamicElement.textContent = this.currentText;
      
      if (this.currentText === '') {
        this.isDeleting = false;
        this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
        setTimeout(() => this.type(), this.pauseTime);
        return;
      }
      
      setTimeout(() => this.type(), this.deletingSpeed);
    } else {
      // Type characters
      this.currentText = currentWord.substring(0, this.currentText.length + 1);
      this.dynamicElement.textContent = this.currentText;
      
      if (this.currentText === currentWord) {
        this.isDeleting = true;
        setTimeout(() => this.type(), this.pauseTime);
        return;
      }
      
      setTimeout(() => this.type(), this.typingSpeed);
    }
  }
}

// Make available globally
window.TypingHeadline = TypingHeadline;
