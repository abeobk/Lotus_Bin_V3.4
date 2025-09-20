const HistoryTable = {
  name: 'HistoryTable',
  props: {},
  // Reactive data
  data() {
    return {
      table: { title: 'Production History', cols: [], rows: [] },
      filteredItems: [],
      filteredTotalHeight: 0,
      topPadding: 0,
      bottomPadding: 0,
      visibleStart: 0,
      visibleEnd: 0,
      lineHeight: 16,
      showNGOnly: false,
    };
  },

  computed: {},

  template: /*html*/ `
  <div class="history-table-container">
    <h3 style="text-align:center;text-transform:uppercase;">{{ table.title }}</h3>

    <div class="table-header" >
     <span v-for="(col,index) in table.cols" :key="'C-'+index">{{col}}</span>
     <i class="fa fa-filter filter-icon" @click="toggleFilter"></i>
    </div>

    <div class="table-content" ref="container" 
      @scroll="handleScroll"
    >
      <div class="table-content-scrollarea" :style="{ height: filteredTotalHeight + 'px' }">
        <div class="row-spacer" :style="{ height: topPadding + 'px' }"></div>
        <div class="table-row" v-for="(row, rowIndex) in getVisibleRows()" 
          :key="'R-'+visibleStart+rowIndex"
          :class="{ 'even-row': rowIndex % 2 === 0 }"
        >
          <span v-for="(col,colIndex) in table.cols" :key="'C-'+colIndex">{{row[col]}}</span>
          <i class="fa " :class="{
            'fa-circle-check': row.res && row.res.toLowerCase() === 'ok', 
            'fa-circle-exclamation': row.res && row.res.toLowerCase() === 'ng',
            'fa-spinner fa-spin': !row.res || !row.res || row.res === '',
            'ng-res': row.res && row.res.toLowerCase() === 'ng',
            'ok-res': row.res && row.res.toLowerCase() === 'ok',
          }"></i>
        </div>
      </div>
    </div>
  </div>
`,

  methods: {
    updateTable(data) {
      this.table = data;
      //change time column text
      this.filterItem();
      this.render();
      this.showNGOnly = false; // Reset filter when new data is loaded
      this.$emit('show-ng-only', this.showNGOnly);
      // console.log('History table updated:', this.table.rows.length, 'rows');
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
      // Debounce scroll updates to prevent rapid recalculation
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
      this.scrollTimeout = setTimeout(() => {
        this.render();
      }, 16);
    },

    // Update visible range for virtual scrolling with dynamic heights
    render() {
      const container = this.$refs.container;
      if (!container || this.filteredItems.length === 0) {
        this.visibleStart = 0;
        this.visibleEnd = 0;
        return;
      }

      const containerHeight = container.offsetHeight; // Visible height
      const scrollTop = container.scrollTop;
      if (containerHeight <= 0) return;

      // Calculate visible range based on actual scroll position
      let startIndex = Math.floor(scrollTop / this.lineHeight);
      startIndex = Math.max(0, startIndex);

      let endIndex = Math.ceil((scrollTop + containerHeight) / this.lineHeight);
      endIndex = Math.min(endIndex, this.filteredItems.length);

      this.topPadding = startIndex * this.lineHeight;
      const visibleHeight = (endIndex - startIndex) * this.lineHeight;
      this.bottomPadding =
        this.filteredTotalHeight - this.topPadding - visibleHeight;
      this.visibleStart = startIndex;
      this.visibleEnd = endIndex;
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
    this.$nextTick(() => {
      this.render();
    });
  },
  // Cleanup to prevent memory leaks
  beforeUnmount() {
    this.filteredItems.length = 0;
    this.table = null;
  },
};

// Inject styles using the same pattern as cycle-info-card
if (!document.querySelector('#history-table-styles')) {
  const styles = /*css*/ `
    <style id="history-table-styles">
      .history-table-container {
        border-radius: var(--spacing-sm);
        border: 1px solid var(--border-color);
        box-shadow: 0 4px 8px var(--shadow-color);
        display: flex;
        flex-direction: column;
        flex:1;
        min-height: 150px;
        box-shadow: 0 4px 8px var(--shadow-color);
      }

      .table-header{
        display:flex;
        flex-direction:row;
        justify-content:space-between;
        align-items:center;
        text-transform:uppercase;
        font-weight:600;
        background:var(--bg-table-header);
        padding:var(--spacing-sm);
      }
      .table-header:first-child{max-width:1rem;}

      .table-content{
        width: 100%;
        font-weight: 500;
        font-size: var(--font-size-md);
        border-collapse:collapse;
        text-transform: uppercase;
        white-space: nowrap;
        overflow-y:auto;
        flex:1;
        min-height:100px;
        position: relative;
      }
      .table-content-scrollarea{
        position: relative;
        width: 100%;
      }

      .table-row{
        display:flex;
        flex-direction:row;
        justify-content:space-between;
        align-items:center;
        background:var(--bg-table-row-odd);
        border-bottom: 1px solid var(--border-color);
        padding:0 var(--spacing-sm);
        line-height:16px;
      }
      .table-row:last-of-type{ border-bottom:none; }
      .table-row.even-row { background: var(--bg-table-row-even); }
      .table-row:hover { background: var(--bg-hover); } 
      .ng-res{ color: var(--accent-ng) !important; }
      .ok-res { color: var(--accent-ok) !important; }
      .row-spacer{width:100%;}
      .filter-icon{
        cursor:pointer;
      }
      .filter-icon:hover{ color:var(--accent-ng); }
    </style>
  `;
  document.head.insertAdjacentHTML('beforeend', styles);
}

window.HistoryTable = HistoryTable;
