const HistoryTable = {
  name: 'HistoryTable',
  props: {},
  // Reactive data
  data() {
    return {
      table: {
        title: 'Production History',
        cols: [],
        rows: [],
      },
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
    };
  },

  computed: {},

  template: /*html*/ `
  <div class="history-table">
    <div class="history-table__content" ref="container" @scroll="handleScroll">
      <table class="history-table__table" ref="bodyTable">
        <thead>
          <th v-for="(col,colIndex) in table.cols.filter(c=>c!=='res')" :key="'C-'+colIndex">
            <span v-if="col=='time'"><i class="fa fa-clock"></i> {{col}}</span>
            <span v-else-if="col=='model'"><i class="fa fa-car"></i> {{col}}</span>
            <span v-else-if="col=='body'"><i class="fa fa-tag"></i> {{col}}</span>
            <span v-else-if="col=='seq'"><i class="fa fa-hashtag"></i> {{col}}</span>
            <span v-else>{{col}}</span>
          </th>
          <th class="history-table__filter-column">
            <span><i class="fa fa-filter history-table__filter-icon" @click="toggleFilter"></i></span>
          </th>
        </thead>
        <tbody>
          <tr class="history-table__spacer" :style="{ height: topPadding + 'px' }"></tr>
          <tr v-for="(row, rowIndex) in getVisibleRows()" 
            :key="'R-'+visibleStart+rowIndex"
            class="history-table__row"
            :class="{ 'history-table__row--even': rowIndex % 2 === 0 }"
          >
            <td v-for="(col,colIndex) in table.cols.filter(c=>c!=='res')" :key="'C-'+colIndex" class="history-table__cell">
                <span>{{row[col]}}</span>
              </td>
              <td class="history-table__cell history-table__cell--res history-table__filter-column">
                <i class="fa history-table__res-icon" :class="{
                  'fa-circle-check': row.res && row.res.toLowerCase() === 'ok', 
                  'fa-circle-exclamation': row.res && row.res.toLowerCase() === 'ng',
                  'fa-spinner fa-spin': !row.res || !row.res || row.res === '',
                  'history-table__res-icon--ng': row.res && row.res.toLowerCase() === 'ng',
                  'history-table__res-icon--ok': row.res && row.res.toLowerCase() === 'ok',
                }"></i>
              </td>
            </tr>
            <tr class="history-table__spacer" :style="{ height: bottomPadding + 'px' }"></tr>
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
        const dataRow = container.querySelector('tbody tr.history-table__row');
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
      this.bottomPadding = Math.max(
        0,
        totalHeight - this.topPadding - visibleHeight
      );

      this.visibleStart = startIndex;
      this.visibleEnd = endIndex;

      //keep scroll position after render to prevent jump
      this.$nextTick(() => {
        container.scrollTop = this.scrollTop;
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
    if (window.chrome.webview) return;
    this.$nextTick(() => {
      this.updateTable(SampleData.generateHistoryData());
    });
  },
  // Cleanup to prevent memory leaks
  beforeUnmount() {
    this.filteredItems.length = 0;
    this.table = null;
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
    if (this.rafId) cancelAnimationFrame(this.rafId);
  },
};

// Inject styles using the same pattern as cycle-info-card
if (!document.querySelector('#history-table-styles')) {
  const styles = /*css*/ `
    <style id="history-table-styles">
      .history-table {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 150px;
        border-top: 1px solid var(--border-color);
      }

      .history-table__content {
        font-weight: 500;
        font-size: var(--font-size-md);
        text-transform: uppercase;
        white-space: nowrap;
        overflow-y: auto;
        overflow-x: hidden;
        flex: 1;
        position: relative;
        min-height: 100px;
        min-width: 100%;
      }

      .history-table__table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
      }

      .history-table__table th {
        padding: 0 var(--spacing-sm);
        background-color: var(--bg-table-header);
        color: var(--text-primary);
        font-weight: 600;
        text-transform: uppercase;
        text-align: center;
        border-bottom: 1px solid var(--border-color);
        border-right: 1px solid var(--border-color);
        position: sticky;
        height: 1.8rem;
        top: 0;
        z-index: 10;
      }

      .history-table__table th:last-child {
        border-right: none;
      }

      .history-table__filter-column {
        width: 3rem !important;
        min-width: 3rem !important;
        max-width: 3rem !important;
      }

      .history-table__row {
        background-color: var(--bg-table-row-odd);
        line-height: 16px;
      }

      .history-table__row--even {
        background-color: var(--bg-table-row-even);
      }

      .history-table__row:hover {
        background-color: var(--bg-hover);
      }

      .history-table__cell {
        padding: 0 var(--spacing-sm);
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        height: 16px;
        border-right: 1px solid var(--border-color);
        border-bottom: 1px solid var(--border-color);
      }

      .history-table__cell:last-child {
        border-right: none;
      }

      .history-table__cell--res {
        text-align: center !important;
      }

      .history-table__res-icon {
        width: 1rem;
      }

      .history-table__res-icon--ng {
        color: var(--accent-ng) !important;
      }

      .history-table__res-icon--ok {
        color: var(--accent-ok) !important;
      }

      .history-table__spacer {
        padding: 0;
        margin: 0;
        width: 100%;
      }

      .history-table__filter-icon {
        cursor: pointer;
      }

      .history-table__filter-icon:hover {
        color: var(--accent-ng);
      }
    </style>
  `;
  document.head.insertAdjacentHTML('beforeend', styles);
}

window.HistoryTable = HistoryTable;
