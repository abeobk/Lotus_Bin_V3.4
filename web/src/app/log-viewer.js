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
      <div v-show="showControllers" class="log-viewer-controls">
        <i class = "fa fa-filter log-icon"></i>
        <input 
          type="text" 
          v-model="textFilter" 
          @input="filterChanged"
          placeholder="Filter..." 
          class="text-filter"
          title="Log filter input"
        >
        <select v-model="levelFilter" @change="filterChanged" class="level-filter" title="Filter log level">
          <option value="LOG">LOG</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
          <option value="ALL">ALL</option>
        </select>

        <button class="scroll-status" :class="{ active: autoScrollPaused }" @click="resumeAutoScroll" title="Scroll to bottom">
          <i class="fa fa-angle-double-down"></i>
        </button>
      </div>
      <div v-show="showControllers && crrEntry" class="selected-entry-container">
        <div style="display:flex;flex-direction:row;margin:0;padding:0;">
            <span class="log-level" :class="'level-' + crrEntry.l">
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
          <span class="log-time">{{ crrEntry.t}}</span>
          <button class="close-button" @click="crrEntry=''"><i class="fa fa-times"></i></button>
        </div>
        <span class="selected-entry">{{ crrEntry.m}}</span>
      </div>
      
      <div ref="container" 
        class="log-container"
        @scroll="handleScroll"
        @wheel="handleUserScroll"
      >
        <div class="log-content" :style="{ height: getTotalHeight() + 'px' }">
          <div class="log-spacer" :style="{ height: offsetY + 'px' }"></div>
          <div
            v-for="(entry, index) in getVisibleLogs()"
            :key="visibleStart + index"
            :ref="'entry-' + entry.id"
            class="log-entry"
            :class="'log-level-' + entry.l"
          >
            <span class="log-time">{{ (entry.t.split(' ')[1]) }}</span>
            <span class="log-level" :class="'level-' + entry.l">
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
            <span class="log-message"
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
        if (this.autoScroll && !this.autoScrollPaused) {
          this.updateVisibleRange();
        }
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

    // Handle scroll events
    handleScroll(event) {
      const scrollDown = event.target.scrollTop > (this.scrollTop || 0);
      this.scrollTop = event.target.scrollTop;
      this.updateVisibleRange();
      // Check if user scrolled near the bottom
      const container = event.target;
      if (
        scrollDown &&
        this.visibleEnd >= this.filteredLogs.length - 2 &&
        this.autoScrollPaused
      ) {
        this.resumeAutoScroll();
      }
    },

    // Handle user-initiated scroll (mouse wheel)
    handleUserScroll() {
      if (!this.autoScrollPaused) {
        this.pauseAutoScroll();
      }
    },

    // Pause auto scroll for 30 seconds
    pauseAutoScroll(timeout = 60000) {
      this.autoScrollPaused = true;

      // Clear existing timer
      if (this.autoScrollTimer) {
        clearTimeout(this.autoScrollTimer);
      }

      // Set timer for 30 seconds
      this.autoScrollTimer = setTimeout(() => {
        this.crrEntry = ''; //close current entry
        this.resumeAutoScroll();
      }, timeout || 60000);
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
        container.scrollTop = container.scrollHeight;
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
    const container = this.$refs.container;
    const waitForContainer = () => {
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
    clearEntryRefs();
    // Clear all timers
    if (this.autoScrollTimer) {
      clearTimeout(this.autoScrollTimer);
      this.autoScrollTimer = null;
    }
    if (this.showEntryTimeout) {
      clearTimeout(this.showEntryTimeout);
      this.showEntryTimeout = null;
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
        min-height:0;
        flex-direction: column;
        background-color: var(--bg-primary);
        overflow: hidden;
        user-select:text;
        cursor:text;
      }
      .log-viewer::selection{background-color:var(--bg-tertiary);color:var(--text-primary);}

      .log-container {
        height: 100%;
        min-height:0;
        overflow-x: hidden;
        overflow-y: auto;
        background-color: var(--bg-primary);
        position: relative;
      }

      .log-viewer-controls {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        background-color: var(--bg-secondary);
        border-bottom: 1px solid var(--border-color);
        overflow: hidden;
        min-height:1.7rem;
        max-height:1.7rem;
      }

      .level-filter, .text-filter {
        padding: var(--spacing-xs) var(--spacing-sm);
        border:none;
        background-color: var(--bg-secondary);
        color: var(--text-primary);
        font-size: var(--font-size-sm);
        height:100%;
      }

      .level-filter { min-width: fit-content; background-color: var(--bg-tertiary); }
      .text-filter { flex:1; }

      .text-filter:focus, .level-filter:focus {
        outline: none;
        border: 1px solid var(--accent-active);
      }
      .scroll-status { font-size: var(--font-size-sm); color: var(--text-muted); overflow:hidden; }
      .scroll-status.active { color: var(--text-primary); overflow:hidden; }
      .log-content { position: relative; }
      .log-spacer { width: 100%; }

      .log-entry {
        display: flex;
        align-items: flex-start;
        padding: 0 var(--spacing-sm);
        border-left: var(--spacing-xs) solid var(--border-color);
        font-family: 'Consolas', monospace;
        font-size: var(--font-size-sm);
      }
      

      .log-entry:hover { background-color: var(--bg-hover); }

      /* Log level border colors */
      .log-entry.log-level-Normal { border-left-color: var(--primary-color); }
      .log-entry.log-level-Debug,
      .log-entry.log-level-Trace{ border-left-color: var(--text-muted); }
      .log-entry.log-level-Warn{ border-left-color: var(--yellow); }
      .log-entry.log-level-Info{ border-left-color: var(--blue); }
      .log-entry.log-level-Success{ border-left-color: var(--green); }
      .log-entry.log-level-Error{ border-left-color: var(--red); }
      .log-entry.log-level-Fatal{ border-left-color: var(--magenta); }

      .log-time {
        flex: 0 0 auto;
        width: fit-content;
        color: var(--text-muted);
        margin-right: var(--spacing-sm);
        font-weight: 500;
      }

      .log-level {
        width:1rem;
        margin-right: var(--spacing-sm);
        text-align: center;
      }

      .log-message {
        flex: 1;
        color: var(--text-primary);
        white-space: pre;
      }
      .log-icon{
        padding: 0 var(--spacing-sm);
      }

      /* Log level text colors */
      .level-Normal{ color: var(--text-primary); }
      .level-Debug,
      .level-Trace{ color: var(--text-muted); }
      .level-Warn{ color: var(--yellow); }
      .level-Info{ color: var(--blue); }
      .level-Success{ color: var(--green); }
      .level-Error{ color: var(--red); }
      .level-Fatal{ color: var(--magenta); }

      .selected-entry-container{
        margin:0;
        padding: var(--spacing-xs) var(--spacing-sm);
        background-color: var(--bg-secondary);
        border-bottom: 1px solid var(--border-color);
        font-family: 'Consolas', monospace;
        font-size: var(--font-size-lg);
      }

      .selected-entry {
        color: var(--text-primary);
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow-wrap: break-word;
        height: fit-content;
      }

      .close-button{
        background-color: transparent;
        border: none;
        color: var(--text-muted);
        padding:0;
        margin:0;
        width:1.5rem;
        height:1.5rem;
        margin-left:auto;
      }
      .close-button:hover{ 
        color: var(--red); 
        background-color:transparent;
      }

    </style>
  `;
  document.head.insertAdjacentHTML('beforeend', styles);
}

// Export both ways
window.LogViewer = LogViewer;
