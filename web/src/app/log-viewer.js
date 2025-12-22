const LogViewer = {
  // Component name
  name: 'LogViewer',

  // Declare props this component expects to receive
  props: {},

  // Reactive data
  data() {
    return {
      // Internal logs array (synced with props)
      showControllers: true,
      internalLogs: [],
      crrEntry: '',
      showEntryTimeout: null,
      totalEntries: 0,

      // Auto scroll
      topScroll: 0,
      lastTopScroll: 0,
      progScroll: false,
      progScrollTimer: null,
      autoScroll: true,
      autoScrollPaused: false,
      autoScrollTimer: null,

      // Filters
      levelFilter: 'ALL',
      textFilter: '',

      // Filtered logs cache
      filteredLogs: [],
      filteredTotalHeight: 0,
      visibleStart: 0,
      visibleEnd: 0,
      offsetY: 0,
      lineHeight: 16,
    };
  },

  // Template
  template: /*html*/ `
    <div class="log-viewer">
      <div v-show="showControllers" class="log-viewer__controls">
        <i class = "fa fa-list log-viewer__icon"></i>
        <span style="font-weight: 600;padding-right: 1rem"> SYSTEM LOG</span>
        <input 
          type="text" 
          v-model="textFilter" 
          @input="filterChanged"
          placeholder="Filter text..." 
          class="log-viewer__filter-text"
          title="Log filter input"
        >
        <select v-model="levelFilter" @change="filterChanged" class="log-viewer__filter-level" title="Filter log level">
          <option value="LOG">LOG</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
          <option value="ALL">ALL</option>
        </select>

        <button class="log-viewer__scroll-btn" :class="{ 'log-viewer__scroll-btn--active': autoScrollPaused }" @click="resumeAutoScroll" title="Scroll to bottom">
          <i class="fa fa-angle-double-down"></i>
        </button>
      </div>
      <div v-show="showControllers && crrEntry" class="log-viewer__selected">
        <div style="display:flex;flex-direction:row;margin:0;padding:0;">
            <span class="log-viewer__level" :data-level="crrEntry.l">
            <i class="fa" :class="{
              'fa-info-circle': crrEntry.l=== 'Normal',
              'fa-bug': crrEntry.l=== 'Debug',
              'fa-search': crrEntry.l=== 'Trace',
              'fa-exclamation-triangle': crrEntry.l=== 'Warn',
              'fa-info': crrEntry.l=== 'Info',
              'fa-check-circle': crrEntry.l=== 'Success',
              'fa-times-circle': crrEntry.l=== 'Error',
              'fa-skull': crrEntry.l=== 'Fatal',
            }"></i>
          </span>
          <span class="log-viewer__time">{{ crrEntry.t}}</span>
          <button class="log-viewer__close" @click="crrEntry=''"><i class="fa fa-times"></i></button>
        </div>
        <span class="log-viewer__selected-message">{{ crrEntry.m}}</span>
      </div>
      
      <div ref="container" 
        class="log-viewer__container"
        @scroll="handleScroll"
        @wheel="handleUserScroll"
      >
        <div class="log-viewer__content" :style="{ height: getTotalHeight() + 'px' }">
          <div class="log-viewer__spacer" :style="{ height: offsetY + 'px' }"></div>
          <div
            v-for="(entry, index) in getVisibleLogs()"
            :key="visibleStart + index"
            :ref="'entry-' + entry.id"
            class="log-viewer__entry"
            :data-level="entry.l"
          >
            <span class="log-viewer__time">{{ (entry.t.split(' ')[1]) }}</span>
            <span class="log-viewer__level" :data-level="entry.l">
              <i class="fa" :class="{
                'fa-info-circle': entry.l=== 'Normal',
                'fa-bug': entry.l=== 'Debug',
                'fa-search': entry.l=== 'Trace',
                'fa-exclamation-triangle': entry.l=== 'Warn',
                'fa-info': entry.l=== 'Info',
                'fa-check-circle': entry.l=== 'Success',
                'fa-times-circle': entry.l=== 'Error',
                'fa-skull': entry.l=== 'Fatal'
              }"></i>
            </span>
            <span class="log-viewer__message"
             @dblclick="setCurrentEntry(entry)">{{ entry.m }}</span>
          </div>
        </div>
      </div>
    </div>
  `,

  // Computed properties
  computed: {
    //number of filtered log
    totalLogs() {
      return this.filteredLogs.length;
    },
  },

  // Methods
  methods: {
    // Add new log entries
    addEntries(newEntries) {
      //compute entry with row count
      this.internalLogs.push(
        ...newEntries.map((entry) => ({
          ...entry,
          id: this.totalEntries++, //unique id
          height: ((entry.m.match(/\n/g) || []).length + 1) * this.lineHeight, //row height based on number of lines
          heightMeasured: false,
          offset: 0,
        }))
      ); //add rowCount property
      if (this.internalLogs.length > 2000) {
        const remove = this.internalLogs.splice(
          0,
          this.internalLogs.length - 1000
        );
        remove.length = 0;
      }
      this.$nextTick(() => {
        if (this.autoScroll && !this.autoScrollPaused) {
          this.markProgrammaticScroll(200);
        }
        this.render();
      });
    },

    filterChanged() {
      this.render();
      this.scrollToBottom();
    },
    // Re-apply filters and render logs
    render() {
      //filter logs
      const showAll = this.levelFilter === 'ALL';
      const showLog = this.levelFilter === 'LOG';
      const showWarn = this.levelFilter === 'WARN';
      const showError = this.levelFilter === 'ERROR';
      const filter = this.textFilter?.trim();

      this.filteredLogs.length = 0;
      this.filteredLogs = this.internalLogs.filter((log) => {
        const levelMatch =
          showAll ||
          (showLog && log.l !== 'Debug' && log.l !== 'Trace') ||
          (showWarn &&
            (log.l === 'Warn' || log.l === 'Error' || log.l === 'Fatal')) ||
          (showError && (log.l === 'Error' || log.l === 'Fatal'));
        const textMatch =
          !filter || log.l.includes(filter) || log.m.includes(filter);
        return levelMatch && textMatch;
      });

      //compute each log offset
      let offset = 0;
      for (let i = 0; i < this.filteredLogs.length; i++) {
        this.filteredLogs[i].offset = offset;
        offset += this.filteredLogs[i].height;
      }
      //total height
      this.filteredTotalHeight = offset;

      // Auto scroll to bottom if enabled and update visible range
      this.$nextTick(() => {
        this.updateVisibleRange();
      });
    },

    //measure height of a log entry
    measureEntryHeight(index) {
      const entry = this.filteredLogs[index];
      if (!entry || entry.heightMeasured) return;
      const entryRef = this.$refs['entry-' + this.filteredLogs[index].id];
      if (entryRef?.length === 1) {
        this.filteredLogs[index].height = entryRef[0].clientHeight;
        this.filteredLogs[index].heightMeasured = true;
      }
    },

    clearEntryRefs() {
      Object.keys(this.$refs).forEach((key) => {
        if (key.startsWith('entry-')) {
          delete this.$refs[key];
        }
      });
    },

    // Update visible range for virtual scrolling with dynamic heights
    updateVisibleRange() {
      const container = this.$refs.container;
      if (!container || this.filteredLogs.length === 0) {
        this.visibleStart = 0;
        this.visibleEnd = 0;
        return;
      }

      //clear entry refs to avoid memory leak
      this.clearEntryRefs();

      const containerHeight = container.clientHeight;
      const scrollTop = container.scrollTop;

      // Ensure we have valid dimensions
      if (containerHeight <= 0) {
        return;
      }

      //each row have rowCount lines
      //binary search to find startIndex based on offset
      let start = 0;
      let end = this.filteredLogs.length - 1;
      while (start < end) {
        const mid = Math.floor((start + end) / 2);
        if (
          this.filteredLogs[mid].offset + this.filteredLogs[mid].height <
          scrollTop
        ) {
          start = mid + 1;
        } else {
          end = mid;
        }
      }
      let startIndex = Math.max(0, start - 1);
      //compute end index to fill the container height
      let currentOffset = this.filteredLogs[startIndex]?.offset || 0;
      let startOffset = currentOffset;
      let endIndex = startIndex;
      while (
        endIndex < this.filteredLogs.length &&
        currentOffset < scrollTop + containerHeight
      ) {
        currentOffset += this.filteredLogs[endIndex].height;
        endIndex++;
      }

      //adjust offset y
      this.offsetY = startOffset;
      this.visibleStart = startIndex;
      this.visibleEnd = endIndex;

      if (this.autoScroll && !this.autoScrollPaused) {
        this.$nextTick(() => {
          //clear ref
          for (let i = this.visibleStart; i < this.visibleEnd; i++) {
            this.measureEntryHeight(i);
          }
          this.scrollToBottom();
        });
      }
    },

    // set current entry to show details
    setCurrentEntry(entry) {
      this.crrEntry = entry;
      this.pauseAutoScroll(10000);
    },

    markProgrammaticScroll(timeout = 200) {
      this.progScroll = true;
      if (this.progScrollTimer) {
        clearTimeout(this.progScrollTimer);
      }
      this.progScrollTimer = setTimeout(() => {
        this.progScroll = false;
        this.progScrollTimer = null;
      }, timeout);
    },

    // Handle scroll events
    handleScroll(event) {
      const scrollTop = event.target.scrollTop;
      const last = this.lastScrollTop || 0;

      const scrollDown = scrollTop > last + 1;
      const scrollUp = scrollTop < last - 1;

      if (scrollUp && !this.autoScrollPaused && !this.progScroll) {
        this.pauseAutoScroll();
        this.lastScrollTop = scrollTop;
        return;
      }

      this.lastScrollTop = scrollTop;
      this.updateVisibleRange();

      if (scrollDown && this.visibleEnd >= this.filteredLogs.length - 2) {
        this.resumeAutoScroll();
      }
    },

    // Handle user-initiated scroll (mouse wheel)
    handleUserScroll(e) {
      //scroll up
      if (e.deltaY < -3 && !this.autoScrollPaused) {
        this.pauseAutoScroll();
      }
    },

    // Pause auto scroll for 30 seconds
    pauseAutoScroll(timeout = 30000) {
      this.autoScrollPaused = true;

      // Clear existing timer
      if (this.autoScrollTimer) {
        clearTimeout(this.autoScrollTimer);
      }

      // Set timer for 30 seconds
      this.autoScrollTimer = setTimeout(() => {
        this.crrEntry = ''; //close current entry
        this.resumeAutoScroll();
      }, timeout || 30000);
    },

    // Resume auto scroll
    resumeAutoScroll() {
      this.autoScrollPaused = false;
      if (this.autoScrollTimer) {
        clearTimeout(this.autoScrollTimer);
        this.autoScrollTimer = null;
      }
      this.scrollToBottom();
    },

    // Scroll to bottom
    scrollToBottom() {
      const container = this.$refs.container;
      if (container) {
        this.markProgrammaticScroll(200);
        container.scrollTop = container.scrollHeight;
        this.lastScrollTop = container.scrollTop;
      }
    },

    // Get visible logs for rendering
    getVisibleLogs() {
      return this.filteredLogs.slice(this.visibleStart, this.visibleEnd);
    },

    // Get total height for virtual scrolling
    getTotalHeight() {
      return this.filteredTotalHeight;
    },
  },

  // Lifecycle hooks
  mounted() {
    // Wait for container to be ready
    const waitForContainer = () => {
      const container = this.$refs.container;
      this.$nextTick(() => {
        if (!container || container.clientHeight <= 0) {
          requestAnimationFrame(waitForContainer);
        } else this.render();
      });
    };
    waitForContainer();
  },

  // Watch for changes
  watch: {},

  // Cleanup
  beforeUnmount() {
    this.clearEntryRefs();
    // Clear all timers
    if (this.autoScrollTimer) {
      clearTimeout(this.autoScrollTimer);
      this.autoScrollTimer = null;
    }
    if (this.showEntryTimeout) {
      clearTimeout(this.showEntryTimeout);
      this.showEntryTimeout = null;
    }
    if(this.progScrollTimer){
      clearTimeout(this.progScrollTimer);
      this.progScrollTimer = null;
    }
    this.internalLogs.length = 0;
    this.filteredLogs.length = 0;
    this.crrEntry = '';
  },
};

