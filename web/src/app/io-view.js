const IOViewer = {
  // Component name
  name: 'IOViewer',

  // Declare props this component expects to receive
  props: {},

  // Reactive data
  data() {
    return {
      title: 'IOViewer',
      ioInputs: [],
      ioOutputs: [],
      readFlashTimeout: false,
      writeFlashTimeout: false,
    };
  },

  // Template
  template: /*html*/ `
    <div class="io-view">
      <div class="io-view__title"><i class="fa fa-tags"></i> {{title}}</div>
      <div class="io-view__map">
        <div class="io-view__column">
            <div class="io-view__header">
                <span class="io-view__badge" :data-state="readFlashTimeout ? 'active' : ''">R</span>
                <span>INPUT</span>
            </div>
            <div id="io-input" class="io-view__content">
                <div class="io-view__pin" v-for="pin in ioInputs" :key="pin.Name"
                    :class = "{ 'io-view__pin--even': pin.Idx % 2 === 0 }"
                    @dblclick="onInputPinDblClick(pin)">
                    <span class="io-view__badge" :data-state="getBadgeState(pin)">{{pin.Index}}</span>
                    <span>{{pin.Text !== "" ? pin.Text : pin.Name}}</span>
                </div>
            </div>
        </div>

        <div class="io-view__column">
            <div class="io-view__header">
                <span class="io-view__badge" :data-state="writeFlashTimeout ? 'active' : ''">W</span>
                <span>OUTPUT</span>
            </div>
            <div id="io-output" class="io-view__content">
                <div class="io-view__pin" v-for="pin in ioOutputs" :key="pin.Name"
                    :class = "{ 'io-view__pin--even': pin.Idx % 2 === 0 }"
                    @dblclick="onOutputPinDblClick(pin)">
                    <span class="io-view__badge" :data-state="getBadgeState(pin)">{{pin.Index}}</span>
                    <span>{{pin.Text !== "" ? pin.Text : pin.Name}}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  `,

  // Methods
  methods: {
    getBadgeState(pin) {
      let state = '';
      if(pin.isManual) state += 'manual';
      if(pin.isActive) state += (state ? '-active' : 'active');
      if(pin.isErr) state += (state ? '-err' : 'err');
      return state;
    },
    setIOMap(title, iomap) {
      if (!iomap) return;
      this.title = title;
      console.log('Setup io pinmap:', iomap);
      const err_keys = ['HW_ERR', 'FAULT', 'FAULTY', 'NG'];
      const err_suffix = ['_ERR', '_NG'];
      this.ioInputs = iomap
        .filter((pin) => pin.Function == 'DI')
        .map((pin,index) => ({
          ...pin,
          Idx:index,
          isErr: err_keys.some(
            (key) =>
              pin.Name.toUpperCase() === key ||
              pin.Name.toUpperCase().endsWith(key)
          ),
          isManual: false,
          isActive: false,
        }));
      this.ioOutputs = iomap
        .filter((pin) => pin.Function == 'DO')
        .map((pin,index) => ({
          ...pin,
          Idx:index,
          isErr: err_keys.some(
            (key) =>
              pin.Name.toUpperCase() === key ||
              pin.Name.toUpperCase().endsWith(key)
          ),
          isManual: false,
          isActive: false,
        }));
    },

    setInputPin(name, value) {
      const pinIndex = this.ioInputs.findIndex((pin) => pin.Name === name);
      if (pinIndex === -1) return;
      if (!this.readFlashTimeout)
        this.readFlashTimeout = setTimeout(() => {
          this.readFlashTimeout = null;
        }, 50);
      const pin = this.ioInputs[pinIndex];
      if (pin.isActive === value) return; //no change
      pin.isActive = value;
    },

    setOutputPin(name, value) {
      const pinIndex = this.ioOutputs.findIndex((pin) => pin.Name === name);
      if (pinIndex === -1) return;
      if (!this.writeFlashTimeout)
        this.writeFlashTimeout = setTimeout(() => {
          this.writeFlashTimeout = null;
        }, 50);
      const pin = this.ioOutputs[pinIndex];
      if (pin.isActive === value) return; //no change
      pin.isActive = value;
    },

    //input pin double click
    onInputPinDblClick(pin) {
      console.log(`DI[${pin.Index}]-${pin.Name}`);
      pin.isManual = true;
      if (pin.manualTimer) clearTimeout(pin.manualTimer);
      pin.manualTimer = setTimeout(() => {
        pin.isManual = false;
        pin.manualTimer = null;
      }, 500);
      CSharpUtils.sendMessage({ type: 'input_pin_dblclick', value: pin.Name });
    },

    //output pin double click
    onOutputPinDblClick(pin) {
      console.log(`DO[${pin.Index}]-${pin.Name}`);
      pin.isManual = true;
      if (pin.manualTimer) clearTimeout(pin.manualTimer);
      pin.manualTimer = setTimeout(() => {
        pin.isManual = false;
        pin.manualTimer = null;
      }, 500);
      CSharpUtils.sendMessage({ type: 'output_pin_dblclick', value: pin.Name });
    },
  },
};

