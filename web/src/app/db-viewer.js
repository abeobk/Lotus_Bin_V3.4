const DBViewer = {
  // Component name
  name: 'DBViewer',

  // Declare props this component expects to receive
  props: {},

  // Reactive data
  data() {
    return {
      filters: {},
      filteredItems: [],
      filteredTotalHeight: 0,
      visibleStart: 0,
      visibleEnd: 0,
      topPadding: 0,
      bottomPadding: 0,
      lineHeight: 24,
      cachedLineHeight: null, // Cache actual measured line height
      headerHeight: 0,
      scrollTimeout: null,
      filterTimeout: null,
      rafId: null, // Add for requestAnimationFrame
      table: {
        name: 'DBViewer',
        cols: [],
        rows: [],
      },
      lastFilterState: null, // Cache last filter state
      isFiltering: false, // Add filtering state
      isRendering: false, // Add rendering state
      scrollTop: 0,
    };
  },

  // Template
  template: /*html*/ `
    <div class="db-viewer-container">
        <h3 class="db-viewer-title">
          <i class="fa fa-table"></i>&nbsp; Database Viewer
        </h3>
        <div class="db-table-container" ref="container" @scroll="handleScroll">
            <table class="db-table">
                <thead>
                    <tr class="db-header-row">
                      <th v-for="(col,index) in table.cols" :key="'F-'+index">
                      <div class = "db-header-cell">
                          <div class="db-header-row__title">
                            <span>{{col}}</span>
                            <span class = "db-filter-icon" :class="{ 'active': filters[col] }">
                              <i class= "fa fa-filter"></i>
                            </span>
                          </div>
                          <input
                            class="db-filter-input"
                            :class="{ 'disabled': !filters[col] }"
                            type="text"
                            v-model="filters[col]"
                            @input="onFilterChange"
                            :placeholder="'...'"
                            :title="'Filter by ' + col"
                          />
                          </div>
                      </th>
                    </tr>
                </thead>    
                <tbody>
                    <tr class="row-spacer" :style="{ height: topPadding + 'px' }"></tr>
                    <tr v-for="(row, rowIndex) in getVisibleRows()" 
                        :key="'R-'+rowIndex"
                        class="db-data-row"
                        :class="{ 'even-row': rowIndex % 2 === 0 }"
                    >   
                        <td 
                            v-for="(col, colIndex) in table.cols" 
                            class="db-data-cell"
                            :class="{ 'ng-res': col === 'res' && row[col] === 'NG', 'ok-res': col === 'res' && row[col] === 'OK' }"
                            :key="'c-'+colIndex+'-'+rowIndex"
                        >{{ row[col] || '-' }}</td>
                    </tr>
                    <tr class="row-spacer" :style="{ height: bottomPadding + 'px' }"></tr>
            </table>
        </div>
    </div>
  `,

  methods: {
    updateTable(data) {
      this.table = data;
      // Reset caches when table changes
      this.cachedLineHeight = null;
      this.headerHeight = 0;

      // Build search cache with underscore prefix
      this.table.rows.forEach((row) => {
        row._searchCache = {};
        this.table.cols.forEach((col) => {
          row._searchCache[col] = String(row[col] || '').toLowerCase();
        });
      });
      this.applyFilters();
    },

    getVisibleRows() {
      return this.filteredItems.slice(this.visibleStart, this.visibleEnd);
    },

    applyFilters() {
      // Create filter signature
      const filterSignature = this.table.cols
        .map((col) => `${col}:${this.filters[col] || ''}`)
        .join('|');

      // Skip if filters haven't changed
      if (this.lastFilterState === filterSignature) {
        this.isFiltering = false;
        return;
      }
      this.lastFilterState = filterSignature;

      // Only log in development
      // console.log('Applying filters:', this.filters);

      // Pre-compute normalized filters with active filter check
      const normalizedFilters = [];
      let hasActiveFilters = false;

      this.table.cols.forEach((col) => {
        const filterText = (this.filters[col] || '').trim().toLowerCase();
        if (filterText) {
          hasActiveFilters = true;
          normalizedFilters.push({ col, filter: filterText });
        }
      });

      // Fast path for no filters
      if (!hasActiveFilters) {
        this.filteredItems = this.table.rows;
      } else {
        // Only check columns that have active filters
        this.filteredItems = this.table.rows.filter((row) => {
          return normalizedFilters.every(({ col, filter }) => {
            return row._searchCache[col].includes(filter);
          });
        });
      }

      // Reset scroll position when filters change
      this.$nextTick(() => {
        const container = this.$refs.container;
        if (container) container.scrollTop = 0;
        this.render();
      });
    },

    render() {
      const container = this.$refs.container;
      if (!container || this.filteredItems.length === 0) {
        this.visibleStart = 0;
        this.visibleEnd = 0;
        this.topPadding = 0;
        this.bottomPadding = 0;
        return;
      }

      //compute header height once
      if (this.headerHeight === 0) {
        const headerRow = container.querySelector('thead tr.db-header-row');
        if (headerRow) {
          this.headerHeight = headerRow.offsetHeight;
        }
      }

      // Cache line height once after first visible row is rendered
      if (this.cachedLineHeight === null) {
        const dataRow = container.querySelector('tbody tr.db-data-row');
        if (dataRow) {
          this.cachedLineHeight = dataRow.offsetHeight;
        }
      }

      const lineHeight = this.cachedLineHeight || this.lineHeight;
      const containerHeight = container.offsetHeight;
      const scrollTop = container.scrollTop;
      this.scrollTop = scrollTop;
      if (containerHeight <= 0) return;

      // Calculate visible range with buffer
      let startIndex = Math.floor(scrollTop / lineHeight);
      startIndex = Math.max(0, startIndex);

      let endIndex =
        Math.ceil((scrollTop + containerHeight) / lineHeight) + 1;
      endIndex = Math.min(endIndex, this.filteredItems.length);

      const totalHeight = this.filteredItems.length * lineHeight;
      const topPadding = startIndex * lineHeight;
      const visibleHeight = (endIndex - startIndex) * lineHeight;
      const bottomPadding = Math.max( 0, totalHeight - topPadding - visibleHeight);

      this.visibleStart = startIndex;
      this.visibleEnd = endIndex;
      this.totalHeight = totalHeight;
      this.topPadding = topPadding;
      this.bottomPadding = bottomPadding;
      //keep scroll position after render to prevent jump
      this.$nextTick(() => {
        container.scrollTop = this.scrollTop;
      });
    },

    handleScroll() {
      // Cancel any pending render
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }

      // Use requestAnimationFrame for smooth 60fps rendering
      this.rafId = requestAnimationFrame(() => {
        this.render();
        this.rafId = null;
      });
    },

    onFilterChange() {
      if (this.filterTimeout) clearTimeout(this.filterTimeout);
      this.filterTimeout = setTimeout(() => {
        this.applyFilters();
      }, 300);
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
      this.updateTable(this.table);
    });
  },
  beforeUnmount() {
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
    if (this.filterTimeout) clearTimeout(this.filterTimeout);
    if (this.rafId) cancelAnimationFrame(this.rafId);
  },
};

