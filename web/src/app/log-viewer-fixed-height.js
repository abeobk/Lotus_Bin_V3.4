const LogViewer = {
  // Component name
  name: 'LogViewer',

  // Declare props this component expects to receive
  props: {
  },

  // Reactive data
  data() {
    return {
      // Internal logs array (synced with props)
      showControllers: true,
      internalLogs: [],
      crrEntry: '',
      showEntryTimeout: null,
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
      lineHeight: 16,
    };
  },

  // Template
  template: /*html*/ `
    <div class="log-viewer">
      <div v-show="showControllers" class="log-viewer-controls">
        <div class="filter-controls">
          <select v-model="levelFilter" @change="render" class="level-filter">
            <option value="LOG">LOG</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
            <option value="ALL">ALL</option>
          </select>
          <input 
            type="text" 
            v-model="textFilter" 
            @input="render"
            placeholder="Filter messages..." 
            class="text-filter"
          >
        </div>
        <div class="scroll-status">
          <span>{{ totalLogs }} entries </span>
          <span v-if="autoScrollPaused" class="auto-scroll-paused">[paused]</span>
        </div>
      </div>
      <div v-show="showControllers && crrEntry" class="selected-entry-container">
        <div style="display:flex;flex-direction:row;margin:0;padding:0;">
            <span class="log-level" :class="'level-' + crrEntry.l">
            <i class="fa" :class="{
              'fa-info-circle': crrEntry.l=== 'LOG',
              'fa-bug': crrEntry.l=== 'DEBUG',
              'fa-search': crrEntry.l=== 'TRACE',
              'fa-exclamation-triangle': crrEntry.l=== 'WARN',
              'fa-info': crrEntry.l=== 'INFO',
              'fa-check-circle': crrEntry.l=== 'SUCCESS',
              'fa-times-circle': crrEntry.l=== 'ERROR',
              'fa-skull': crrEntry.l=== 'FATAL',
            }"></i>
          </span>
          <span class="log-time">{{ crrEntry.t}}</span>
          <button class="close-button" @click="crrEntry='';resumeAutoScroll()"><i class="fa fa-times"></i></button>
        </div>
        <span class="selected-entry">{{ crrEntry.m}}</span>
      </div>
      
      <div ref="container" 
        class="log-container"
        @scroll="handleScroll"
        @wheel="handleUserScroll"
      >
        <div class="log-content" :style="{ height: getTotalHeight() + 'px' }">
          <div class="log-spacer" :style="{ height: getOffsetY() + 'px' }"></div>
          <div
            v-for="(entry, index) in getVisibleLogs()"
            :key="visibleStart + index"
            :ref="'entry' + (visibleStart + index)"
            class="log-entry"
            :class="'log-level-' + entry.l"
          >
            <span class="log-time">{{ entry.t}}</span>
            <span class="log-level" :class="'level-' + entry.l">
              <i class="fa" :class="{
                'fa-info-circle': entry.l=== 'LOG',
                'fa-bug': entry.l=== 'DEBUG',
                'fa-search': entry.l=== 'TRACE',
                'fa-exclamation-triangle': entry.l=== 'WARN',
                'fa-info': entry.l=== 'INFO',
                'fa-check-circle': entry.l=== 'SUCCESS',
                'fa-times-circle': entry.l=== 'ERROR',
                'fa-skull': entry.l=== 'FATAL'
              }"></i>
            </span>
            <span class="log-message"
             @click="setCurrentEntry(entry)">{{ entry.m }}</span>
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
      //add log enties
      this.internalLogs.push(...newEntries);
      if (this.internalLogs.length > 20000) {
        this.internalLogs.splice(0, this.internalLogs.length - 10000); //keep last 5000
      }
      this.render();
    },

    // Re-apply filters and render logs
    render() {
      //filter logs
      const showAll = this.levelFilter === 'ALL';
      const showLog = this.levelFilter === 'LOG';
      const showWarn = this.levelFilter === 'WARN';
      const showError = this.levelFilter === 'ERROR';
      const filter = this.textFilter?.trim();

      this.filteredLogs = this.internalLogs.filter((log) => {
        const levelMatch =
          showAll ||
          (showLog && log.l !== 'DEBUG' && log.l !== 'TRACE') ||
          (showWarn &&
            (log.l === 'WARN' || log.l === 'ERROR' || log.l === 'FATAL')) ||
          (showError && (log.l === 'ERROR' || log.l === 'FATAL'));
        const textMatch =
          !filter || log.l.includes(filter) || log.m.includes(filter);
        return levelMatch && textMatch;
      });
      this.filteredTotalHeight = this.filteredLogs.length * this.lineHeight;

      // Auto scroll to bottom if enabled and update visible range
      if (this.autoScroll && !this.autoScrollPaused) {
        this.$nextTick(() => {
          this.scrollToBottom();
          this.updateVisibleRange();
        });
      } else {
        this.$nextTick(() => {
          this.updateVisibleRange();
        });
      }
    },

    // Update visible range for virtual scrolling with dynamic heights
    updateVisibleRange() {
      const container = this.$refs.container;
      if (!container || this.filteredLogs.length === 0) {
        this.visibleStart = 0;
        this.visibleEnd = 0;
        return;
      }

      const containerHeight = container.clientHeight;
      const scrollTop = container.scrollTop;

      // Ensure we have valid dimensions
      if (containerHeight <= 0) {
        return;
      }

      //since we have fixed line height, we can calculate visible range directly
      // Find visible start index
      let startIndex = Math.floor(scrollTop / this.lineHeight);
      startIndex = Math.max(
        0,
        Math.min(startIndex, this.filteredLogs.length - 1)
      );
      let endIndex = Math.ceil((scrollTop + containerHeight) / this.lineHeight);
      this.visibleStart = startIndex;
      this.visibleEnd = endIndex;
    },
    setCurrentEntry(entry) {
      this.crrEntry = entry;
      this.pauseAutoScroll(10000);
    },

    // Handle scroll events
    handleScroll(event) {
      this.scrollTop = event.target.scrollTop;
      this.updateVisibleRange();

      // Check if user scrolled near the bottom
      const container = event.target;
      const isNearBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - this.lineHeight * 2;

      if (isNearBottom && this.autoScrollPaused) {
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
    pauseAutoScroll(timeout=30000) {
      this.autoScrollPaused = true;

      // Clear existing timer
      if (this.autoScrollTimer) {
        clearTimeout(this.autoScrollTimer);
      }

      // Set timer for 30 seconds
      this.autoScrollTimer = setTimeout(() => {
        this.crrEntry=''; //close current entry
        this.resumeAutoScroll();
      }, timeout||30000);
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

    // Get offset Y for virtual scrolling
    getOffsetY() {
      return this.visibleStart * this.lineHeight;
    },
  },

  // Lifecycle hooks
  mounted() {
    // Ensure virtual scrolling is updated after DOM is ready
    this.$nextTick(() => {
      this.updateVisibleRange();
      this.render();
    });
  },

  // Watch for changes
  watch: {},

  // Cleanup
  beforeUnmount() {
    if (this.autoScrollTimer) {
      clearTimeout(this.autoScrollTimer);
    }
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
        background: var(--bg-primary);
        overflow: hidden;
      }

      .log-container {
        height: 100%;
        min-height:0;
        overflow-x: hidden;
        overflow-y: auto;
        background: var(--bg-primary);
        position: relative;
      }

      .log-viewer-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--bg-secondary);
        padding: var(--spacing-xs);
        gap: var(--spacing-md);
      }

      .filter-controls {
        display: flex;
        gap: var(--spacing-sm);
        align-items: center;
      }

      .level-filter, .text-filter {
        padding: var(--spacing-xs) var(--spacing-sm);
        border:none;
        border-radius: var(--spacing-xs);
        background: var(--bg-primary);
        color: var(--text-primary);
        font-size: var(--font-size-sm);
      }

      .level-filter { min-width: fit-content;background: var(--bg-tertiary); }
      .text-filter { min-width: 200px; }

      .text-filter:focus, .level-filter:focus {
        outline: none;
        border: 1px solid var(--accent-active);
      }
      .scroll-status { font-size: var(--font-size-sm); color: var(--text-muted); }
      .log-content { position: relative; }
      .log-spacer { width: 100%; }

      .log-entry {
        display: flex;
        align-items: flex-start;
        padding: 0 var(--spacing-sm);
        border-left: var(--spacing-xs) solid var(--border-color);
        font-family: 'Consolas', monospace;
        font-size: var(--font-size-sm);
        line-height: 16px; 
      }
      

      .log-entry:hover { background: var(--bg-hover); }

      /* Log level border colors */
      .log-entry.log-level-LOG,
      .log-entry.log-level-NORMAL { border-left-color: var(--primary-color); }
      .log-entry.log-level-DEBUG,
      .log-entry.log-level-TRACE{ border-left-color: var(--text-muted); }
      .log-entry.log-level-WARN{ border-left-color: var(--yellow); }
      .log-entry.log-level-INFO{ border-left-color: var(--blue); }
      .log-entry.log-level-SUCCESS{ border-left-color: var(--green); }
      .log-entry.log-level-ERROR{ border-left-color: var(--red); }
      .log-entry.log-level-FATAL{ border-left-color: var(--magenta); }

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
        wrap:none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Log level text colors */
      .level-LOG,
      .level-NORMAL{ color: var(--text-primary); }
      .level-DEBUG,
      .level-TRACE{ color: var(--text-muted); }
      .level-WARN { color: var(--yellow); }
      .level-INFO{ color: var(--blue); }
      .level-SUCCESS {color:var(--green); }
      .level-ERROR { color: var(--red); }
      .level-FATAL { color: var(--magenta); }

      .selected-entry-container{
        margin:0;
        padding: var(--spacing-xs) var(--spacing-sm);
        background: var(--bg-secondary);
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
        background: transparent;
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
        background:transparent;
      }

    </style>
  `;
  document.head.insertAdjacentHTML('beforeend', styles);
}

// Export both ways
window.LogViewer = LogViewer;
