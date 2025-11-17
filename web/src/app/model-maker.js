const ModelMaker = {
  // Component name
  name: 'ModelMaker',

  // Declare props this component expects to receive
  props: {},

  // Reactive data
  data() {
    return {
      //pose structure: { name: string, value: string }
      //group structure: { title: string, actions: [ { name: string, ok: bool } ] }
      state:{poses:[], groups:[]},
    };
  },

  // Template
  template: /*html*/ `
    <div class="model-maker">
        <div class="model-maker__top-bar">
          <button @click="saveButtonClick"><i class="fa fa-save"></i></button>
          <span style="flex:1"></span>
          <span style="font-weight:600"><i class="fa fa-cube"></i> MAKE MODEL</span>
          <span style="flex:1"></span>
          <button @click="deleteButtonClick"><i class="fa fa-trash"></i></button>
        </div>

        <div class="model-maker__body">
          <div class="model-maker__groups">
            <div v-for="(group, gIndex) in state.groups" 
                :key="'G-'+gIndex" 
                class="model-maker__group">
                <div class="model-maker__group-header">
                    <span><i class="fa fa-cube"></i> {{group.title}}</span>
                </div>
                <div class="model-maker__action-container">
                <button v-for="(action, aIndex) in group.actions"
                class="model-maker__action" 
                :class="{ 'model-maker__action--active': action.ok }"
                @click="actionClick(action)"
                :key="'A-'+gIndex+'-'+aIndex"><i v-show="action.ok" class="fa fa-check"> </i> {{action.name}} </button>
                </div>
            </div>
          </div>

          <div v-show="state.poses && state.poses.length > 0" class="model-maker__pose-container">
              <div class="model-maker__pose" v-for="(pose, pIndex) in state.poses" :key="'P-'+pIndex" :class="{ 'model-maker__pose--even': pIndex % 2 === 0 }">
                  <span class="model-maker__pose-name"><i class="fa fa-location-dot"></i> {{pose.name}}</span>
                  <span class="model-maker__pose-value">{{pose.value}}</span>
              </div>
          </div>
        </div>
    </div>
  `,

  // Methods
  methods: {
    setState(data) {
      if (!data) return;
      this.state = data;
      this.clearState();
    },
    //clear ok state of all actions
    clearState(){
      this.state.groups.forEach(group => {
        group.actions.forEach(action => {
          action.ok = false;
        });
      });
    },
    actionClick(action) {
      CSharpUtils.sendMessage({
        type: 'make_model_action_click',
        value: action.name,
      });
    },
    saveButtonClick() {
      CSharpUtils.sendMessage({ type: 'make_model_save' });
    },
    deleteButtonClick() {
      CSharpUtils.sendMessage({ type: 'make_model_reset' });
    },
  },
  mounted() {
    if (window.chrome.webview) return;
    //test view
    this.$nextTick(() => {
      //create 10 random poses
      this.state.poses = Array.from({ length: 100 }, (_, index) => ({ name: `Pose${index + 1}`, value: 'X:0 Y:0 Z:0 Rx:0 Ry:0 Rz:0' }));
      //create 10 random groups with random actions
      this.state.groups = Array.from({ length: 10 }, (_, gIndex) => ({
        title: `GROUP${gIndex + 1}`,
        actions: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, aIndex) => ({ name: `ACTION${aIndex + 1}`, ok: Math.random() > 0.5 })),
      }));
    });
  },
};

//inject style
if (!document.querySelector('#model-maker-styles')) {
  const styles = /*css*/ `
    <style id="model-maker-styles">
    .model-maker {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .model-maker__body {
        display: flex;
        flex-direction: column;
        overflow: auto;
        height: 100%;
    }

    .model-maker__top-bar {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 3rem;
        background-color: var(--bg-title);
        border-bottom: 1px solid var(--border-color);
    }

    .model-maker__groups {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
    }

    .model-maker__group {
        display: flex;
        flex-direction: column;
        background-color: var(--bg-secondary);
        height: flex;
        flex: 1;
        border-radius: var(--spacing-xs);
        box-shadow: 0 2px 4px var(--shadow-color);
        border: 1px solid var(--border-color);
    }

    .model-maker__group-header {
        display: flex;
        flex-direction: row;
        width: 100%;
        padding: var(--spacing-xs) var(--spacing-sm);
        font-weight: 600;
        color: var(--text-primarty);
        text-transform: uppercase;
        align-items: center;
    }

    .model-maker__action-container {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        padding: var(--spacing-sm);
        padding-top: var(--spacing-xs);
        gap: var(--spacing-sm);
    }

    .model-maker__action {
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

    .model-maker__action:hover {
        background-color: var(--bg-hover);
        box-shadow: 0 1px 2px var(--button-shadow-color);
        border: none;
    }
    .model-maker__action:active{
        background-color: var(--bg-hover);
        transform:translateY(2px);
        box-shadow:none;
    }

    .model-maker__action--active {
        background-color: transparent;
        box-shadow: none;
        color: var(--accent-ok);
    }

    .model-maker__pose-container {
        border-top: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        height: fit-content;
    }

    .model-maker__pose {
        display: flex;
        flex-direction: row;
        padding: 0 var(--spacing-sm);
        background-color: var(--bg-table-row-odd);
        border-bottom: 1px solid var(--border-color);
    }

    .model-maker__pose:hover {
        background-color: var(--bg-tertiary);
    }

    .model-maker__pose--even {
        background-color: var(--bg-table-row-even);
    }

    .model-maker__pose-name {
        font-weight: 600;
        color: var(--accent-ok);
    }

    .model-maker__pose-value {
        font-family: "Consolas", "Roboto Mono", monospace;
        color: var(--text-secondary);
        white-space: pre-wrap;
        padding-left: var(--spacing-lg);
    }
    </style>
  `;
  document.head.insertAdjacentHTML('beforeend', styles);
}

// Export both ways
window.ModelMaker = ModelMaker;
