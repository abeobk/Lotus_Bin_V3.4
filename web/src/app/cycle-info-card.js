const CycleInfoCard = {
  //component name
  name: 'CycleInfoCard',
  //declare what props this component expects to receive
  props: {
    model: { type: String, default: '-' },
    tag: { type: String, default: '' },
    vin: { type: String, default: '-' },
    seq: { type: String, default: '-' },
    status: { type: String, default: '' },
  },
  //template
  template: /*html*/ `
    <div class="cycle-info-card">
        <div class="cycle-info-item border-right" style="max-width:3rem;">
            <div class="cycle-info-icon">
                <i class="fa" :class="{
                    'fa-circle-check': status.toLowerCase() === 'ok', 
                    'fa-circle-exclamation': status.toLowerCase() === 'ng', 
                    'fa-spinner fa-spin': status === '...' || status === ''
                }"></i>
            </div>
        </div>
        <div class="cycle-info-item border-right">
            <div class="cycle-info-icon"><i class="fa fa-car"></i></div>
            <div class="content-container">{{ model }}</div>
            <div class="model-tag">{{ tag }}</div>
        </div>
        <div class="cycle-info-item border-right">
            <div class="cycle-info-icon"><i class="fa fa-tag"></i></div>
            <div class="content-container">{{ vin }}</div>
        </div>
        <div class="cycle-info-item">
            <div class="cycle-info-icon"><i class="fa fa-hashtag"></i></div>
            <div class="content-container">{{ seq }}</div>
        </div>
    </div>
    `,

  methods: {},
};

//inject style
if (!document.querySelector('#cycle-info-card-styles')) {
  const styles = /*css*/ `
        <style id="cycle-info-card-styles">
          .cycle-info-card {
              display: flex;
              flex-direction: row;
              background: var(--bg-tertiary);
              margin: var(--spacing-sm);
              padding: var(--spacing-sm);
              margin-bottom: 0px;
              border-radius: var(--spacing-sm);
              width: auto;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }

          .cycle-info-item {
              display: flex;
              flex-direction: row;
              gap: var(--spacing-sm);
              padding: 0 var(--spacing-sm);
              align-items: center;
              font-size: var(--font-size-xl);
              font-weight: 600;
              white-space: nowrap;
              flex: 1;
              min-width: auto;
              justify-content: center;
              align-items: center;
          }

          .cycle-info-icon {
              margin-left:var(--spacing-sm);
              margin-right:var(--spacing-sm);
          }

          .content-container {
              flex: 1;
              text-align: left;
          }

          .model-tag{
            background: var(--yellow);
            color: var(--bg-primary);
            border-radius: var(--spacing-xs);
            padding: 0 var(--spacing-sm);
            font-size: 0.8em;
          }
        </style>
      `;
  document.head.insertAdjacentHTML('beforeend', styles);
}

// Export both ways
window.CycleInfoCard = CycleInfoCard;