//inject style
if (!document.querySelector('#log-viewer-styles')) {
  const styles = /*css*/ `
    <style id="log-viewer-styles">

      .log-viewer {
        display: flex;
        max-height: 100%;
        min-height: 0;
        flex-direction: column;
        background-color: var(--bg-secondary);
        overflow: hidden;
        user-select: text;
        cursor: text;
      }

      .log-viewer::selection {
        background-color: var(--bg-tertiary);
        color: var(--text-primary);
      }

      .log-viewer__container {
        height: 100%;
        min-height: 0;
        overflow-x: hidden;
        overflow-y: auto;
        background-color: var(--bg-primary);
        position: relative;
      }

      .log-viewer__controls {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        background-color: var(--bg-title);
        border-bottom: 1px solid var(--border-color);
        overflow: hidden;
        min-height: 1.7rem;
        max-height: 1.7rem;
        z-index: 10;
      }

      .log-viewer__filter-level,
      .log-viewer__filter-text {
        padding: var(--spacing-xs) var(--spacing-sm);
        border: none;
        background-color: var(--bg-title);
        color: var(--text-primary);
        font-size: var(--font-size-sm);
        height: 100%;
      }

      .log-viewer__filter-level {
        min-width: fit-content;
      }

      .log-viewer__filter-text {
        flex: 1;
        border-radius: var(--spacing-xs);
        height: 1.5rem;
      }

      .log-viewer__filter-text:focus,
      .log-viewer__filter-level:focus {
        outline: none;
        border: 1px solid var(--accent-active);
      }

      .log-viewer__scroll-btn {
        width: 0rem;
        font-size: var(--font-size-sm);
        color: var(--text-muted);
        overflow: hidden;
      }

      .log-viewer__scroll-btn--active {
        width: 2rem;
        background-color: transparent;
        color: var(--text-primary);
        overflow: hidden;
        border: none;
        box-shadow: none;
      }

      .log-viewer__scroll-btn:hover {
        color: var(--accent-active);
      }

      .log-viewer__content {
        position: relative;
      }

      .log-viewer__spacer {
        width: 100%;
      }

      .log-viewer__entry {
        display: flex;
        align-items: flex-start;
        padding: 0 var(--spacing-sm);
        border-left: var(--spacing-xs) solid var(--border-color);
        font-family: 'Consolas', monospace;
        font-size: var(--font-size-sm);
      }

      .log-viewer__entry:hover { background-color: var(--bg-hover); }

      .log-viewer__entry[data-level="Normal"] { border-left-color: var(--primary-color); }
      .log-viewer__entry[data-level="Debug"],
      .log-viewer__entry[data-level="Trace"] { border-left-color: var(--text-muted); }
      .log-viewer__entry[data-level="Warn"] { border-left-color: var(--yellow); }
      .log-viewer__entry[data-level="Info"] { border-left-color: var(--blue); }
      .log-viewer__entry[data-level="Success"] { border-left-color: var(--green); }
      .log-viewer__entry[data-level="Error"] { border-left-color: var(--red); }
      .log-viewer__entry[data-level="Fatal"] { border-left-color: var(--magenta); }

      .log-viewer__time {
        flex: 0 0 auto;
        width: fit-content;
        color: var(--text-muted);
        margin-right: var(--spacing-sm);
        font-weight: 500;
      }

      .log-viewer__level {
        width: 1rem;
        margin-right: var(--spacing-sm);
        text-align: center;
      }

      .log-viewer__level[data-level="Normal"] { color: var(--text-primary); }
      .log-viewer__level[data-level="Debug"],
      .log-viewer__level[data-level="Trace"] { color: var(--text-muted); }
      .log-viewer__level[data-level="Warn"] { color: var(--yellow); }
      .log-viewer__level[data-level="Info"] { color: var(--blue); }
      .log-viewer__level[data-level="Success"] { color: var(--accent-ok); }
      .log-viewer__level[data-level="Error"] { color: var(--accent-ng); }
      .log-viewer__level[data-level="Fatal"] { color: var(--magenta); }

      .log-viewer__message {
        flex: 1;
        color: var(--text-primary);
        white-space: pre;
      }

      .log-viewer__icon {
        padding: 0 var(--spacing-sm);
      }

      .log-viewer__selected {
        margin: 0;
        padding: var(--spacing-xs) var(--spacing-sm);
        background-color: var(--bg-secondary);
        border-bottom: 1px solid var(--border-color);
        font-family: 'Consolas', monospace;
        font-size: var(--font-size-lg);
      }

      .log-viewer__selected-message {
        color: var(--text-primary);
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow-wrap: break-word;
        height: fit-content;
      }

      .log-viewer__close {
        background-color: transparent;
        border: none;
        color: var(--text-muted);
        padding: 0;
        margin: 0;
        width: 1.5rem;
        height: 1.5rem;
        margin-left: auto;
      }

      .log-viewer__close:hover {
        color: var(--red);
        background-color: transparent;
      }

    </style>
  `;
  document.head.insertAdjacentHTML('beforeend', styles);
}

// Export both ways
window.LogViewer = LogViewer;
