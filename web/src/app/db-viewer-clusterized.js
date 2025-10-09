const DBViewer = {
  // Component name
  name: 'DBViewer',

  // Declare props this component expects to receive
  props: {},

  // Reactive data
  data() {
    return {
      filters: {}, //object of filter strings for each column
      filteredItems: [],
      table: {
        name: 'DBViewer',
        cols: [], //collection of column names
        rows: [], //collection of row objects
      },
      clusterize: null, // Clusterize.js instance
      columnWidths: [], // Cache column widths
      syncTimeout: null,
      scrolling: false,
      columnStyleTag: null,
    };
  },

  // Template
  template: /*html*/ `
  <div class="db-viewer-container">
      <h3 class="db-viewer-title">Database Viewer</h3>
      <div class="db-table-container" ref="container">
          <div class="db-header-wrapper" ref="headerWrapper" @scroll="onHeaderScroll">
            <table class="db-table">
                <thead>
                    <tr class="db-header-row">
                      <th v-for="(col,index) in table.cols" :key="'F-'+index">
                      <div class = "db-header-cell">
                          {{col}}
                          <input
                            class="db-filter-input"
                            type="text"
                            v-model="filters[col]"
                            @input="onFilterChange"
                            :title="'Filter by ' + col"
                          />
                          </div>
                      </th>
                    </tr>
                </thead>
            </table>
          </div>
          <div ref="clusterizeScroll" class="clusterize-scroll" @scroll="onBodyScroll">
            <table class="db-table">
              <tbody ref="clusterizeContent" class="clusterize-content"></tbody>
            </table>
          </div>
      </div>
  </div>
`,

  computed: {
    filteredRows() {},
  },
  // Methods
  methods: {
    updateTable(data) {
      this.table = data;
      this.applyFilters();
    },
    getRowHtml(row, rowIndex) {
      // Render a single row as HTML string for Clusterize
      const evenClass = rowIndex % 2 === 0 ? 'even-row' : '';
      let tds = this.table.cols.map((col, colIndex) => {
        let val = row[col] || '-';
        let tdClass = 'db-data-cell';
        if (col === 'res') tdClass += val === 'NG' ? ' ng-res' : ' ok-res';
        return `<td class="${tdClass}" key="c-${colIndex}-${rowIndex}">${val}</td>`;
      }).join('');
      return `<tr class="db-data-row ${evenClass}" key="R-${rowIndex}">${tds}</tr>`;
    },
    renderClusterize() {
      const rowsHtml = this.filteredItems.map((row, idx) => this.getRowHtml(row, idx));
      if (this.clusterize) {
        this.clusterize.update(rowsHtml);
        // Force sync immediately after update
        this.$nextTick(() => {
          this.syncColumnWidths();
        });
      }
    },
    applyFilters() {
      // Filter logic: each filter must match (case-insensitive, substring)
      console.log('Applying filters:', this.filters);
      //make sure filters is defined for all columns
      const filters = this.filters;
      this.table.cols.forEach((col) => {
        if (!(col in filters)) filters[col] = '';
        else filters[col] = filters[col].trim().toLowerCase();
      });

      this.filteredItems = this.table.rows.filter((row) => {
        return this.table.cols.every((col) => {
          const filter = filters[col];
          if (!filter) return true;
          return String(row[col]).toLowerCase().includes(filter);
        });
      });
      this.$nextTick(() => {
        this.renderClusterize();
      });
    },
    onFilterChange() {
      if (this.filterTimeout) clearTimeout(this.filterTimeout);
      this.filterTimeout = setTimeout(() => {
        this.applyFilters();
      }, 300);
    },
    onHeaderScroll() {
      if (this.scrolling) return;
      this.scrolling = true;
      this.$refs.clusterizeScroll.scrollLeft = this.$refs.headerWrapper.scrollLeft;
      requestAnimationFrame(() => {
        this.scrolling = false;
      });
    },
    onBodyScroll() {
      if (this.scrolling) return;
      this.scrolling = true;
      this.$refs.headerWrapper.scrollLeft = this.$refs.clusterizeScroll.scrollLeft;
      requestAnimationFrame(() => {
        this.scrolling = false;
      });
    },
    syncColumnWidths() {
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        const headerTable = this.$refs.headerWrapper?.querySelector('.db-table');
        const bodyTable = this.$refs.clusterizeScroll?.querySelector('.db-table');
        
        if (!headerTable || !bodyTable) return;

        const headerCells = headerTable.querySelectorAll('th');
        const firstBodyRow = bodyTable.querySelector('tr.db-data-row');
        
        if (!firstBodyRow || headerCells.length === 0) return;
        
        const bodyCells = firstBodyRow.querySelectorAll('td');
        
        // Batch read all widths first
        const widths = [];
        headerCells.forEach((th, index) => {
          if (bodyCells[index]) {
            const headerWidth = th.offsetWidth;
            const bodyWidth = bodyCells[index].offsetWidth;
            widths[index] = Math.max(headerWidth, bodyWidth);
          }
        });
        
        this.columnWidths = widths;
        
        // Batch write all widths
        headerCells.forEach((th, index) => {
          const width = widths[index];
          if (width) {
            th.style.width = width + 'px';
            th.style.minWidth = width + 'px';
            th.style.maxWidth = width + 'px';
          }
        });
        
        // Apply to all body cells in this column
        bodyCells.forEach((td, index) => {
          const width = widths[index];
          if (width) {
            // Use nth-child to target all cells in column
            const style = document.createElement('style');
            style.textContent = `.clusterize-content tr td:nth-child(${index + 1}) { width: ${width}px; min-width: ${width}px; max-width: ${width}px; }`;
            if (this.columnStyleTag) this.columnStyleTag.remove();
            document.head.appendChild(style);
            this.columnStyleTag = style;
          }
        });
      });
    },
  },
  mounted() {
    this.table.cols = [
      'id',
      'time',
      'model',
      'vin',
      'seq',
      'res',
      'fit',
      'ovl',
      'x',
      'y',
      'z',
      'rx',
      'ry',
      'rz',
      'dir',
    ];
    //randomize 100000 rows
    for (let i = 1; i <= 10000; i++) {
      this.table.rows.push({
        id: i,
        time: new Date(Date.now() - i * 60000).toLocaleString(),
        model: 'Model ' + ((i % 5) + 1),
        vin: 'VIN' + (1000 + i),
        seq: 'SEQ' + (2000 + i),
        res: i % 2 === 0 ? 'OK' : 'NG',
        fit: (Math.random() * 10).toFixed(2),
        ovl: (Math.random() * 5).toFixed(2),
        x: (Math.random() * 100).toFixed(2),
        y: (Math.random() * 100).toFixed(2),
        z: (Math.random() * 100).toFixed(2),
        rx: (Math.random() * 360).toFixed(2),
        ry: (Math.random() * 360).toFixed(2),
        rz: (Math.random() * 360).toFixed(2),
        //dir is directory path
        dir: '/path/to/data/' + (1000 + i),
      });
    }

    this.$nextTick(() => {
      // Initialize Clusterize.js
      this.clusterize = new window.Clusterize({
        rows: [],
        scrollElem: this.$refs.clusterizeScroll,
        contentElem: this.$refs.clusterizeContent,
        no_data_text: '',
        rows_in_block: 50, // Optimize cluster size
        blocks_in_cluster: 4, // Optimize number of blocks
        callbacks: {
          clusterChanged: () => {
            // Always sync on cluster change
            this.syncColumnWidths();
          }
        }
      });
      this.applyFilters();
      
      // Sync on window resize with debounce
      let resizeTimeout;
      window.addEventListener('resize', () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.columnWidths = []; // Clear cache on resize
          this.syncColumnWidths();
        }, 200);
      });
    });
  },
};

