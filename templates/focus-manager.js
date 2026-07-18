/**
 * ProductPrototypeKit - Premium TV D-pad Focus Engine
 * Pure-JS Spatial Navigation & Modal Focus Traps
 */

class TVFocusManager {
  constructor() {
    this.currentFocused = null;
    this.previousFocusedStack = [];
    this.initListeners();
  }

  /**
   * Scan and return all visible focusable elements.
   * If a modal dialog is active, restricts focus targets inside the dialog (Focus Trap).
   */
  getFocusableElements() {
    const activeOverlay = document.querySelector('.dialog-overlay.active');
    let scope = document;
    
    if (activeOverlay) {
      scope = activeOverlay; // Restrict search scope to active dialog only
    }

    const elements = Array.from(scope.querySelectorAll('.focusable'));
    
    // Filter out invisible, disabled, or hidden parent elements
    return elements.filter(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return rect.width > 0 && 
             rect.height > 0 && 
             style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             el.getAttribute('disabled') === null;
    });
  }

  /**
   * Set D-pad focus to a specific element.
   * Cleans up previous focus styling and applies new highlight.
   */
  setFocus(element) {
    if (this.currentFocused) {
      this.currentFocused.classList.remove('focused');
      this.currentFocused.blur();
    }
    
    if (element) {
      this.currentFocused = element;
      this.currentFocused.classList.add('focused');
      this.currentFocused.focus();
      
      // Auto scroll container if needed (TV standard scrolling)
      this.currentFocused.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }

  /**
   * Focus the default element in the current viewport scope.
   */
  focusDefault() {
    const elements = this.getFocusableElements();
    if (elements.length > 0) {
      // Prefer elements marked with data-default-focus="true"
      const defaultEl = elements.find(el => el.getAttribute('data-default-focus') === 'true') || elements[0];
      this.setFocus(defaultEl);
    }
  }

  /**
   * Directional Spatial Navigation Algorithm (D-pad routing)
   * Calculates the best candidate based on direction, overlap, and distance.
   */
  navigate(direction) {
    if (!this.currentFocused) {
      this.focusDefault();
      return;
    }

    const currentRect = this.currentFocused.getBoundingClientRect();
    const currentCenter = {
      x: currentRect.left + currentRect.width / 2,
      y: currentRect.top + currentRect.height / 2
    };

    const candidates = this.getFocusableElements().filter(el => el !== this.currentFocused);
    let bestCandidate = null;
    let minScore = Infinity;

    candidates.forEach(cand => {
      const candRect = cand.getBoundingClientRect();
      const candCenter = {
        x: candRect.left + candRect.width / 2,
        y: candRect.top + candRect.height / 2
      };

      // Verify alignment based on direction
      let isAligned = false;
      let primaryDiff = 0;   // Distance along the primary axis of direction
      let secondaryDiff = 0; // Distance along the cross axis

      switch (direction) {
        case 'ArrowUp':
          isAligned = candCenter.y < currentCenter.y;
          primaryDiff = currentCenter.y - candCenter.y;
          secondaryDiff = Math.abs(candCenter.x - currentCenter.x);
          break;
        case 'ArrowDown':
          isAligned = candCenter.y > currentCenter.y;
          primaryDiff = candCenter.y - currentCenter.y;
          secondaryDiff = Math.abs(candCenter.x - currentCenter.x);
          break;
        case 'ArrowLeft':
          isAligned = candCenter.x < currentCenter.x;
          primaryDiff = currentCenter.x - candCenter.x;
          secondaryDiff = Math.abs(candCenter.y - currentCenter.y);
          break;
        case 'ArrowRight':
          isAligned = candCenter.x > currentCenter.x;
          primaryDiff = candCenter.x - currentCenter.x;
          secondaryDiff = Math.abs(candCenter.y - currentCenter.y);
          break;
      }

      if (isAligned) {
        // Scoring formula: Distance + 2.5 * orthogonal deviation (penalizes diagonal targets)
        const score = primaryDiff + (secondaryDiff * 2.5);
        if (score < minScore) {
          minScore = score;
          bestCandidate = cand;
        }
      }
    });

    if (bestCandidate) {
      this.setFocus(bestCandidate);
    }
  }

  /**
   * Open modal dialog, trapping D-pad focus inside it.
   */
  openDialog(overlaySelector) {
    const overlay = document.querySelector(overlaySelector);
    if (!overlay) return;

    if (this.currentFocused) {
      this.previousFocusedStack.push(this.currentFocused);
    }

    overlay.classList.add('active');
    setTimeout(() => {
      this.focusDefault(); // Lock focus inside overlay elements
    }, 50);
  }

  /**
   * Close modal dialog, releasing focus trap and restoring previous focus.
   */
  closeDialog(overlaySelector) {
    const overlay = document.querySelector(overlaySelector);
    if (!overlay) return;

    overlay.classList.remove('active');
    
    // Restore focus
    const previous = this.previousFocusedStack.pop();
    if (previous) {
      this.setFocus(previous);
    } else {
      this.focusDefault();
    }
  }

  /**
   * Bind keydown listeners. Maps keyboard controls to TV Remote codes.
   */
  initListeners() {
    window.addEventListener('keydown', (e) => {
      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'];
      if (!keys.includes(e.key)) return;

      // Prevent page scrolling on Arrow keys
      e.preventDefault();

      if (e.key === 'Enter') {
        if (this.currentFocused) {
          this.currentFocused.click(); // Trigger native click action
        }
      } else if (e.key === 'Escape') {
        // Close active dialog if present
        const activeOverlay = document.querySelector('.dialog-overlay.active');
        if (activeOverlay) {
          this.closeDialog('.' + activeOverlay.className.split(' ').join('.'));
        } else if (typeof window.goBack === 'function') {
          window.goBack(); // Trigger page custom back action
        }
      } else {
        // Directional Navigation
        this.navigate(e.key);
      }
    });

    // Auto-focus default on load
    window.addEventListener('DOMContentLoaded', () => {
      this.focusDefault();
    });
  }
}

// Instantiate globally
window.tvFocusManager = new TVFocusManager();
