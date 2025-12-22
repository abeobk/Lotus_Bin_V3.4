const ImgViewer = {
  // Component name
  name: 'ImgViewer',

  // Declare props this component expects to receive
  props: {},

  // Reactive data
  data() {
    return {
      title: 'ImgViewer',
      zoom: 1,
      minZoom: 0.1,
      maxZoom: 100,
      panX: 0,
      panY: 0,
      isDragging: false,
      lastX: 0,
      lastY: 0,
      imageLoaded: false,
      imageError: false,
      imageData: null, // Store ImageBitmap or HTMLImageElement
      resizeObserver: null,
      onCanvasContextMenu: null,
    };
  },

  // Template
  template: /*html*/ `
    <div class="img-view">
      <div class="img-view__title">{{title}}</div>
      <div class="img-view__canvas-container" 
           ref="canvasContainer"
           @mousedown="startPan"
           @mousemove="pan"
           @mouseup="endPan"
           @mouseleave="endPan"
           @wheel="handleWheel"
           @dblclick="fitToContainer">
        <div v-if="!imageData" class="img-view__placeholder">
          <i class="fa fa-image"></i>
          <span>No Image</span>
        </div>
        <div v-else-if="imageError" class="img-view__error">
          <i class="fa fa-exclamation-triangle"></i>
          <span>Failed to load image</span>
        </div>
        <canvas v-else
                ref="canvas"
                @error="onImageError">
        </canvas>
      </div>
    </div>
  `,

  // Computed properties
  computed: {},

  // Methods
  methods: {
    setImage(title, imageSrc) {
      this.title = title;
      this.imageLoaded = false;
      this.imageError = false;
      this.loadImageToCanvas(imageSrc);
    },

    // Set image from blob response (OPTIMIZED - no URL needed)
    async setImageFromBlob(title, blob) {
      this.title = title;
      this.imageLoaded = false;
      this.imageError = false;

      try {
        // Close previous ImageBitmap to free memory
        if (this.imageData && this.imageData.close) {
          this.imageData.close();
        }

        // createImageBitmap is faster and doesn't need URL cleanup
        const imageBitmap = await createImageBitmap(blob);
        this.imageData = imageBitmap;
        this.imageLoaded = true;
        this.imageError = false;
        this.fitToContainer();
        this.renderCanvas();
      } catch (error) {
        console.error('Failed to create image bitmap:', error);
        this.onImageError();
      }
    },

    // Set image from fetch response
    async setImageFromResponse(title, response) {
      const blob = await response.blob();
      await this.setImageFromBlob(title, blob);
    },

    setImageBase64(title, base64Data) {
      this.title = title;
      const imageSrc = base64Data.startsWith('data:image')
        ? base64Data
        : `data:image/jpeg;base64,${base64Data}`;
      this.imageLoaded = false;
      this.imageError = false;
      this.loadImageToCanvas(imageSrc);
    },

    // Load image and draw to canvas (for URL/Base64)
    loadImageToCanvas(src) {
      const img = new Image();
      img.onload = () => {
        // Close previous ImageBitmap if exists
        if (this.imageData && this.imageData.close) {
          this.imageData.close();
        }
        this.imageData = img;
        this.imageLoaded = true;
        this.imageError = false;
        this.fitToContainer();
        this.renderCanvas();
      };
      img.onerror = () => {
        this.onImageError();
      };
      img.src = src;
    },

    // Render canvas with zoom and pan
    renderCanvas() {
      if (!this.$refs.canvas || !this.imageData) return;

      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d', { alpha: false });
      const container = this.$refs.canvasContainer;

      // Set canvas size to container size
      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      canvas.style.width = container.clientWidth + 'px';
      canvas.style.height = container.clientHeight + 'px';

      // Fill background with container's background color
      const bgColor = getComputedStyle(container).backgroundColor;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply transformations
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.translate(container.clientWidth / 2, container.clientHeight / 2);
      ctx.translate(this.panX, this.panY);
      ctx.scale(this.zoom, this.zoom);

      // Disable image smoothing for pixel-perfect rendering at high zoom
      ctx.imageSmoothingEnabled = this.zoom < 1;

      // Draw image centered (works with both ImageBitmap and HTMLImageElement)
      ctx.drawImage(
        this.imageData,
        -this.imageData.width / 2,
        -this.imageData.height / 2
      );

      ctx.restore();
    },

    onImageError() {
      this.imageError = true;
      this.imageLoaded = false;
    },

    resetView() {
      this.zoom = 1;
      this.panX = 0;
      this.panY = 0;
      this.renderCanvas();
    },

    fitToContainer() {
      if (!this.$refs.canvasContainer || !this.imageData) return;

      const container = this.$refs.canvasContainer;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const imgWidth = this.imageData.width;
      const imgHeight = this.imageData.height;

      if (imgWidth === 0 || imgHeight === 0) return;

      const scaleX = containerWidth / imgWidth;
      const scaleY = containerHeight / imgHeight;
      this.zoom = Math.min(scaleX, scaleY); // Perfect fit to view
      this.panX = 0;
      this.panY = 0;
      this.renderCanvas();
    },

    handleWheel(event) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = this.zoom * delta;

      if (newZoom >= this.minZoom && newZoom <= this.maxZoom) {
        // Zoom towards mouse cursor
        const rect = this.$refs.canvasContainer.getBoundingClientRect();
        const mouseX = event.clientX - rect.left - rect.width / 2;
        const mouseY = event.clientY - rect.top - rect.height / 2;

        const zoomRatio = newZoom / this.zoom;
        this.panX = mouseX - (mouseX - this.panX) * zoomRatio;
        this.panY = mouseY - (mouseY - this.panY) * zoomRatio;
        this.zoom = newZoom;
        this.renderCanvas();
      }
    },

    startPan(event) {
      if (!this.imageLoaded) return;
      this.isDragging = true;
      this.lastX = event.clientX;
      this.lastY = event.clientY;

      if (this.$refs.canvas) {
        this.$refs.canvas.style.cursor = 'grabbing';
      }
    },

    pan(event) {
      if (!this.isDragging) return;
      const deltaX = event.clientX - this.lastX;
      const deltaY = event.clientY - this.lastY;
      this.panX += deltaX;
      this.panY += deltaY;
      this.lastX = event.clientX;
      this.lastY = event.clientY;
      this.renderCanvas();
    },

    endPan() {
      this.isDragging = false;

      if (this.$refs.canvas) {
        this.$refs.canvas.style.cursor = 'grab';
      }
    },
  },

  // Lifecycle hooks
  mounted() {
    // Prevent context menu on canvas
    if (this.$refs.canvas) {
      this.onCanvasContextMenu = (e) => e.preventDefault();
      this.$refs.canvas.addEventListener('contextmenu', this.onCanvasContextMenu);
      this.$refs.canvas.style.cursor = 'grab';
    }

    // Watch for container resize and reset view
    if (this.$refs.canvasContainer) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.imageLoaded) {
          this.fitToContainer();
        }
      });
      this.resizeObserver.observe(this.$refs.canvasContainer);
    }
  },

  beforeUnmount() {
    if(this.$refs.canvas && this.onCanvasContextMenu) {
      this.$refs.canvas.removeEventListener('contextmenu', this.onCanvasContextMenu);
      this.onCanvasContextMenu = null;
    }
    // Clean up resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    // Close ImageBitmap to free GPU memory
    if (this.imageData && this.imageData.close) {
      this.imageData.close();
      this.imageData = null;
    }
  },
};

