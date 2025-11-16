const HistoryTable = {
  name: 'HistoryTable',
  props: {},
  // Reactive data
  data() {
    return {
      table: {
        title: 'Production History',cols:[],rows:[],
      },
      colWidths: [],
      filteredItems: [],
      filteredTotalHeight: 0,
      topPadding: 0,
      bottomPadding: 0,
      visibleStart: 0,
      visibleEnd: 0,
      lineHeight: 16,
      cachedLineHeight: null, // Cache actual measured line height
      showNGOnly: false,
      scrollTimeout: null,
      rafId: null, // Add for requestAnimationFrame
      scrollTop: 0,
      headerWidths: [], // Store header column widths
      resizeObserver: null, // ResizeObserver instance
    };
  },

  computed: {},

  template: /*html*/ `
  <div class="history-table-container">
    <table class="history-table history-table-header" ref="headerTable">
      <thead>
        <tr class="table-header">
          <th v-for="(col,colIndex) in table.cols" :key="'C-'+colIndex"
              :style="{ width: headerWidths[colIndex] ? headerWidths[colIndex] + 'px' : 'auto' }">
            <span v-if="col=='time'"><i class="fa fa-clock"></i> {{col}}</span>
            <span v-else-if="col=='model'"><i class="fa fa-car"></i> {{col}}</span>
            <span v-else-if="col=='body'"><i class="fa fa-tag"></i> {{col}}</span>
            <span v-else-if="col=='seq'"><i class="fa fa-hashtag"></i> {{col}}</span>
            <span v-else-if="col!=='res'">{{col}}</span>
          </th>
          <th class="filter-column" :style="{ width: headerWidths[table.cols.length] ? headerWidths[table.cols.length] + 'px' : '3rem' }">
            <i class="fa fa-filter filter-icon" @click="toggleFilter"></i>
          </th>
        </tr>
      </thead>
    </table>
    <div class="table-content" ref="container" @scroll="handleScroll">
      <table class="history-table history-table-body" ref="bodyTable">
        <tbody>
          <tr class="row-spacer" :style="{ height: topPadding + 'px' }"></tr>
          <tr v-for="(row, rowIndex) in getVisibleRows()" 
            :key="'R-'+visibleStart+rowIndex"
            class="table-row"
            :class="{ 'even-row': rowIndex % 2 === 0 }"
          >
            <td v-for="(col,colIndex) in table.cols" :key="'C-'+colIndex" class="table-cell">
              <span v-if="col!=='res'">{{row[col]}}</span>
            </td>
            <td class="table-cell res-cell-container filter-column">
              <i class="fa res-cell" :class="{
                'fa-circle-check': row.res && row.res.toLowerCase() === 'ok', 
                'fa-circle-exclamation': row.res && row.res.toLowerCase() === 'ng',
                'fa-spinner fa-spin': !row.res || !row.res || row.res === '',
                'ng-res': row.res && row.res.toLowerCase() === 'ng',
                'ok-res': row.res && row.res.toLowerCase() === 'ok',
              }"></i>
            </td>
          </tr>
          <tr class="row-spacer" :style="{ height: bottomPadding + 'px' }"></tr>
        </tbody>
      </table>
    </div>
  </div>
`,

  methods: {
    updateTable(data) {
      this.table = data;
      //change time column text
      this.showNGOnly = false; // Reset filter when new data is loaded
      this.$emit('show-ng-only', this.showNGOnly);
      this.filterItem();
      this.$nextTick(() => {
        this.render();
        //scroll to top
        this.scrollToTop();
      });
    },
    filterItem() {
      if (!this.table || !this.table.rows || this.table.rows.length === 0)
        return;

      this.filteredItems = [];
      this.filteredItems = this.showNGOnly
        ? this.table.rows.filter(
            (row) => row.res && row.res.toLowerCase() === 'ng'
          )
        : this.table.rows;
      this.filteredTotalHeight = this.filteredItems.length * this.lineHeight;
      this.render();
      this.$emit('show-ng-only', this.showNGOnly);
      // console.log('Filtered items:', this.filteredItems.length);
    },
    toggleFilter() {
      this.showNGOnly = !this.showNGOnly;
      // console.log('Show NG Only: ', this.showNGOnly);
      this.filterItem();
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

    // Update visible range for virtual scrolling with dynamic heights
    render() {
      const container = this.$refs.container;
      if (!container || this.filteredItems.length === 0) {
        this.visibleStart = 0;
        this.visibleEnd = 0;
        this.topPadding = 0;
        this.bottomPadding = 0;
        return;
      }

      // Cache line height once after first visible row is rendered
      if (this.cachedLineHeight === null) {
        const dataRow = container.querySelector('tbody tr.table-row');
        if (dataRow) {
          this.cachedLineHeight = dataRow.offsetHeight;
        }
      }

      const lineHeight = this.cachedLineHeight || this.lineHeight;
      const containerHeight = container.offsetHeight; // Visible height
      const scrollTop = container.scrollTop;
      this.scrollTop = scrollTop;
      if (containerHeight <= 0) return;

      // Calculate visible range based on actual scroll position
      let startIndex = Math.floor(scrollTop / lineHeight);
      startIndex = Math.max(0, startIndex);

      let endIndex = Math.ceil((scrollTop + containerHeight) / lineHeight) + 1;
      endIndex = Math.min(endIndex, this.filteredItems.length);

      const totalHeight = this.filteredItems.length * lineHeight;
      this.topPadding = startIndex * lineHeight;
      const visibleHeight = (endIndex - startIndex) * lineHeight;
      this.bottomPadding = Math.max(0, totalHeight - this.topPadding - visibleHeight);
      
      this.visibleStart = startIndex;
      this.visibleEnd = endIndex;
      
      // Sync header widths with body column widths
      this.syncColumnWidths();
      
      //keep scroll position after render to prevent jump
      this.$nextTick(() => {
        container.scrollTop = this.scrollTop;
      });
    },

    syncColumnWidths() {
      // Get actual widths from body table cells
      this.$nextTick(() => {
        const bodyTable = this.$refs.bodyTable;
        if (!bodyTable) return;

        const firstRow = bodyTable.querySelector('tbody tr.table-row');
        if (!firstRow) return;

        const cells = firstRow.querySelectorAll('td');
        const widths = [];
        cells.forEach(cell => {
          widths.push(cell.offsetWidth);
        });

        this.headerWidths = widths;
      });
    },

    getVisibleRows() {
      return this.filteredItems.slice(this.visibleStart, this.visibleEnd);
    },
    scrollToTop() {
      const container = this.$refs.container;
      if (container) container.scrollTop = 0;
    },
  },
  mounted() {
    if(window.chrome.webview)return;
    this.$nextTick(() => {
      this.updateTable(SampleData.generateHistoryData());
      
      // Setup ResizeObserver to sync column widths on resize
      if (this.$refs.container) {
        this.resizeObserver = new ResizeObserver(() => {
          this.syncColumnWidths();
        });
        this.resizeObserver.observe(this.$refs.container);
      }
    });
  },
  // Cleanup to prevent memory leaks
  beforeUnmount() {
    this.filteredItems.length = 0;
    this.table = null;
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  },
};

// Inject styles using the same pattern as cycle-info-card
if (!document.querySelector('#history-table-styles')) {
  const styles = /*css*/ `
    <style id="history-table-styles">
      .history-table-container {
        display: flex;
        flex-direction: column;
        flex:1;
        min-height: 150px;
        border-top:1px solid var(--border-color);
      }

      .table-title{
        text-align:left;
        text-transform:uppercase;
        font-weight:600;
        padding-left:0.5rem;
        background-color:var(--bg-tertiary);
      }

      .table-content{
        font-weight: 500;
        font-size: var(--font-size-md);
        text-transform: uppercase;
        white-space: nowrap;
        overflow-y:auto;
        overflow-x: hidden;
        flex:1;
        position: relative;
        min-height:100px;
        min-width: 100%;
      }

      .history-table {
        width: 100%;
        border-collapse: collapse;
      }

      .history-table-header {
        table-layout: fixed;
      }

      .history-table-body {
        table-layout: auto;
      }

      .table-header{
        background-color:var(--bg-table-header);
        text-transform:uppercase;
        font-weight:600;
      }

      .history-table th {
        padding: 0 var(--spacing-sm);
        background-color: var(--bg-table-header);
        color: var(--text-primary);
        font-weight: 600;
        text-transform: uppercase;
        text-align: center;
        border-bottom: 1px solid var(--border-color);
      }

      .filter-column {
        width: 3rem !important;
        min-width: 3rem !important;
        max-width: 3rem !important;
      }

      .table-row{
        background-color:var(--bg-table-row-odd);
        line-height:16px;
      }
      .table-row.even-row { background-color: var(--bg-table-row-even); }
      .table-row:hover { background-color: var(--bg-hover); } 

      .history-table td {
        padding: 0 var(--spacing-sm);
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        height: 16px;
      }

      .ng-res{ color: var(--accent-ng) !important; }
      .ok-res { color: var(--accent-ok) !important; }
      .row-spacer{padding:0;margin:0; width:100%;}
      .res-cell{width:1rem;}
      .res-cell-container {
        text-align: center !important;
      }
      .filter-icon{ cursor:pointer; }
      .filter-icon:hover{ color:var(--accent-ng); }
    </style>
  `;
  document.head.insertAdjacentHTML('beforeend', styles);
}

window.HistoryTable = HistoryTable;
