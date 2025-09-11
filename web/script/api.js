//Event listerner
// C# API
const API = {
  init() {
    window.chrome.webview.addEventListener('message', (event) => {
      const type = event.data['type'];
      const value = event.data['value'];
      const name = event.data['name'];
      const app = window.app; // Access the Vue app instance

      switch (type) {
        //log
        case 'log':
          app.addLogEntries(value);
          break;

        //cycle info
        case 'set_model_name':
          app.crrModelName = value;
          break;
        case 'set_body_no':
          app.crrVinNo = value;
          break;
        case 'set_seq_no':
          app.crrSeqNo = value;
          break;
        // plc
        case 'set_pinmap':
          app.setPlcPinmap(value);
          break;
        case 'set_input_pin':
          app.setInputPin(name, value);
          break;
        case 'set_output_pin':
          app.setOutputPin(name, value);
          break;

        //result
        case 'set_result':
          app.setResultTable(value);
          break;

        //stats
        case 'set_history':
          app.setHistory(value);
          break;
        case 'set_counters':
          app.setCounters(value);
          break;
        case 'set_hourly':
          app.setHourlyData(value);
          break;

        //mode
        case 'set_auto_mode':
          app.isAutoMode = true;
          break;
        case 'set_manual_mode':
          app.isAutoMode = false;
          break;
      }
    });

    //load display state from C# when loaded
    CSharpUtils.sendMessage({ type: 'get_mode' }); //pinmap and pin state
    CSharpUtils.sendMessage({ type: 'get_pinmap' }); //pinmap and pin state
    CSharpUtils.sendMessage({ type: 'get_cycle_info' }); //model, body, seq
    CSharpUtils.sendMessage({ type: 'get_result' }); //latest get results
    CSharpUtils.sendMessage({ type: 'get_history' }); //last results + counter
  },
};

window.API = API;