//inject style
if (!document.querySelector('#img-view-styles')) {
  const styles = /*css*/ `
    <style id="img-view-styles">
      .img-view {
        display: flex;
        flex-direction: column;
        flex: 1;
        background-color: var(--bg-primary);
        border-radius: var(--spacing-sm);
        border: 1px solid var(--border-color);
        box-shadow: 0 2px 4px var(--shadow-color);
        overflow: hidden;
      }

      .img-view__title {
        background-color: var(--bg-title);
        font-weight: 600;
        font-size: var(--font-size-lg);
        text-align: center;
        border-bottom: 1px solid var(--border-color);
      }

      .img-view__canvas-container {
        position: relative;
        flex: 1;
        overflow: hidden;
        background-color: var(--bg-primary);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .img-view__canvas-container canvas {
        display: block;
        cursor: grab;
      }

      .img-view__canvas-container canvas:active {
        cursor: grabbing;
      }
      
      .img-view__placeholder,
      .img-view__error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-md);
        color: var(--text-secondary);
        font-size: var(--font-size-lg);
      }

      .img-view__placeholder i,
      .img-view__error i {
        font-size: 48px;
        opacity: 0.5;
      }

      .img-view__error {
        color: var(--accent-ng);
      }

      .img-view__placeholder span,
      .img-view__error span {
        font-weight: 600;
      }
    </style>
  `;
  document.head.insertAdjacentHTML('beforeend', styles);
}

// Export both ways
window.ImgViewer = ImgViewer;