//inject style
if (!document.querySelector('#io-view-styles')) {
  const styles = /*css*/ `
    <style id="io-view-styles">
      .io-view {
        display: flex;
        flex:1 1 min-content;
        min-width: min-content;
        max-height: min-content;
        flex-direction: column;
        background-color: var(--bg-primary);
        overflow: hidden;
        border: 1px solid var(--border-color);
        border-radius: var(--spacing-sm);
        box-shadow: 0 2px 4px var(--shadow-color);
      }

      .io-view__map {
        display: flex;
        flex-direction: row;
        height: 100%;
        background-color: var(--bg-primary);
      }

      .io-view__title {
        background-color: var(--bg-title);
        padding: var(--spacing-xs);
        font-weight: 600;
        font-size: var(--font-size-lg);
        text-align: center;
        border-bottom: 1px solid var(--border-color);
      }

      .io-view__column {
        display: flex;
        flex-direction: column;
        width: 100%;
        overflow: hidden;
        background-color: var(--bg-primary);
        min-height: fit-content;
      }

      .io-view__column:first-of-type {
        border-right: 1px solid var(--border-color);
      }
      
      .io-view__header {
        display: flex;
        flex-direction: row;
        align-items: center;
        background-color: var(--bg-table-header);
        padding: var(--spacing-xs);
        gap: var(--spacing-md);
        border-bottom: 1px solid var(--border-color);
        font-weight: 600;
        height: 2rem;
        font-size: var(--font-size-lg);
      }

      .io-view__badge {
        display: flex;
        min-width: var(--badge-size);
        max-width: var(--badge-size);
        min-height: var(--badge-size);
        max-height: var(--badge-size);
        font-size: var(--font-size-sm);
        border: 1px solid var(--border-color);
        background-color: var(--bg-io-badge);
        border-radius: 1rem;
        font-weight: 600;
        align-items: center;
        justify-content: center;
      }

      .io-view__badge[data-state="active"] {
        animation: io-view-flash 0.05s 1;
      }

      .io-view__badge[data-state="active"],
      .io-view__badge[data-state="manual-active"] {
          background-color: var(--blue);
          color: var(--base03);
          border: none;
          animation: io-view-pulse 0.5s 2;
      }

      .io-view__badge[data-state="active-err"] {
          background-color: var(--accent-ng);
          animation: io-view-pulse-err 0.5s 2;
      }

      .io-view__badge[data-state="manual"],
      .io-view__badge[data-state="manual-active"] {
        animation: io-view-pulse-manual 0.5s 1;
      }

      .io-view__badge[data-state="manual-err"],
      .io-view__badge[data-state="manual-active-err"] {
        animation: io-view-pulse-manual-err 0.5s 1;
      }

      @keyframes io-view-flash {
          0% { background-color: var(--bg-primary); }
          100% { background-color: var(--accent-active); }
      }

      .io-view__content {
        overflow-y: auto;
      }

      .io-view__pin {
          display: flex;
          flex-direction: row;
          padding: 0 var(--spacing-sm);
          padding-right: var(--spacing-xl);
          font-size: var(--font-size-md);
          font-weight: 600;
          gap: var(--spacing-sm);
          overflow: hidden;
          align-items: center;
          background-color: var(--bg-table-row-odd);
      }

      .io-view__pin--even {
        background-color: var(--bg-table-row-even);
      }

      .io-view__pin:hover {
        background-color: var(--bg-hover);
      }

      @keyframes io-view-pulse {
          0% { box-shadow: 0 0 0 0 var(--blue, 0.1); }
          100% { box-shadow: 0 0 0 8px #0000; }
      }

      @keyframes io-view-pulse-err {
          0% { box-shadow: 0 0 0 0 var(--accent-ng, 0.1); }
        100% { box-shadow: 0 0 0 8px #0000; }
      }

      @keyframes io-view-pulse-manual {
          0% { box-shadow: 0 0 0 0px var(--accent-active, 1.0); }
          100% { box-shadow: 0 0 0 32px #0000; }
      }

      @keyframes io-view-pulse-manual-err {
          0% { box-shadow: 0 0 0 0px var(--accent-ng, 1.0); }
        100% { box-shadow: 0 0 0 32px #0000; }
      }
    </style>
  `;
  document.head.insertAdjacentHTML('beforeend', styles);
}

// Export both ways
window.IOViewer = IOViewer;
