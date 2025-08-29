// ============================================================================
// Lotus Production Dashboard Script
// ============================================================================
// This script manages the dashboard UI, log system, PLC pin display, charts,
// tooltips, and event handling for the Lotus production dashboard.
// ============================================================================

// -----------------------------
// C# Bridge Communication
// -----------------------------

function sendMessageToCSharp(messageData) {
  if (window.chrome && window.chrome.webview) {
    window.chrome.webview.postMessage(messageData);
  } else {
    console.warn("WebView2 postMessage API not available.");
  }
}

// ============================================================================
// ProductionDashboard Class
// ============================================================================

class ProductionDashboard {
  // -----------------------------
  // Constructor & Initialization
  // -----------------------------

  constructor() {
    // Initialize state variables and cache DOM elements
    this.currentTheme = localStorage.getItem("theme") || "dark";
    this.activeSection = localStorage.getItem("lastSection") || "table";
    this.logEntries = [];
    this.currentMinilogEntry;
    this.activeLogFilter = "LOG";
    this.ngFilterActive = false;
    this.tableData = [];
    //current pinmap
    this.plcInputPins = [];
    this.plcOuptutPins = [];
    this.stats = { ok: 0, ng: 0 };
    this.tooltip = null;
    this.tooltipTimeout = null;
    this.tooltipAutoCloseTimer = null;
    this.tooltipOnMinilog = false;
    this.tooltipVisible = false;
    this.autoScrollEnabled = true;
    this.autoScrollTimeout = null;
    this.pausedScrollPosition = null;
    this.hourlyData = this.generateHourlyData();
    this.animationProgress = 0;
    this.isAnimating = false;
    this.activeChart = "distribution";
    this.donutAnimationId = null;
    this.hourlyAnimationId = null;
    this.clusterize = null;

    // Mini log counters
    this.miniLogCounters = {
      total: 0,
      warn: 0,
      error: 0,
    };

    // Pin change tracking
    this.pinChangeTimeouts = new Map();

    // Cache frequently accessed DOM elements
    this.elements = {};

    this.init();
  }

  // Caches frequently used DOM elements for performance
  cacheElements() {
    this.elements = {
      themeToggle: document.getElementById("themeToggle"),
      themeIcon: document.querySelector("#themeToggle i"),
      tableBody: document.getElementById("tableBody"),
      logsContainer: document.getElementById("logsContainer"),
      inputItems: document.getElementById("inputItems"),
      outputItems: document.getElementById("outputItems"),
      ngFilterToggle: document.getElementById("ngFilterToggle"),
      okCount: document.getElementById("okCount"),
      ngCount: document.getElementById("ngCount"),
      okPercentage: document.getElementById("okPercentage"),
      ngPercentage: document.getElementById("ngPercentage"),
      currentModel: document.getElementById("currentModel"),
      currentBodyNo: document.getElementById("currentBodyNo"),
      currentSeqNo: document.getElementById("currentSeqNo"),
      donutChart: document.getElementById("donutChart"),
      hourlyChart: document.getElementById("hourlyChart"),
      okLegendPercent: document.getElementById("okLegendPercent"),
      ngLegendPercent: document.getElementById("ngLegendPercent"),
      miniLog: document.getElementById("miniLog"),
      miniLogTotal: document.getElementById("miniLogTotal"),
      miniWarnCounter: document.getElementById("miniWarnCounter"),
      miniErrorCounter: document.getElementById("miniErrorCounter"),

      logsScrollArea: document.getElementById("logsContainer"), // scroll area
      logsContentArea: document.getElementById("logsContentArea"), // content area (see HTML note below)
    };
  }

  // Initializes the dashboard, event listeners, tooltips, and charts
  init() {
    this.cacheElements();
    this.applyTheme();
    this.setupEventListeners();
    this.createTooltip();
    this.initializeCharts();
    this.updateMiniLogCounters();
    this.updateMiniLogVisibility();
    this.setupMiniLogTooltip();
    this.setupClusterize();
    this.setupLogTooltips();

    // Double-click event for model card
    const modelCard = document.querySelector(
      ".info-cards-row .info-card:first-child"
    );
    if (modelCard) {
      modelCard.addEventListener("dblclick", () => {
        console.log("Model card double-clicked");
        sendMessageToCSharp({ type: "model_dblclicked" });
      });
    }

    this.switchSection(this.activeSection);
  }

  // -----------------------------
  // Theme Management
  // -----------------------------

  // Applies the current theme to the document
  applyTheme() {
    document.documentElement.setAttribute("data-theme", this.currentTheme);
    const { themeToggle, themeIcon } = this.elements;

    if (this.currentTheme === "dark") {
      themeIcon.className = "fas fa-sun";
      themeToggle.style.backgroundColor = "#fdf6e3";
      themeToggle.style.color = "#657b83";
    } else {
      themeIcon.className = "fas fa-moon";
      themeToggle.style.backgroundColor = "#002b36";
      themeToggle.style.color = "#839496";
    }
  }

