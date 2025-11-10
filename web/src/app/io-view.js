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
    <div class="io-view-container">
      <div class="io-view-title">{{title}}</div>
      <div class="io-map-container">
        <div class="io-column">
            <div class="io-header">
                <span class="io-badge" :class="{ active: readFlashTimeout}">R</span>
                <span>INPUT</span>
            </div>
            <div id="io-input" class="io-column-content">
                <div class="pin-row" v-for="pin in ioInputs" :key="pin.Name"
                    @dblclick="onInputPinDblClick(pin)">
                    <span class="pin-badge"
                        :class="{ active: pin.isActive, err: pin.isErr, manual: pin.isManual }">{{pin.Index}}</span>
                    <span>{{pin.Text !== "" ? pin.Text : pin.Name}}</span>
                </div>
            </div>
        </div>

        <div class="io-column">
            <div class="io-header">
                <span class="io-badge" :class="{ active: writeFlashTimeout}">W</span>
                <span>OUTPUT</span>
            </div>
            <div id="io-output" class="io-column-content">
                <div class="pin-row" v-for="pin in ioOutputs" :key="pin.Name"
                    @dblclick="onOutputPinDblClick(pin)">
                    <span class="pin-badge"
                        :class="{ active: pin.isActive, err: pin.isErr, manual: pin.isManual }">{{pin.Index}}</span>
                    <span>{{pin.Text !== "" ? pin.Text : pin.Name}}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  `,

  // Methods
  methods: {
    setIOMap(title, iomap) {
      if (!iomap) return;
      this.title = title;
      console.log('Setup io pinmap:', iomap);
      const err_keys = ['HW_ERR', 'FAULT', 'FAULTY', 'NG'];
      const err_suffix = ['_ERR', '_NG'];
      this.ioInputs = iomap
        .filter((pin) => pin.Function == 'DI')
        .map((pin) => ({
          ...pin,
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
        .map((pin) => ({
          ...pin,
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
      .io-view-container{
        display:flex;
        min-width:fit-content;
        max-width:fit-content;
        flex-direction:column;
        background-color: var(--bg-primary);
        border: 1px solid var(--border-color);
        flex:1;
        height:fit-content;
        overflow:hidden;
        border-radius: var(--spacing-sm);
        box-shadow: 0 2px 4px var(--shadow-color);
      }
      .io-map-container{
        display:flex;
        flex-direction:row;
        height:100%;
      }
      .io-view-title{
        background-color:var(--bg-tertiary);
        padding: var(--spacing-xs);
        font-weight:600;
        font-size:var(--font-size-lg);
        border-bottom:1px solid var(--border-color);
        text-align:center;
      }

      .io-column{
        display:flex;
        flex-direction:column;
        width:100%;
        overflow:hidden;
        background-color: var(--bg-primary);
        min-height:fit-content;
       }
       .io-column:first-of-type{ border-right:1px solid var(--border-color); }
      
      .io-header{
        display:flex;
        flex-direction:row;
        align-items:center;
        background-color:var(--bg-table-header);
        padding: var(--spacing-xs);
        gap: var(--spacing-md);
        border-bottom:1px solid var(--border-color);
        font-weight:600;
        font-size:var(--font-size-lg);
      }
      .io-badge, .pin-badge {
        display: flex;
        min-width: var(--badge-size);
        max-width: var(--badge-size);
        min-height: var(--badge-size);
        max-height: var(--badge-size);
        font-size: var(--font-size-sm);
        border: 1px solid var(--border-color);
        background-color: var(--bg-secondary);
        border-radius: 1rem;
        font-weight: 600;
        align-items: center;
        justify-content: center;
      }

      .io-badge.active{ animation: io-flash 0.05s 1; }

      @keyframes io-flash {
          0% { background-color: var(--bg-primary); }
          100% { background-color: var(--accent-active); }
      }

      .io-column-content{ overflow-y:auto; }

      .pin-row {
          display: flex;
          flex-direction: row;
          padding: 0 var(--spacing-sm);
          padding-right: var(--spacing-xl);
          font-size: var(--font-size-md);
          font-weight: 600;
          gap: var(--spacing-sm);
          overflow: hidden;
          align-items:center;
          border-bottom: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
      }

      .pin-row:hover { background-color: var(--bg-tertiary); }

      .pin-badge.active {
          background-color: var(--blue);
          color: var(--base03);
          border: none;
          animation: pulse-pin 0.5s 2;
      }

      .pin-badge.active.err {
          background-color: var(--accent-ng);
          animation: pulse-err-pin 0.5s 2;
      }

      .pin-badge.manual { animation: manual-pulse-pin 0.5s 1; }
      .pin-badge.err.manual { animation: manual-pulse-err-pin 0.5s 1; }
      .pin-badge.active.manual { animation: manual-pulse-pin 0.5s 1; }
      .pin-badge.active.err.manual { animation: manual-pulse-err-pin 0.5s 1; }

      @keyframes pulse-pin {
          0% { box-shadow: 0 0 0 0 var(--blue, 0.1); }
          100% { box-shadow: 0 0 0 4px #0000; }
      }

      @keyframes pulse-err-pin {
          0% { box-shadow: 0 0 0 0 var(--accent-ng, 0.1); }
        100% { box-shadow: 0 0 0 4px #0000; }
      }

      @keyframes manual-pulse-pin {
          0% { box-shadow: 0 0 0 0 var(--accent-active, 0.1); }
          100% { box-shadow: 0 0 0 4px #0000; }
      }

      @keyframes manual-pulse-err-pin {
          0% { box-shadow: 0 0 0 0 var(--accent-ng, 0.1); }
        100% { box-shadow: 0 0 0 4px #0000; }
      }
    </style>
  `;
  document.head.insertAdjacentHTML('beforeend', styles);
}

// Export both ways
window.IOViewer = IOViewer;
