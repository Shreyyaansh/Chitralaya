/**
 * Image Optimization Utility for Chitralaya Gallery
 * Provides functions for optimizing image loading and performance
 */

class ImageOptimizer {
  constructor() {
    this.supportedFormats = ['webp', 'avif', 'jpeg', 'png'];
    this.defaultQuality = 80;
    this.defaultWidth = 400;
    this.defaultHeight = 400;
  }

  /**
   * Generate optimized image URL with Vercel's image optimization
   * @param {string} imagePath - Original image path
   * @param {Object} options - Optimization options
   * @returns {string} Optimized image URL
   */
  getOptimizedUrl(imagePath, options = {}) {
    if (!imagePath) return '';
    
    const {
      width = this.defaultWidth,
      height = this.defaultHeight,
      quality = this.defaultQuality,
      format = 'webp',
      fit = 'cover'
    } = options;

    // Vercel Image Optimization API
    const params = new URLSearchParams({
      w: width.toString(),
      h: height.toString(),
      q: quality.toString(),
      f: format,
      fit: fit
    });

    return `${imagePath}?${params.toString()}`;
  }

  /**
   * Check if browser supports WebP format
   * @returns {Promise<boolean>} WebP support status
   */
  async supportsWebP() {
    if (!this._webpSupport) {
      this._webpSupport = new Promise((resolve) => {
        const webP = new Image();
        webP.onload = webP.onerror = () => {
          resolve(webP.height === 2);
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
      });
    }
    return this._webpSupport;
  }

  /**
   * Get the best format for the current browser
   * @returns {Promise<string>} Best supported format
   */
  async getBestFormat() {
    const webpSupported = await this.supportsWebP();
    return webpSupported ? 'webp' : 'jpeg';
  }

  /**
   * Preload critical images
   * @param {Array} imageUrls - Array of image URLs to preload
   * @param {number} maxConcurrent - Maximum concurrent preloads
   */
  async preloadImages(imageUrls, maxConcurrent = 3) {
    const chunks = this.chunkArray(imageUrls, maxConcurrent);
    
    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(url => this.preloadImage(url))
      );
    }
  }

  /**
   * Preload a single image
   * @param {string} url - Image URL to preload
   * @returns {Promise<void>}
   */
  preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
      img.src = url;
    });
  }

  /**
   * Create responsive image sources
   * @param {string} basePath - Base image path
   * @param {Array} sizes - Array of size objects {width, height, quality}
   * @returns {Array} Array of optimized image URLs
   */
  createResponsiveSources(basePath, sizes = [
    { width: 200, height: 200, quality: 60 },
    { width: 400, height: 400, quality: 80 },
    { width: 800, height: 800, quality: 90 }
  ]) {
    return sizes.map(size => this.getOptimizedUrl(basePath, size));
  }

  /**
   * Utility function to chunk array
   * @param {Array} array - Array to chunk
   * @param {number} size - Chunk size
   * @returns {Array} Chunked array
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get image dimensions from URL
   * @param {string} url - Image URL
   * @returns {Promise<{width: number, height: number}>}
   */
  getImageDimensions(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }
}

// Export for use in other files
window.ImageOptimizer = ImageOptimizer;

// Usage example:
// const optimizer = new ImageOptimizer();
// const optimizedUrl = optimizer.getOptimizedUrl('/assets/canvas/image.jpg', {
//   width: 400,
//   height: 400,
//   quality: 80,
//   format: 'webp'
// });
