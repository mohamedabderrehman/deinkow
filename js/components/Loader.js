/**
 * Loading Skeleton Component
 */
class Loader {
  static createSkeleton(type = 'card', count = 1) {
    const skeletons = [];
    
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = `skeleton skeleton-${type}`;
      
      switch (type) {
        case 'card':
          skeleton.innerHTML = `
            <div class="skeleton-title"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text" style="width: 80%;"></div>
            <div class="skeleton-text" style="width: 60%;"></div>
          `;
          break;
        case 'list':
          skeleton.innerHTML = `
            <div style="display: flex; gap: 12px; align-items: center;">
              <div class="skeleton-avatar"></div>
              <div style="flex: 1;">
                <div class="skeleton-text" style="width: 60%; margin-bottom: 8px;"></div>
                <div class="skeleton-text" style="width: 40%;"></div>
              </div>
            </div>
          `;
          break;
        case 'table':
          skeleton.innerHTML = `
            <div class="skeleton-text"></div>
            <div class="skeleton-text" style="width: 80%;"></div>
            <div class="skeleton-text" style="width: 70%;"></div>
          `;
          break;
        default:
          skeleton.innerHTML = '<div class="skeleton-text"></div>';
      }
      
      skeletons.push(skeleton);
    }
    
    return count === 1 ? skeletons[0] : skeletons;
  }

  static show(element, type = 'card', count = 1) {
    if (!element) return;
    
    const skeletons = this.createSkeleton(type, count);
    element.innerHTML = '';
    
    if (Array.isArray(skeletons)) {
      skeletons.forEach(s => element.appendChild(s));
    } else {
      element.appendChild(skeletons);
    }
  }

  static hide(element) {
    if (!element) return;
    element.innerHTML = '';
  }
}

// Make Loader available globally
window.Loader = Loader;
