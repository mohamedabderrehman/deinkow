/**
 * Live Visitor Counter
 * Simulates believable visitor count
 */
class Visitors {
  constructor(container, options = {}) {
    this.container = container;
    this.min = options.min || 2;
    this.max = options.max || 6;
    this.updateInterval = options.updateInterval || 10000; // 8-15 seconds
    this.currentCount = this.getRandomCount();
    this.init();
  }

  init() {
    if (!this.container) return;
    
    this.render();
    this.startUpdating();
  }

  getRandomCount() {
    return Math.floor(Math.random() * (this.max - this.min + 1)) + this.min;
  }

  getRandomInterval() {
    // Random between 8-15 seconds
    return Math.floor(Math.random() * 7000) + 8000;
  }

  render() {
    this.container.innerHTML = `
      <span class="visitors-count" id="visitorsCount">${this.currentCount}</span>
      <span class="visitors-text">clients are viewing this page now</span>
    `;
    
    this.countElement = document.getElementById('visitorsCount');
  }

  updateCount() {
    const newCount = this.getRandomCount();
    
    if (newCount === this.currentCount) {
      // If same count, try again
      this.updateCount();
      return;
    }
    
    // Smooth transition
    if (this.countElement) {
      this.countElement.style.opacity = '0';
      this.countElement.style.transform = 'translateY(-5px)';
      
      setTimeout(() => {
        this.currentCount = newCount;
        this.countElement.textContent = this.currentCount;
        this.countElement.style.opacity = '1';
        this.countElement.style.transform = 'translateY(0)';
      }, 200);
    }
  }

  startUpdating() {
    // Initial delay
    setTimeout(() => {
      this.updateCount();
      this.scheduleNext();
    }, this.getRandomInterval());
  }

  scheduleNext() {
    setTimeout(() => {
      this.updateCount();
      this.scheduleNext();
    }, this.getRandomInterval());
  }
}

// Make available globally
window.Visitors = Visitors;
