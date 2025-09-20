const IOViewer = {
  // Component name
  name: 'IOViewer',

  // Declare props this component expects to receive
  props: {
    iomaps: { type: Array, default: () => [] },
  },

  // Reactive data
  data() {
    return {

    };
  },

  // Template
  template: /*html*/ `
    <div class="io-viewer-container">
    </div>
  `,

  // Methods
  methods: {
  }
};

//inject style
if (!document.querySelector('#io-view-styles')) {
  const styles = /*css*/ `
    <style id="io-view-styles">
    </style>
  `;
  document.head.insertAdjacentHTML('beforeend', styles);
}

// Export both ways
window.IOViewer = IOViewer;