//inject style
if (!document.querySelector('#db-view-styles')) {
  const styles = /*css*/ `
    <style id="db-view-styles">
        .db-viewer-container {
            margin: 0px;
            padding: 5px;
            display: flex;
            flex-direction: column;
            flex: 1 1 auto;
            height: 100%;
        }
        .db-viewer-title {
            font-size: var(--font-size-lg);
            margin-bottom: 10px;
            text-align: center;
            color: var(--text-primary);
        }
        .db-table-container {
            width: 100%;
            border-collapse: collapse;
            min-height: 0;
            flex: 1 1 auto;
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        .db-header-wrapper {
            overflow-x: auto;
            overflow-y: hidden;
            width: 100%;
        }
        .clusterize-scroll {
            flex: 1 1 auto;
            height: 100%;
            max-height: 100%;
            overflow: auto;
        }

        .db-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

       .db-header-row {
            background-color: var(--bg-table-header);
            color: var(--text-primary);
            font-weight: 600;
            text-transform: uppercase;
            position: sticky;
            top: 0;
            z-index: 1;
        }
        .db-header-cell { 
            display: flex;
            flex-direction: column;
            text-align: center;
        }
        .db-filter-input {
            width: 100%;
            padding: 2px 4px;
            font-size: 0.95em;
            border: 1px solid var(--border-color);
            border-radius: 3px;
            box-sizing: border-box;
            background-color: var(--bg-primary);
            color: var(--text-primary);
        }
        .db-filter-input:focus {
            background-color: var(--bg-secondary);
            border: 1px solid var(--accent-active);
            outline:none;
        }
        .db-filter-input:hover{
            border: 1px solid var(--accent-active);
        }

        .db-table th, .db-table td {
            padding: 2px 4px;
            text-align: center;
            border: 1px solid var(--border-color);
        }
        .db-table th {
            background-color: var(--bg-table-header);
            color: var(--text-primary);
            font-weight: 600;
            text-transform: uppercase;
            user-select: text;
        }
        .db-table td { 
            text-align: right; 
            padding: 0px 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            user-select: text;
            height: 24px;
        }
        .db-table .even-row {
            background-color: var(--bg-table-row-even);
        }
        .db-table .db-data-row:hover {
            background-color: var(--bg-hover);
        }
        .row-spacer{width:100%;}
        .ng-res { color: var(--accent-ng) !important; }
        .ok-res { color: var(--accent-ok) !important; }

    </style>
  `;
  document.head.insertAdjacentHTML('beforeend', styles);
}

// Export both ways
window.DBViewer = DBViewer;
