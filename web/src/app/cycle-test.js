const CycleTest = {
  // Component name
  name: 'CycleTest',

  // Declare props this component expects to receive
  props: {},

  // Reactive data
  data() {
    return {
      // group structure: { title: string, actions: [string] }
      // models: [string]
      state: { groups: [], models: [] }, 
      selectedModel: '',
    };
  },

  // Template
  template: /*html*/ `
    <div class="cycle-test">
        <div class="cycle-test__top-bar">
          <span class="cycle-test__title"> <i class="fa fa-flask"></i> CYCLE TEST</span>
          <span style="flex:1"></span>
          <button title="Refresh" @click="refreshButtonClick"><i class="fa fa-refresh"></i></button>
          <select class="cycle-test__model-select" v-model="selectedModel" @change="modelChanged">
            <option v-for="model in state.models" :key="model" :value="model">{{model}}</option>
          </select>
          <button title="Set Model" @click="setModelClick"><i class="fa fa-check"></i></button>
          <button title="Save" @click="saveButtonClick"><i class="fa fa-save"></i></button>
        </div>

        <div class="cycle-test__body" v-show="state.models.includes(selectedModel)">
          <div class="cycle-test__groups">
            <div v-for="(group, gIndex) in state.groups" 
                :key="'G-'+gIndex" 
                class="cycle-test__group">
                <div class="cycle-test__group-header">
                    <span><i class="fa fa-cube"></i> {{group.title}}</span>
                </div>
                <div class="cycle-test__action-container">
                  <button v-for="(action, aIndex) in group.actions"
                    class="cycle-test__action" 
                    @click="actionClick(action)"
                    :key="'A-'+gIndex+'-'+aIndex">
                    {{action}}
                  </button>
                </div>
            </div>
          </div>
        </div>
    </div>
  `,

  // Methods
  methods: {
    setState(data) {
      this.state = data || { groups: []};
      this.setModels(data.models)
    },
    setModels(data) {
      this.state.models = data || ['<NO MODELS>'];
    },

    actionClick(action) {
      CSharpUtils.sendMessage({
        type: 'cycle_test_action_click',
        value: action,
      });
    },
    setModelClick() {
      CSharpUtils.sendMessage({
        type: 'cycle_test_set_model',
        value: this.selectedModel,
      });
    },
    refreshButtonClick() { CSharpUtils.sendMessage({ type: 'cycle_test_refresh' }); },
    saveButtonClick() { CSharpUtils.sendMessage({ type: 'cycle_test_save' }); },
    modelChanged() {
      // Optional: notify when model selection changes
    },
  },
  mounted() {
    if (window.chrome.webview) return;
    //test view
    this.$nextTick(() => {
      //create test models
      this.state.models = ['Model A', 'Model B', 'Model C'];
      //create random groups with random actions
      this.state.groups = Array.from({ length: 8 }, (_, gIndex) => ({
        title: `TEST ${gIndex + 1}`,
        actions: Array.from(
          { length: Math.floor(Math.random() * 6) + 2 },
          (_, aIndex) => `TEST${aIndex + 1}` 
        ),
      }));
    });
  },
};

//inject style
if (!document.querySelector('#cycle-test-styles')) {
  const styles = /*css*/ `
    <style id="cycle-test-styles">
    .cycle-test {
        display: flex;
        flex-direction: column;
        background-color: var(--bg-secondary);
        border-radius: var(--spacing-sm);
        overflow: hidden;
        height: 100%;
    }

    .cycle-test__top-bar {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 3rem;
        background-color: var(--bg-title);
        border-bottom: 1px solid var(--border-color);
        padding: 0 var(--spacing-sm);
        gap: var(--spacing-sm);
    }

    .cycle-test__model-select {
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--spacing-xs);
        background-color: var(--bg-primary);
        border: 1px solid var(--border-color);
        color: var(--text-primary);
        font-size: 1rem;
        min-width: 150px;
        margin-left: var(--spacing-sm);
    }
    .cycle-test__model-select option{
        background-color: var(--bg-primary);
        color: var(--text-primary);
    }
    .cycle-test__model-select option:hover{
        background-color: var(--bg-hover);
        color: var(--text-primary);
    }

    .cycle-test__title {
        font-weight: 600;
    }

    .cycle-test__body {
        display: flex;
        flex-direction: column;
        overflow: auto;
        height: 100%;
    }

    .cycle-test__groups {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
    }

    .cycle-test__group {
        display: flex;
        flex-direction: column;
        background-color: var(--bg-secondary);
        height: flex;
        flex: 1;
        border-radius: var(--spacing-xs);
        box-shadow: 0 2px 4px var(--shadow-color);
        border: 1px solid var(--border-color);
    }

    .cycle-test__group-header {
        display: flex;
        flex-direction: row;
        width: 100%;
        padding: var(--spacing-xs) var(--spacing-sm);
        font-weight: 600;
        color: var(--text-primarty);
        text-transform: uppercase;
        align-items: center;
    }

    .cycle-test__action-container {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        padding: var(--spacing-sm);
        padding-top: var(--spacing-xs);
        gap: var(--spacing-sm);
    }

   .cycle-test__action {
        padding: var(--spacing-sm) var(--spacing-md);
        height: fit-content;
        border-radius: var(--spacing-xs);
        background-color: var(--bg-primary);
        width: fit-content;
        font-size: 1rem;
        text-transform: uppercase;
        box-shadow: 0 1px 2px var(--shadow-color);
        white-space: nowrap;
    }

    .cycle-test__action:hover {
        background-color: var(--bg-hover);
        box-shadow: 0 1px 2px var(--button-shadow-color);
        border: none;
    }
    .cycle-test__action:active{
        background-color: var(--bg-hover);
        transform:translateY(2px);
        box-shadow:none;
    }

    .cycle-test__action--active {
        background-color: transparent;
        box-shadow: none;
        color: var(--accent-ok);
    }

    </style>
  `;
  document.head.insertAdjacentHTML('beforeend', styles);
}

// Export both ways
window.CycleTest = CycleTest;
