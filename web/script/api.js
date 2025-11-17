//Event listerner
// C# API
const API = {
  init() {
    if (!window.chrome.webview) return;
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
          app.cycleInfo.model = value;
          break;
        case 'set_body_no':
          app.cycleInfo.vin = value;
          break;
        case 'set_seq_no':
          app.cycleInfo.seq = value;
          break;
        case 'set_cycle_tag':
          app.cycleInfo.tag = value;
          break;
        case 'set_cycle_status':
          app.cycleInfo.status = value;
          break;
        case 'set_result_tag':
          app.setResultTag(value);
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
          app.setMode(true);
          break;

        case 'set_manual_mode':
          app.setMode(false);
          break;

        //make model
        case 'make_model_set_state':
          app.setMakeModelState(value);
          break;
        case 'make_model_clear_state':
          app.clearMakeModelState();
          break;

        //cycle test
        case 'cycle_test_set_state':
          app.setCycleTestState(value);
          break;
        case 'cycle_test_set_models':
          app.setCycleTestModels(value);
          break;
        case 'cycle_test_clear_state':
          app.clearCycleTestState();
          break;

        //set image viewer
        // value = ['title1', 'title2'] 
        case 'set_image_viewers':
          app.setImageViewers(value);
          break;
        //set image
        case 'clear_images':
          app.clearImages();
          break;
        // value = { id: 0, data: 'base64 string' }
        case 'set_image':
          app.setImage(value);
          break;

        //show /hide tabs
        // value = { key: 'STATS'/'IMG', value: true/false }
        case 'set_show':
          app.setShow(value);
          break;
      }

      event = null; //free memory
    });

    CSharpUtils.sendMessage({ type: 'init_begin' }); //signal begin initialization
    //load display state from C# when loaded
    CSharpUtils.sendMessage({ type: 'get_mode' }); //pinmap and pin state
    CSharpUtils.sendMessage({ type: 'get_pinmap' }); //pinmap and pin state
    CSharpUtils.sendMessage({ type: 'get_cycle_info' }); //model, body, seq
    CSharpUtils.sendMessage({ type: 'get_result' }); //latest get results
    CSharpUtils.sendMessage({ type: 'get_history' }); //last results + counter
    CSharpUtils.sendMessage({ type: 'make_model_get_state' }); 
    CSharpUtils.sendMessage({ type: 'cycle_test_get_state' }); 
  },
};

window.API = API;
