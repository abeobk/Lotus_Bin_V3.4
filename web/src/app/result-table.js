const ResultTable = {
  name: 'ResultTable',
  props: {
    table: {
      type: Object,
      default: () => ({
        title: 'Result Table', 
        cols: [], //['name','x','y','z',...]
        rows: [], //[{name:{value:'part1',tag:'ok | ng | ...'},x:{value:10,tag:'ok'},...},...]
      }),
      validator: (value) => {
        return (
          typeof value === 'object' &&
          Array.isArray(value.cols) &&
          value.cols.length > 0 &&
          Array.isArray(value.rows)
        );
      },
    },
  },

  data() {
    return {
      copyState: 'idle',
      copyFeedbackTimer: null,
    };
  },

  computed: {
    copyLabel() {
      if (this.copyState === 'copied') return 'Copied! Paste into Excel';
      if (this.copyState === 'error') return 'Copy failed. Click to try again';
      return 'Copy table to Excel';
    },
  },

  template: /*html*/ `
    <div class="result-table">
      <h3 class="result-table__title">
        <span><i class="fa fa-table"></i>&nbsp;{{table.title }}</span>
        <button type="button" class="result-table__copy"
          :class="{ 'result-table__copy--copied': copyState === 'copied' }"
          :title="copyLabel" :aria-label="copyLabel"
          :disabled="copyState === 'copying'" @click="copyTable">
          <i class="fa" aria-hidden="true" :class="{
            'fa-copy': copyState === 'idle' || copyState === 'copying',
            'fa-check': copyState === 'copied',
            'fa-triangle-exclamation': copyState === 'error'
          }"></i>
        </button>
        <span class="result-table__copy-feedback" role="status">{{copyState === 'copied' || copyState === 'error' ? copyLabel : ''}}</span>
      </h3>
      <table class="result-table__table" ref="resultTable">
        <thead>
          <tr class="result-table__header">
            <!-- Status icon column header -->
            <th class="result-table__cell result-table__cell--header">
              <i class="fa fa-info-circle"></i>
            </th>
            <th v-for="(col,index) in table.cols" 
              :key="'C-'+index"
              class="result-table__cell result-table__cell--header">{{col}}</th>
          </tr>
        </thead>

        <tbody>
          <tr 
            v-for="(row, rowIndex) in table.rows" 
            :key="'R-'+rowIndex"
            class="result-table__row"
            :class="{ 'result-table__row--even': rowIndex % 2 === 0 }"
          >
            <td class="result-table__cell">
              <i class="fa " :class="{
                'fa-circle-check': row.name && row.name.tag.toLowerCase() === 'ok', 
                'fa-circle-exclamation': row.name && row.name.tag.toLowerCase() === 'ng',
                'fa-hourglass': !row.name.tag || row.name.tag === '',
                'fa-spinner fa-spin': row.name.tag === '...',
                'result-table__status--ng': row.name && row.name.tag.toLowerCase() === 'ng',
                'result-table__status--ok': row.name && row.name.tag.toLowerCase() === 'ok',
              }"></i>
            </td>
            <td 
              v-for="(col, colIndex) in table.cols" 
              :key="'c-'+colIndex+'-'+rowIndex"
              class="result-table__cell"
              :class="{ 
                'result-table__cell--ng': col!='name' && row[col] && row[col].tag.toLowerCase() === 'ng'
              }"
            >
              {{ (row[col]? row[col].value : '-') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,

  methods: {
    getClipboardContent() {
      const source = this.$refs.resultTable;
      const clone = source.cloneNode(true);
      const styleProperties = [
        'color', 'background-color', 'font-family', 'font-size', 'font-weight',
        'font-style', 'text-align', 'vertical-align', 'padding', 'width', 'height',
        'border-top', 'border-right', 'border-bottom', 'border-left',
        'border-collapse', 'border-spacing', 'white-space', 'box-sizing',
      ];
      // Resolve theme variables and inherited styles before leaving the page.
      const originals = [source, ...source.querySelectorAll('tr, th, td')];
      const copies = [clone, ...clone.querySelectorAll('tr, th, td')];
      originals.forEach((element, index) => {
        const style = getComputedStyle(element);
        copies[index].removeAttribute('class');
        styleProperties.forEach((property) => {
          copies[index].style.setProperty(property, style.getPropertyValue(property));
        });
      });

      const textRows = Array.from(source.rows, (row, rowIndex) => {
        return Array.from(row.cells, (cell, colIndex) => {
          const copiedCell = clone.rows[rowIndex].cells[colIndex];
          let text = cell.textContent.trim();
          const icon = cell.querySelector('i');
          if (colIndex === 0) {
            // Icon fonts are unavailable in Excel; keep the status as readable text.
            text = rowIndex === 0 ? 'STATUS'
              : icon?.classList.contains('fa-circle-check') ? 'OK'
              : icon?.classList.contains('fa-circle-exclamation') ? 'NG'
              : icon?.classList.contains('fa-spinner') ? '...'
              : 'PENDING';
            if (icon) copiedCell.style.color = getComputedStyle(icon).color;
          } else if (getComputedStyle(cell).textTransform === 'uppercase') {
            text = text.toUpperCase();
          }
          copiedCell.textContent = text;
          // Excel needs cell backgrounds, since it may ignore row backgrounds.
          copiedCell.style.backgroundColor = getComputedStyle(row).backgroundColor;
          if (rowIndex > 0) {
            const isNumber = this.table.cols[colIndex - 1] !== 'name'
              && /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(text);
            const decimals = text.split('.')[1]?.length || 0;
            const numberFormat = isNumber
              ? (decimals ? '0.' + '0'.repeat(decimals) : '0') : '\\@';
            // CSSOM drops Office-specific properties, so append this to the markup.
            copiedCell.setAttribute('style', copiedCell.getAttribute('style')
              + ';mso-number-format:"' + numberFormat + '"');
          }
          return text.replace(/[\t\r\n]+/g, ' ');
        }).join('\t');
      });
      return {
        html: '<html><head><meta charset="utf-8"></head><body>' + clone.outerHTML + '</body></html>',
        text: textRows.join('\r\n'),
      };
    },

    copyWithEvent(content) {
      // Support embedded WebViews or contexts without the async Clipboard API.
      let copied = false;
      const onCopy = (event) => {
        if (!event.clipboardData) return;
        event.clipboardData.setData('text/html', content.html);
        event.clipboardData.setData('text/plain', content.text);
        event.preventDefault();
        copied = true;
      };
      document.addEventListener('copy', onCopy);
      try {
        return document.execCommand('copy') && copied;
      } finally {
        document.removeEventListener('copy', onCopy);
      }
    },

    async copyTable() {
      if (this.copyState === 'copying') return;
      clearTimeout(this.copyFeedbackTimer);
      this.copyState = 'copying';
      try {
        const content = this.getClipboardContent();
        let copied = false;
        if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
          try {
            await navigator.clipboard.write([new ClipboardItem({
              'text/html': new Blob([content.html], { type: 'text/html' }),
              'text/plain': new Blob([content.text], { type: 'text/plain' }),
            })]);
            copied = true;
          } catch {
            // Try the synchronous rich-text copy path if clipboard access is denied.
          }
        }
        if (!copied) copied = this.copyWithEvent(content);
        this.copyState = copied ? 'copied' : 'error';
      } catch {
        this.copyState = 'error';
      }
      this.copyFeedbackTimer = setTimeout(() => {
        this.copyState = 'idle';
        this.copyFeedbackTimer = null;
      }, 2000);
    },
  },

  beforeUnmount() {
    clearTimeout(this.copyFeedbackTimer);
  },
};

// Inject styles using the same pattern as cycle-info-card
if (!document.querySelector('#result-table-styles')) {
  const styles = /*css*/ `
    <style id="result-table-styles">
      .result-table {
        overflow: auto;
        flex: 1 1 min-content; /* allow to shrink to fit content */
        min-width:min-content;
        max-height:min-content;
        background-color: var(--bg-secondary);
        border-radius: var(--spacing-sm);
        border: 1px solid var(--border-color);
        box-shadow: 0 2px 4px var(--shadow-color);
      }

      .result-table__title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-sm);
        text-align: left;
        text-transform: uppercase;
        font-weight: 600;
        padding-left: 0.5rem;
        background-color: var(--bg-title);
      }

      .result-table__copy {
        flex: 0 0 auto;
        width: 1.8rem;
        height: 1.8rem;
        margin: 0 var(--spacing-xs);
      }

      .result-table__copy--copied { color: var(--accent-ok); }
      .result-table__copy:disabled { cursor: wait; }
      .result-table__copy:focus-visible { outline: 1px solid var(--accent-active); }

      .result-table__copy-feedback {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }

      .result-table__table {
        min-width:min-content;
        table-layout: auto;
        width: 100%;
        font-weight: 500;
        font-size: 1rem;
        border-collapse: collapse;
        text-transform: uppercase;
        white-space: nowrap;
        overflow: hidden;
      }

      .result-table__header {
        background-color: var(--bg-table-header);
        border-top: 1px solid var(--border-color);
        border-bottom: 1px solid var(--border-color);
        color: var(--text-primary);
        height: 1.8rem;
      }

      .result-table__cell--header {
        text-align: right;
        padding: 0.25rem 0.5rem 0;
        border-right: 1px solid var(--border-color);
      }

      .result-table__cell--header:first-child { max-width: 1rem; }
      .result-table__cell--header:nth-child(2) { text-align: left; }
      .result-table__cell--header:last-child { border-right: none; }
      .result-table__row { background-color: var(--bg-table-row-odd); }
      .result-table__row:last-child .result-table__cell { border-bottom: none; }
      .result-table__row--even { background-color: var(--bg-table-row-even); }
      .result-table__row:hover { background-color: var(--bg-hover); }
      .result-table__row--even:hover { background-color: var(--bg-hover); }

      .result-table__cell {
        color: var(--text-primary);
        text-align: right;
        while-space: nowrap;
        padding: 0 0.5rem;
        width: 7rem;
        border-right: 1px solid var(--border-color);
      }

      .result-table__cell:nth-child(1) { width: 1rem; }
      .result-table__cell:nth-child(2) { text-align: left; }
      .result-table__cell:last-child { border-right: none; }

      .result-table__cell--ng,
      .result-table__status--ng { color: var(--accent-ng) !important; }
      .result-table__status--ok { color: var(--accent-ok) !important; }
    </style>
  `;
  document.head.insertAdjacentHTML('beforeend', styles);
}

window.ResultTable = ResultTable;
