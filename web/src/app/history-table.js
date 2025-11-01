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
      showNGOnly: false,
    };
  },

  computed: {},

  template: /*html*/ `
  <div class="history-table-container">
    <!--
    <h3 class="table-title"><i class="fa fa-table"></i>&nbsp;{{table.title }}</h3>
    -->
    <div class="table-header">
      <template v-for="(col,colIndex) in table.cols" :key="'C-'+colIndex">
        <span v-if="col!=='res'">{{getColText(colIndex)}}</span>
      </template>
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
          <template v-for="(col,colIndex) in table.cols" :key="'C-'+colIndex">
            <span v-if="col!=='res'">{{row[col]}}</span>
          </template>

          <i class="fa res-cell" :class="{
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
      //compute col widths
      this.colWidths = new Array(this.table.cols.length).fill(0);
      this.filteredItems.forEach((row) => {
        this.table.cols.forEach((col, colIndex) => {
          this.colWidths[colIndex] = Math.max(
            this.colWidths[colIndex],
            row[col] ? row[col].toString().length : 1
          );
        });
      });
    },
    getColText(colIndex){
      const colwidth = this.colWidths[colIndex];
      //space padding to match colwidth if colwidth > text length
      const txt = this.table.cols[colIndex];
      if(colwidth > txt.length){
        //padd spaces to both sides
        const totalSpaces = (colwidth - txt.length) * 0.75;
        return '\u00A0'.repeat(totalSpaces) + txt + '\u00A0'.repeat(totalSpaces);
      }
      else {return txt;}
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
        display: flex;
        flex-direction: column;
        flex:1;
        min-height: 150px;
        border-top:1px solid var(--border-color);
        /*
        border-radius: var(--spacing-sm);
        border: 1px solid var(--border-color);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        */
      }

      .table-title{
        text-align:left;
        text-transform:uppercase;
        font-weight:600;
        padding-left:0.5rem;
        background-color:var(--bg-tertiary);
      }

      .table-header{
        display:flex;
        flex-direction:row;
        align-items:center;
        justify-content:space-between;
        text-transform:uppercase;
        font-weight:600;
        background-color:var(--bg-table-header);
        padding:0 var(--spacing-sm);
        min-width:100%;
      }
      .table-header:last-child{max-width:2rem;}

      .table-content{
        font-weight: 500;
        font-size: var(--font-size-md);
        border-collapse:collapse;
        text-transform: uppercase;
        white-space: nowrap;
        overflow-y:auto;
        flex:1;
        position: relative;
        min-height:100px;
        min-width: 100%;
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
        background-color:var(--bg-table-row-odd);
        padding:0 var(--spacing-sm);
        line-height:16px;
      }
      .table-row:last-of-type{ border-bottom:none; }
      .table-row.even-row { background-color: var(--bg-table-row-even); }
      .table-row:hover { background-color: var(--bg-hover); } 
      .ng-res{ color: var(--accent-ng) !important; }
      .ok-res { color: var(--accent-ok) !important; }
      .row-spacer{width:100%;}
      .res-cell{width:1rem;}
      .filter-icon{ cursor:pointer; }
      .filter-icon:hover{ color:var(--accent-ng); }
    </style>
  `;
  document.head.insertAdjacentHTML('beforeend', styles);
}

window.HistoryTable = HistoryTable;
