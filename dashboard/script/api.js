
// Initialize the dashboard when DOM is loaded
const dashboard = new ProductionDashboard();

document.addEventListener("DOMContentLoaded", () => {
  // C# API
  window.chrome.webview.addEventListener("message", (event) => {
    const data = event.data;
    switch (data["type"]) {
      //log
      case "log": dashboard.addLogEntries(data); break;

      //cycle info
      case "set_model_name": dashboard.setModelName(data); break;
      case "set_body_no": dashboard.setBodyNo(data); break;
      case "set_seq_no": dashboard.setSeqNo(data); break;
      //plc
      case "set_pinmap": dashboard.setupPlcPinmap(data); break;
      case "set_input_pin": dashboard.setInputPin(data); break;
      case "set_output_pin": dashboard.setOutputPin(data); break;

      //result
      case "set_result":
        dashboard.setResultTable(data);
        break;

      //stats
      case "set_last_results":dashboard.setLastResultsTable(data); break;
      case "set_counters": dashboard.setCounters(data); break;
    }
  });

  //get current program state
  setTimeout(() => {
    sendMessageToCSharp({ type: "get_pinmap" });     //pinmap and pin state
    sendMessageToCSharp({ type: "get_cycle_info" }); //model, body, seq
    sendMessageToCSharp({ type: "get_result" });     //latest get results
    sendMessageToCSharp({ type: "get_history" });    //last results + counter
  }, 100);
  window.addEventListener("beforeunload", () => {
    dashboard.cleanup();
  });
});
