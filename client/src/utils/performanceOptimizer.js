// Performance optimization utilities

// Lazy load images
export const lazyLoadImages = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
  }
};

// Preload critical resources
export const preloadCriticalResources = () => {
  const criticalResources = [
    '/zanwik-icon.svg',
    '/fonts/inter.woff2'
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.svg') ? 'image' : 'font';
    if (resource.endsWith('.woff2')) {
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
};

// Optimize API calls with caching
export const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cachedApiCall = async (url, options = {}) => {
  const cacheKey = `${url}_${JSON.stringify(options)}`;
  const cached = apiCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    apiCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Debounce function for search
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Optimize bundle size by code splitting
export const loadComponent = (importFunc) => {
  return React.lazy(() => importFunc());
};

// Service Worker registration for caching
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

// Image optimization
export const optimizeImage = (src, width, height, quality = 80) => {
  // For Vercel, we can use their image optimization
  if (src.startsWith('/')) {
    return `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&h=${height}&q=${quality}`;
  }
  return src;
};

// Critical CSS inlining
export const inlineCriticalCSS = () => {
  const criticalCSS = `
    body { margin: 0; font-family: Inter, sans-serif; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .btn { padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; }
    .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
  `;
  
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.appendChild(style);
};

// Performance monitoring
export const performanceMonitor = {
  mark: (name) => {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(name);
    }
  },
  
  measure: (name, startMark, endMark) => {
    if ('performance' in window && 'measure' in performance) {
      performance.measure(name, startMark, endMark);
    }
  },
  
  getMetrics: () => {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
      };
    }
    return null;
  }
};

// Initialize performance optimizations
export const initPerformanceOptimizations = () => {
  // Preload critical resources
  preloadCriticalResources();
  
  // Inline critical CSS
  inlineCriticalCSS();
  
  // Register service worker
  registerServiceWorker();
  
  // Mark performance milestones
  performanceMonitor.mark('app-start');
  
  // Lazy load images after initial render
  setTimeout(lazyLoadImages, 100);
};