  // Toggles between light and dark themes
  toggleTheme() {
    this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
    localStorage.setItem("theme", this.currentTheme);
    this.applyTheme();
  }

  // -----------------------------
  // Event Listeners
  // -----------------------------

  // Sets up all event listeners for UI interaction
  setupEventListeners() {
    // Theme toggle
    this.elements.themeToggle.addEventListener("click", () => {
      this.toggleTheme();
    });

    // Delegated click events for navigation, filters, and charts
    document.addEventListener("click", (e) => {
      if (
        e.target.matches(".control-btn[data-section]") ||
        e.target.closest(".control-btn[data-section]")
      ) {
        const btn = e.target.closest(".control-btn[data-section]");
        const section = btn.dataset.section;
        this.switchSection(section);
      }
      if (e.target.matches(".log-filter") || e.target.closest(".log-filter")) {
        const filter = e.target.closest(".log-filter");
        const level = filter.dataset.level;
        this.setLogFilter(level);
      }
      if (
        e.target.matches(".chart-toggle") ||
        e.target.closest(".chart-toggle")
      ) {
        const btn = e.target.closest(".chart-toggle");
        const chartType = btn.dataset.chart;
        this.switchChart(chartType);
      }
    });

    // NG filter toggle
    if (this.elements.ngFilterToggle) {
      this.elements.ngFilterToggle.addEventListener("click", () => {
        this.toggleNGFilter();
      });
    }

    // Log scroll detection
    this.setupLogScrollDetection();

    // Disable right-click context menu
    document.addEventListener("contextmenu", (e) => {
      // e.preventDefault();
      return false;
    });

    // Disable text selection with drag
    document.addEventListener("selectstart", (e) => {
      e.preventDefault();
      return false;
    });

    // Disable F12, Ctrl+Shift+I, Ctrl+U (developer tools shortcuts)
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
        return false;
      }
    });
  }

  // -----------------------------
  // Section Management
  // -----------------------------

  // Switches between dashboard sections (table, logs, charts, etc.)
  switchSection(sectionName) {
    this.hideTooltip();
    this.activeSection = sectionName;
    this.updateMiniLogVisibility();

    document.querySelectorAll(".control-btn[data-section]").forEach((btn) => {
      btn.classList.remove("active");
    });
    document
      .querySelector(`[data-section="${sectionName}"]`)
      .classList.add("active");

    document.querySelectorAll(".content-section").forEach((section) => {
      section.classList.remove("active");
    });
    document.getElementById(`${sectionName}-section`).classList.add("active");

    localStorage.setItem("lastSection", sectionName);

    if (sectionName === "charts") {
      setTimeout(() => {
        this.initializeCharts();
      }, 150);
    }
  }

  // -----------------------------
  // Table Management
  // -----------------------------

  // Checks if a date string is today
  isToday(dateString) {
    const today = new Date();
    const checkDate = new Date(dateString);
    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  }

  // Sets the result table data and renders it
  setResultTable(data) {
    if (!data) return;
    this.resultTables = data["tables"];
    console.log("Result Tables: " + JSON.stringify(this.resultTables));
    this.renderResultTable();
  }

  // Renders the result table (point data)
  renderResultTable() {
    const resultData = document.getElementById("resultTables");
    if (!this.resultTables) {
      resultData.innerHTML = "";
      return;
    }
    //render tables
    resultData.innerHTML = this.resultTables
      .map((table) => {
        // Render table headers
        const headers = table["columns"]
          .map((column) => `<th>${column}</th>`)
          .join("");

        // Render table rows
        const rows = table["rows"]
          .map((row) => {
            if (!row)
              return `<tr><td colspan='${table["columns"].length}' style='text-align: center;'>no data</td></tr>`;
            const cells = table["columns"]
              .map((column) => {
                // Skip the "ok" column entirely
                if (column == "ok") return;
                // If column is "Name", just show the value
                if (column === "Name") {
                  return `<td><span class="status-badge ${
                    row["ok"] ? "ok" : "ng"
                  }">${row[column]}</span></td>`;
                }
                // Otherwise, highlight cell if *_ok is false
                const okKey = column + "_ok";
                const ngClass = row[okKey] ? "" : 'class="ng-text"';
                return `<td ${ngClass}>${row[column]}</td>`;
              })
              .join("");
            return `<tr>${cells}</tr>`;
          })
          .join("");

        // Compose the full table HTML
        return `
      <div class="result-table-wrapper">
        <h3>${table["name"]}</h3>
        <div class="table-container">
          <table class="result-table">
            <thead>
              <tr>${headers}</tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
    `;
      })
      .join("");
  }

  // Sets the last results table (history) and renders it
  setLastResultsTable(data) {
    if (!data) return;
    this.tableData = data["value"];
    this.renderHistoryTable();
  }

  // Renders the history table (cycle records)
  renderHistoryTable() {
    const tbody = this.elements.tableBody;
    let filteredData = this.tableData;

    if (this.ngFilterActive) {
      filteredData = filteredData.filter((row) => row["res"] === "NG");
    }

    if (!filteredData) return;
    tbody.innerHTML = filteredData
      .map(
        (row, index) => `
            <tr class="table-row" data-row-index="${index}">
                <td style="display: none;">${row["id"]}</td>
                <td>${row["time"]}</td>
                <td>${row["model"]}</td>
                <td>${row["body"]}</td>
                <td>${row["seq"]}</td>
                <td><span class="result-badge result-${row[
                  "res"
                ].toLowerCase()}">${row["res"]}</span></td>
            </tr>
        `
      )
      .join("");
    this.setupTableRowEvents();
    const tableContainer = tbody.closest(".table-container");
    if (tableContainer) {
      tableContainer.scrollTop = 0;
    }
  }

  // -----------------------------
  // PLC Pinmap Management
  // -----------------------------

  // Sets the PLC pinmap data and renders PLC pins
  setupPlcPinmap(data) {
    if (!data) return;
    const pinmap = data["value"];
    if (!pinmap) return;

    console.log("Pinmap: " + JSON.stringify(pinmap));

    //convert lotus api pin maps -> internal pin representation
    this.plcInputPins = pinmap
      .filter((item) => item.Function == "DI")
      .map((item, index) => ({
        pin: `I.${item.Index}`,
        bitIndex: item.Index,
        index: index,
        active: false,
        name: item.Name,
        description: item.Text == "" ? item.Name : item.Text,
        color: `rgb(${item.Color[0]},${item.Color[1]},${item.Color[2]})`,
      }));

    this.plcOuptutPins = pinmap
      .filter((item) => item.Function == "DO")
      .map((item, index) => ({
        pin: `O.${item.Index}`,
        bitIndex: item.Index,
        index: index,
        active: false,
        name: item.Name,
        description: item.Text == "" ? item.Name : item.Text,
        color: `rgb(${item.Color[0]},${item.Color[1]},${item.Color[2]})`,
      }));

    console.log("INPUT: " + JSON.stringify(this.plcInputPins));
    console.log("OUTPUT: " + JSON.stringify(this.plcOuptutPins));

    //setup pin map once
    this.elements.inputItems.innerHTML = this.plcInputPins
      .map(
        (item, index) => `
                <div class="plc-item" data-pin-type="input" data-pin-index="${index}">
                    <span class="pin-badge passive" pin-id="input-${item.name}">${item.pin}</span>
                    <span class="pin-description">${item.description}</span>
                </div>
            `
      )
      .join("");

    this.elements.outputItems.innerHTML = this.plcOuptutPins
      .map(
        (item, index) => `
                <div class="plc-item" data-pin-type="output" data-pin-index="${index}">
                    <span class="pin-badge passive" pin-id="output-${item.name}">${item.pin}</span>
                    <span class="pin-description">${item.description}</span>
                </div>
            `
      )
      .join("");

    this.setupPinEventListeners();
  }

  // Sets the state of an input pin and highlights if active
  setInputPin(data) {
    if (!data) return;
    const name = data["name"];
    const value = data["value"];
    if (!name) return;
    const pin = this.plcInputPins.find((x) => x.name == name);
    if (!pin) return;
    const badge = this.elements.inputItems.querySelector(
      `[pin-id="input-${name}"]`
    );
    if (pin && badge) {
      pin.active = value;
      console.log(`DI.${pin.name} = ${value}`);
      this.setPinState(pin, badge);
      this.flashBadge("readBadge");
    }
  }

  // Sets the state of an output pin and highlights if active
  setOutputPin(data) {
    if (!data) return;
    const name = data["name"];
    const value = data["value"];
    if (!name) return;
    const pin = this.plcOuptutPins.find((x) => x.name == name);
    if (!pin) return;
    const badge = this.elements.outputItems.querySelector(
      `[pin-id="output-${name}"]`
    );
    if (pin && badge) {
      pin.active = value;
      console.log(`DO.${pin.name} = ${value}`);
      this.setPinState(pin, badge);
      this.flashBadge("writeBadge");
    }
  }

  //chang state of the pin badge
  setPinState(pin, badge) {
    const pinKey = `${pin.pin}-${pin.name}`;
    if (pin.active) {
      const timeout = setTimeout(() => {
        this.pinChangeTimeouts.delete(pinKey);
        badge.className = "pin-badge active";
      }, 5000);
      this.pinChangeTimeouts.set(pinKey, timeout);
      badge.className = "pin-badge active recently-changed";
    } else badge.className = "pin-badge passive";
  }

  // -----------------------------
  // PLC Pin Event Handlers
  // -----------------------------

  // Sets up double-click event listeners for PLC pins
  setupPinEventListeners() {
    const plcItems = document.querySelectorAll(".plc-item");
    plcItems.forEach((item) => {
      item.addEventListener("dblclick", (e) => {
        e.preventDefault();
        const pinType = item.dataset.pinType;
        const pinIndex = parseInt(item.dataset.pinIndex);
        const pinData =
          pinType === "input"
            ? this.plcInputPins[pinIndex]
            : this.plcOuptutPins[pinIndex];
        sendMessageToCSharp({
          type: "pin_dblclicked",
          func: pinType,
          name: pinData.name,
        });
        console.log("Pin DblClick: " + JSON.stringify(pinData));
      });
    });
  }

  // Shows details for a PLC pin (for debugging)
  showPinDetails(plcItem) {
    const pinType = plcItem.dataset.pinType;
    const pinIndex = parseInt(plcItem.dataset.pinIndex);
    const pinData =
      pinType === "input"
        ? this.plcInputPins[pinIndex]
        : this.plcOuptutPins[pinIndex];
    if (pinData) {
      const statusText = pinData.active ? "ACTIVE" : "PASSIVE";
      const typeText = pinType.toUpperCase();
      const jsonData = {
        pin: pinData.pin,
        name: pinData.name,
        type: typeText,
        status: statusText,
        active: pinData.active,
        description: pinData.description,
        timestamp: new Date().toISOString(),
        category: pinType,
      };
      const message = JSON.stringify(jsonData, null, 2);
      alert(message);
    }
  }

  // -----------------------------
  // Mini Log Management
  // -----------------------------

  // Updates mini log visibility based on section
  updateMiniLogVisibility() {
    if (!this.elements.miniLog) return;
    if (this.activeSection === "logs") {
      this.elements.miniLog.classList.remove("hidden");
      this.elements.miniLog.classList.add("counters-only");
    } else {
      this.elements.miniLog.classList.remove("hidden");
      this.elements.miniLog.classList.remove("counters-only");
    }
  }

  // Sets up tooltip for mini log
  setupMiniLogTooltip() {
    if (!this.elements.miniLog) return;
    this.elements.miniLog.addEventListener("onclick", (e) => {
      if (this.currentMinilogEntry) {
        this.showTooltip(e, this.currentMinilogEntry);
        this.updateTooltipPosition(e);
      }
    });
    this.elements.miniLog.addEventListener("mouseleave", () => {
      this.hideTooltip();
    });
  }

  // Updates the mini log display with the latest entry
  updateMiniLog(time, level, message) {
    if (!this.elements.miniLog) return;
    this.currentMinilogEntry = `${time} ${level} ${message}`;
    const levelEl = this.elements.miniLog.querySelector(".log-level");
    const messageEl = this.elements.miniLog.querySelector(".log-message");
    if (levelEl && messageEl) {
      levelEl.textContent = level;
      levelEl.className = `log-level log-${level}`;
      messageEl.textContent = message;
    }
  }

  // -----------------------------
  // Mini Log Counter Management
  // -----------------------------

  // Updates the mini log counters display
  updateMiniLogCounters() {
    if (!this.elements.miniLogTotal) return;
    this.elements.miniLogTotal.querySelector(".counter-value").textContent =
      this.miniLogCounters.total;
    this.elements.miniWarnCounter.querySelector(".counter-value").textContent =
      this.miniLogCounters.warn;
    this.elements.miniErrorCounter.querySelector(".counter-value").textContent =
      this.miniLogCounters.error;
  }

  // Increments the mini log counters based on log level
  incrementLogCounter(level) {
    this.miniLogCounters.total++;
    switch (level) {
      case "WARN":
        this.miniLogCounters.warn++;
        break;
      case "ERROR":
      case "FATAL":
        this.miniLogCounters.error++;
        break;
    }
    this.updateMiniLogCounters();
  }

  // -----------------------------
  // Log Management
  // -----------------------------

  // Adds a single log entry to the log list
  addLogEntry(log) {
    if (!log) return;
    const level = log["l"].toUpperCase();
    const timestamp = log["t"];
    const message = log["m"];
    const entry = {
      level: level,
      timestamp: timestamp.split(" ")[1],
      id: timestamp,
      message: message,
    };
    this.logEntries.push(entry);
    const MAX_LOGS = 1000;
    if (this.logEntries.length > MAX_LOGS) {
      this.logEntries = this.logEntries.slice(-MAX_LOGS);
    }
    if (level != "DEBUG" && level != "TRACE")
      this.updateMiniLog(timestamp, level, message);
    this.renderLogs();
    this.incrementLogCounter(level);
  }

  // Adds multiple log entries at once
  addLogEntries(data) {
    if (!data) return;
    const entries = data["value"];
    if (!entries) return;
    entries.forEach((entry) => this.addLogEntry(entry));
  }

  // Renders the log entries using Clusterize or fallback
  renderLogs() {
    let filteredLogs;
    if (this.activeLogFilter === "LOG") {
      filteredLogs = this.logEntries.filter(
        (log) => log.level !== "DEBUG" && log.level !== "TRACE"
      );
    } else if (this.activeLogFilter === "WARN") {
      filteredLogs = this.logEntries.filter(
        (log) =>
          log.level === "WARN" || log.level === "ERROR" || log.level === "FATAL"
      );
    } else if (this.activeLogFilter === "ERROR") {
      filteredLogs = this.logEntries.filter(
        (log) => log.level === "ERROR" || log.level === "FATAL"
      );
    } else {
      filteredLogs = this.logEntries;
    }
    const rows = filteredLogs.map((log, index) => {
      const isLatest = index === filteredLogs.length - 1;
      const latestClass = isLatest ? " latest-log" : "";
      return `
            <div class="log-entry${latestClass}"">
                <span class="log-timestamp">${log.timestamp}</span>
                <span class="log-level log-${log.level}">${log.level}</span>
                <span class="log-message">${log.message}</span>
            </div>
        `;
    });

    if (this.clusterize) {
      this.clusterize.update(rows);
    }

    if (this.autoScrollEnabled && this.elements.logsScrollArea) {
      this.elements.logsScrollArea.scrollTop =
        this.elements.logsScrollArea.scrollHeight;
    } else if (
      this.pausedScrollPosition !== null &&
      this.elements.logsScrollArea
    ) {
      this.elements.logsScrollArea.scrollTop = this.pausedScrollPosition;
    }
  }

  // -----------------------------
  // Tooltip Management
  // -----------------------------

  // Creates the tooltip DOM element
  createTooltip() {
    if (this.tooltip) {
      this.tooltip.remove();
    }
    this.tooltip = document.createElement("div");
    this.tooltip.className = "log-tooltip";
    document.body.appendChild(this.tooltip);
  }

  // Ensures the tooltip exists in the DOM
  ensureTooltipExists() {
    if (!this.tooltip) {
      this.createTooltip();
    }
  }

  // Sets up tooltips for log entries
  setupLogTooltips() {
    const container =
      this.elements.logsContentArea || this.elements.logsContainer;
    if (!container) return;
    container.onclick = async (e) => {
      const entry = e.target.closest(".log-entry");
      if (entry) {
        const timestamp =
          entry.querySelector(".log-timestamp")?.textContent || "";
        const level = entry.querySelector(".log-level")?.textContent || "";
        const message = entry.querySelector(".log-message")?.textContent || "";
        const fullMessage = `${timestamp} ${level} ${message}`;
        clearTimeout(this.tooltipAutoCloseTimer);
        this.showTooltip(e, fullMessage);
        this.pauseAutoScroll();
        this.updateTooltipPosition(e);
        this.tooltipAutoCloseTimer = setTimeout(() => {
          this.hideTooltip();
        }, 3000);
      }
    };
  }

  // Shows a tooltip with the given message at the event position
  showTooltip(event, message) {
    this.ensureTooltipExists();
    const parts = message.split(" ");
    const timestamp = parts[0];
    const level = parts[1];
    const msg = parts.slice(2).join(" ");
    const messageText = msg.replace(/\n/g, "<br>");
    const tooltipHTML = `
            <span style="font-size:14px; color: var(--text-muted); margin-right: 8px;">${timestamp}</span>
            <span class="log-level log-${level}" style="font-size:10px; margin-right: 8px;">${level}</span>
            <br>
            <span style="font-size:16px;">${messageText}</span>
        `;
    this.tooltip.innerHTML = tooltipHTML;
    this.tooltip.style.display = "block";
    this.updateTooltipPosition(event);
  }

  // Hides the tooltip
  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.style.display = "none";
    }
    const existingTooltips = document.querySelectorAll(
      ".log-tooltip, .tooltip"
    );
    existingTooltips.forEach((tooltip) => {
      tooltip.style.display = "none";
    });
  }

  // Updates the tooltip position based on the event
  updateTooltipPosition(event) {
    if (
      !this.tooltip ||
      !this.tooltip.style.display ||
      this.tooltip.style.display === "none"
    )
      return;
    if (this.tooltipTimeout) return;
    this.tooltipTimeout = setTimeout(() => {
      this.tooltipTimeout = null;
      const rect = this.tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      let x = event.clientX + 10;
      let y = event.clientY + 10;
      if (x + rect.width > viewportWidth) {
        x = event.clientX - rect.width - 10;
      }
      if (y + rect.height > viewportHeight) {
        y = event.clientY - rect.height - 10;
      }
      if (x < 0) {
        x = 10;
      }
      if (y < 0) {
        y = 10;
      }
      this.tooltip.style.left = x + scrollX + "px";
      this.tooltip.style.top = y + scrollY + "px";
    }, 100);
  }

  // Escapes HTML for safe display
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // -----------------------------
  // Log Filter Management
  // -----------------------------

  // Sets the active log filter and updates UI
  setLogFilter(level) {
    this.activeLogFilter = level;
    document.querySelectorAll(".log-filter").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelector(`[data-level="${level}"]`).classList.add("active");
    // this.pauseAutoScroll();
    this.renderLogs();
  }

  // -----------------------------
  // NG Filter Management
  // -----------------------------

  // Toggles the NG filter for the table
  toggleNGFilter() {
    this.ngFilterActive = !this.ngFilterActive;
    const ngFilterToggle = document.getElementById("ngFilterToggle");
    if (this.ngFilterActive) {
      ngFilterToggle.classList.add("active");
    } else {
      ngFilterToggle.classList.remove("active");
    }
    this.renderHistoryTable();
  }

  // -----------------------------
  // Auto-scroll Management
  // -----------------------------

  // Sets up scroll detection for log area
  setupLogScrollDetection() {
    const container = this.elements.logsContainer;
    if (container) {
      container.addEventListener("scroll", () => {
        this.onUserScroll();
      });
      container.addEventListener("wheel", () => {
        this.onUserScroll();
      });
    }
  }

  // Handles user scroll events to pause/resume auto-scroll
  onUserScroll() {
    const container = this.elements.logsContainer;
    if (!container) return;
    const isAtBottom =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 5;
    if (!isAtBottom) {
      this.pauseAutoScroll();
    } else {
      this.resumeAutoScroll();
    }
  }

  // Pauses auto-scroll and sets a timeout to resume
  pauseAutoScroll() {
    const container = this.elements.logsContainer;
    if (container) {
      this.pausedScrollPosition = container.scrollTop;
    }
    this.autoScrollEnabled = false;
    clearTimeout(this.autoScrollTimeout);
    this.autoScrollTimeout = setTimeout(() => {
      this.resumeAutoScroll();
    }, 5000);
  }

  // Resumes auto-scroll and scrolls to bottom
  resumeAutoScroll() {
    this.autoScrollEnabled = true;
    this.pausedScrollPosition = null;
    const container = this.elements.logsContainer;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  // -----------------------------
  // Table Row Event Handlers
  // -----------------------------

  // Sets up click and double-click events for table rows
  setupTableRowEvents() {
    const tableRows = document.querySelectorAll(".table-row");
    tableRows.forEach((row) => {
      row.addEventListener("click", (e) => {
        this.showTableRowTooltip(e, row);
        this.updateTooltipPosition(e);
      });
      row.addEventListener("mouseleave", () => {
        this.hideTooltip();
      });
      row.addEventListener("dblclick", (e) => {
        e.preventDefault();
        this.showTableRowDetails(row);
      });
    });
  }

  // Shows a tooltip for a table row with cycle details
  showTableRowTooltip(event, row) {
    this.ensureTooltipExists();
    const rowIndex = parseInt(row.dataset.rowIndex);
    const rowData = this.tableData[rowIndex];
    if (rowData) {
      const resultClass = rowData.result.toLowerCase();
      const resultColor =
        resultClass === "ok" ? "var(--accent-ok)" : "var(--accent-ng)";
      const tooltipHTML = `
                <div style="font-family: 'Segoe UI', sans-serif; line-height: 1.5;">
                    <div style="font-weight: 600; margin-bottom: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 4px; text-align: center;">
                        Cycle Item Details
                    </div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                        <tr>
                            <td style="padding: 4px 8px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color); width: 35%; text-align: right;">ID</td>
                            <td style="padding: 4px 8px; border-bottom: 1px solid var(--border-color); text-align: left;">${rowData.id}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 8px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color); text-align: right;">DateTime</td>
                            <td style="padding: 4px 8px; border-bottom: 1px solid var(--border-color); text-align: left;">${rowData.dateTime}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 8px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color); text-align: right;">Model</td>
                            <td style="padding: 4px 8px; border-bottom: 1px solid var(--border-color); text-align: left;">${rowData.model}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 8px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color); text-align: right;">Body No</td>
                            <td style="padding: 4px 8px; border-bottom: 1px solid var(--border-color); text-align: left;">${rowData.bodyNo}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 8px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color); text-align: right;">Seq No</td>
                            <td style="padding: 4px 8px; border-bottom: 1px solid var(--border-color); text-align: left;">
                                ${rowData.seqNo}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 8px; font-weight: 600; color: var(--text-muted); text-align: right;">Result</td>
                            <td style="padding: 4px 8px; text-align: left;">
                                <span style="background: ${resultColor}; color: white; padding: 2px 6px; border-radius: 8px; font-size: 11px; font-weight: 600;">
                                    ${rowData.result}
                                </span>
                            </td>
                        </tr>
                    </table>
                </div>
            `;
      this.tooltip.innerHTML = tooltipHTML;
      this.tooltip.style.display = "block";
      this.updateTooltipPosition(event);
    }
  }

  // Shows a JSON alert with all data for a table row
  showTableRowDetails(row) {
    const rowIndex = parseInt(row.dataset.rowIndex);
    const rowData = this.tableData[rowIndex];
    if (rowData) {
      const jsonContent = JSON.stringify(rowData, null, 2);
      const message = `${jsonContent}`.trim();
      alert(message);
    }
  }

  // -----------------------------
  // Statistics and Info Updates
  // -----------------------------

  // Sets the OK/NG counters and updates the UI
  setCounters(data) {
    if (!data) return;
    console.log("Counters: " + JSON.stringify(data));
    this.stats.ok = data["ok"];
    this.stats.ng = data["ng"];
    const total = Math.max(1, this.stats.ok + this.stats.ng);
    const okPercentage = ((this.stats.ok / total) * 100).toFixed(1);
    const ngPercentage = ((this.stats.ng / total) * 100).toFixed(1);
    this.elements.okCount.textContent = this.stats.ok;
    this.elements.ngCount.textContent = this.stats.ng;
    this.elements.okPercentage.textContent = `${okPercentage}%`;
    this.elements.ngPercentage.textContent = `${ngPercentage}%`;
  }

  // Sets the model name in the UI
  setModelName(data) {
    this.elements.currentModel.textContent = !data ? "-" : data["value"];
  }
  setBodyNo(data) {
    this.elements.currentBodyNo.textContent = !data ? "-" : data["value"];
  }
  setSeqNo(data) {
    this.elements.currentSeqNo.textContent = !data ? "-" : data["value"];
  }

  // -----------------------------
  // Chart Management
  // -----------------------------
  // Generates random hourly data for the chart
  generateHourlyData() {
    const hourlyData = [];
    const currentHour = new Date().getHours();
    for (let hour = 0; hour < 24; hour++) {
      const baseOk = Math.floor(Math.random() * 50) + 20;
      const baseNg = Math.floor(Math.random() * 8) + 1;
      hourlyData.push({
        hour: hour,
        ok: hour <= currentHour ? baseOk : 0,
        ng: hour <= currentHour ? baseNg : 0,
      });
    }
    console.log("Generated hourly data:", hourlyData);
    return hourlyData;
  }

  // Initializes both donut and hourly charts
  initializeCharts() {
    this.initializeDonutChart(false);
    this.initializeHourlyChart(false);
  }

  // Initializes the donut chart (with optional animation)
  initializeDonutChart(animate = false) {
    const canvas = document.getElementById("donutChart");
    if (!canvas) return;
    const container = canvas.parentElement;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = Math.max(containerRect.width || 200, 200);
    const containerHeight = Math.max(containerRect.height || 200, 200);
    const size = Math.max(
      Math.min(containerWidth - 40, containerHeight - 40, 250),
      150
    );
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    const ctx = canvas.getContext("2d");
    const total = this.stats.ok + this.stats.ng;
    const okPercent = (this.stats.ok / total) * 100;
    const ngPercent = (this.stats.ng / total) * 100;
    if (animate) {
      this.animateDonutChart(ctx, okPercent, ngPercent, size);
    } else {
      this.drawDonutChart(ctx, okPercent, ngPercent, 1, size);
    }
  }

  // Animates the donut chart
  animateDonutChart(ctx, okPercent, ngPercent, size = 200) {
    if (this.donutAnimationId) {
      cancelAnimationFrame(this.donutAnimationId);
      this.donutAnimationId = null;
    }
    let progress = 0;
    const duration = 800;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      this.drawDonutChart(
        ctx,
        okPercent * easeProgress,
        ngPercent * easeProgress,
        easeProgress,
        size
      );
      if (progress < 1) {
        this.donutAnimationId = requestAnimationFrame(animate);
      } else {
        this.donutAnimationId = null;
      }
    };
    animate();
  }

  // Draws the donut chart
  drawDonutChart(ctx, okPercent, ngPercent, progress = 1, size = 200) {
    size = Math.max(size, 100);
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = Math.max((size / 2) * 0.8, 40);
    const innerRadius = Math.max((size / 2) * 0.5, 25);
    ctx.clearRect(0, 0, size, size);
    const okAngle = (okPercent / 100) * 2 * Math.PI;
    const ngAngle = (ngPercent / 100) * 2 * Math.PI;
    const rotation = -Math.PI / 2 + (1 - progress) * Math.PI * 0.5;
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, rotation, rotation + okAngle);
    ctx.arc(centerX, centerY, innerRadius, rotation + okAngle, rotation, true);
    ctx.closePath();
    ctx.fillStyle = "#2ecc71";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      centerX,
      centerY,
      radius,
      rotation + okAngle,
      rotation + okAngle + ngAngle
    );
    ctx.arc(
      centerX,
      centerY,
      innerRadius,
      rotation + okAngle + ngAngle,
      rotation + okAngle,
      true
    );
    ctx.closePath();
    ctx.fillStyle = "#e74c3c";
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue("--text-primary")
      .trim();
    ctx.globalAlpha = progress;
    ctx.font = `bold ${Math.max(14, size * 0.08)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText("Total", centerX, centerY - 5);
    ctx.font = `${Math.max(12, size * 0.07)}px Arial`;
    ctx.fillText(
      Math.round((this.stats.ok + this.stats.ng) * progress),
      centerX,
      centerY + 15
    );
    ctx.globalAlpha = 1;
  }

  // Initializes the hourly bar chart (with optional animation)
  initializeHourlyChart(animate = false) {
    const canvas = document.getElementById("hourlyChart");
    if (!canvas) return;
    const container = canvas.parentElement;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = Math.max(containerRect.width || 432, 432);
    const containerHeight = Math.max(containerRect.height || 232, 232);
    const width = Math.max(containerWidth - 32, 400);
    const height = Math.max(containerHeight - 32, 200);
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    const ctx = canvas.getContext("2d");
    if (animate) {
      this.animateHourlyChart(ctx);
    } else {
      this.drawHourlyChart(ctx, 1);
    }
  }

  // Animates the hourly bar chart
  animateHourlyChart(ctx) {
    if (this.hourlyAnimationId) {
      cancelAnimationFrame(this.hourlyAnimationId);
      this.hourlyAnimationId = null;
    }
    let progress = 0;
    const duration = 1000;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      this.drawHourlyChart(ctx, easeProgress);
      if (progress < 1) {
        this.hourlyAnimationId = requestAnimationFrame(animate);
      } else {
        this.hourlyAnimationId = null;
      }
    };
    animate();
  }

  // Draws the hourly bar chart
  drawHourlyChart(ctx, progress = 1) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    ctx.clearRect(0, 0, width, height);
    if (!this.hourlyData || this.hourlyData.length === 0) {
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue("--text-primary")
        .trim();
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Loading chart data...", width / 2, height / 2);
      return;
    }
    const maxValue = Math.max(...this.hourlyData.map((d) => d.ok + d.ng));
    if (maxValue === 0) {
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue("--text-primary")
        .trim();
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText("No data available", width / 2, height / 2);
      return;
    }
    const scale = chartHeight / maxValue;
    const barWidth = chartWidth / 24;
    const okColor = "#2ecc71";
    const ngColor = "#e74c3c";
    const textColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--text-primary")
      .trim();
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    this.hourlyData.forEach((data, index) => {
      const x = padding + index * barWidth;
      const okHeight = data.ok * scale * progress;
      const ngHeight = data.ng * scale * progress;
      const totalHeight = okHeight + ngHeight;
      const staggerDelay = index * 0.02;
      const barProgress = Math.max(0, Math.min(1, progress - staggerDelay));
      const animatedOkHeight = okHeight * barProgress;
      const animatedNgHeight = ngHeight * barProgress;
      const animatedTotalHeight = animatedOkHeight + animatedNgHeight;
      if (animatedOkHeight > 0) {
        ctx.fillStyle = okColor;
        ctx.fillRect(
          x + 2,
          height - padding - animatedOkHeight,
          barWidth - 4,
          animatedOkHeight
        );
      }
      if (animatedNgHeight > 0) {
        ctx.fillStyle = ngColor;
        ctx.fillRect(
          x + 2,
          height - padding - animatedTotalHeight,
          barWidth - 4,
          animatedNgHeight
        );
      }
    });
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = textColor;
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.globalAlpha = progress;
    for (let i = 0; i < 24; i += 2) {
      const x = padding + i * barWidth + barWidth / 2;
      ctx.fillText(i + "h", x, height - 10);
    }
    ctx.textAlign = "right";
    ctx.font = "12px Arial";
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const value = Math.round((maxValue / steps) * i);
      const y = height - padding - (chartHeight / steps) * i;
      ctx.fillText(value.toString(), padding - 10, y + 3);
    }
    ctx.globalAlpha = 1;
  }

  // Updates both charts with new data
  updateCharts() {
    const total = this.stats.ok + this.stats.ng;
    const okPercent = (this.stats.ok / total) * 100;
    const ngPercent = (this.stats.ng / total) * 100;
    document.getElementById("okLegendPercent").textContent =
      okPercent.toFixed(1) + "%";
    document.getElementById("ngLegendPercent").textContent =
      ngPercent.toFixed(1) + "%";
    this.initializeDonutChart(false);
    const currentHour = new Date().getHours();
    if (this.hourlyData[currentHour]) {
      this.hourlyData[currentHour].ok = Math.floor(Math.random() * 50) + 20;
      this.hourlyData[currentHour].ng = Math.floor(Math.random() * 8) + 1;
    }
    this.initializeHourlyChart(false);
  }

  // Flashes a badge (for IO activity)
  flashBadge(badgeId) {
    const badge = document.getElementById(badgeId);
    if (!badge) return;
    badge.classList.remove("io-badge-flash");
    void badge.offsetWidth;
    badge.classList.add("io-badge-flash");
    setTimeout(() => {
      badge.classList.remove("io-badge-flash");
    }, 1600);
  }

  // -----------------------------
  // Utility Methods
  // -----------------------------

  // Formats a Date object as a date-time string
  formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  // Cancels chart animations for cleanup
  cleanup() {
    if (this.donutAnimationId) {
      cancelAnimationFrame(this.donutAnimationId);
      this.donutAnimationId = null;
    }
    if (this.hourlyAnimationId) {
      cancelAnimationFrame(this.hourlyAnimationId);
      this.hourlyAnimationId = null;
    }
  }

  // Formats a Date object as a time string with milliseconds
  formatTime(date) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ms = String(date.getMilliseconds()).padStart(3, "0");
    return `${hours}:${minutes}:${seconds}.${ms}`;
  }

  // -----------------------------
  // Clusterize Setup
  // -----------------------------

  // Initializes Clusterize.js for log virtualization
  setupClusterize() {
    if (
      window.Clusterize &&
      this.elements.logsScrollArea &&
      this.elements.logsContentArea
    ) {
      this.clusterize = new Clusterize({
        rows: [],
        scrollId: "logsContainer",
        contentId: "logsContentArea",
        rows_in_block: 32,
        blocks_in_cluster: 4,
        tag: "div",
      });
    }
  }
}