//inject style
if (!document.querySelector('#db-view-styles')) {
  const styles = /*css*/ `
    <style id="db-view-styles">
        .db-viewer-container {
            margin: 0px;
            display: flex;
            flex-direction: column;
            flex: 1 1 auto;
            height: 100%;
        }
        .db-viewer-title {
            font-size: var(--font-size-lg);
            text-align: left;
            padding: 0.2rem 0.5rem;
            color: var(--text-primary);
        }
        .db-table-container {
            width: 100%;
            border-collapse: collapse;
            flex:1 1 auto;
            min-height:0;
            min-height:100px;
            overflow:auto;
        }
        .db-table {
            width: 100%;
            border-collapse: collapse;
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
        .db-header-row__title{
          display:flex;
          flex-direction:row;
          gap:6px;
          justify-content: left;
          align-items: center;
        }
        .db-header-row__title>:first-child{ flex:1; }

        .db-header-cell { 
            display: flex;
            flex-direction: column;
            text-align: center;
        }
        .db-filter-icon{color: var(--text-muted); }
        .db-filter-icon:hover{color: var(--accent-active); cursor:pointer; }
        .db-filter-icon.active{ color: var(--accent-ng); }

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
        .db-filter-input.disabled {
            background-color: var(--bg-secondary);
            color: var(--text-secondary);
            border:none;
        }

        .db-filter-input.disabled:hover{
            border: none;
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
        .row-spacer{padding:0;margin:0; width:100%;}
        .ng-res { color: var(--accent-ng) !important; }
        .ok-res { color: var(--accent-ok) !important; }

    </style>
  `;
  document.head.insertAdjacentHTML('beforeend', styles);
}

// Export both ways
window.DBViewer = DBViewer;
