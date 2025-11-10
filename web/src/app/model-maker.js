const ModelMaker = {
  // Component name
  name: 'ModelMaker',

  // Declare props this component expects to receive
  props: {},

  // Reactive data
  data() {
    return {
      state:{poses:[], groups:[]},
    };
  },

  // Template
  template: /*html*/ `
    <div class="model-maker-container">
        <div class="top-bar-container">
          <button @click="saveButtonClick"><i class="fa fa-save"></i></button>
          <span style="flex:1"></span>
          <span style="font-weight:600">MAKE MODEL</span>
          <span style="flex:1"></span>
          <button @click="deleteButtonClick"><i class="fa fa-trash"></i></button>
        </div>

        <div class="model-maker-body-container">
          <div class="all-group-container">
            <div v-for="(group, gIndex) in state.groups" 
                :key="'G-'+gIndex" 
                class="group-container">
                <div class="group-header">
                    <span><i class="fa fa-cube"></i> {{group.title}}</span>
                </div>
                <div class="action-container">
                <button v-for="(action, aIndex) in group.actions"
                class="action-button" 
                :class="{ active: action.ok }"
                @click="actionClick(action)"
                :key="'A-'+gIndex+'-'+aIndex"><i v-show="action.ok" class="fa fa-check"> </i> {{action.name}} </button>
                </div>
            </div>
          </div>

          <div v-show="state.poses && state.poses.length > 0" class="robot-poses-container">
              <div class="robot-pose-item" v-for="(pose, pIndex) in state.poses" :key="'P-'+pIndex" :class="{ 'even-row': pIndex % 2 === 0 }">
                  <span class="robot-pose-name"><i class="fa fa-location-dot"></i> {{pose.name}}</span>
                  <span class="robot-pose-value">{{pose.value}}</span>
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
    .model-maker-container{
        display:flex;
        flex-direction:column;
        border-top:1px solid var(--border-color);
        background-color: var(--bg-);
        height:100%;
    }
    .model-maker-body-container{
        display:flex;
        flex-direction:column;
        overflow:auto;
        height:100%;
    }

    .top-bar-container{
        display:flex;
        flex-direction:row;
        align-items:center;
        height:2.5rem;
        background-color: var(--bg-tertiary);
        box-shadow: 0 2px 4px var(--shadow-color);
        z-index:1;
    }
    .all-group-container{
        display:flex;
        flex-wrap:wrap;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
    }

    .group-container{
        display:flex;
        flex-direction:column;
        background-color: var(--bg-secondary);
        height:flex;
        flex:1;
        border-radius: var(--spacing-xs);
        box-shadow: 0 2px 4px var(--shadow-color);
        border: 1px solid var(--border-color);
    }

    .group-header{
        display:flex;
        flex-direction:row;
        width:100%;
        padding: var(--spacing-xs) var(--spacing-sm);
        font-weight:600;
        color:var(--text-primarty);
        text-transform:uppercase;
        align-items:center;
    }

    .action-container{
        display:flex;
        flex-direction:row;
        flex-wrap:wrap;
        padding:var(--spacing-sm);
        padding-top:var(--spacing-xs);
        gap:var(--spacing-sm);
    }

    .action-button{
        padding: var(--spacing-sm) var(--spacing-md) ;
        height: fit-content;
        border-radius: var(--spacing-xs);
        background-color: var(--bg-primary);
        width:fit-content;
        font-size:1rem;
        text-transform:uppercase;
        box-shadow: 0 1px 2px var(--shadow-color);
        white-space: nowrap;
    }

    .action-button:hover{
        background-color: var(--bg-tertiary);
    }
    .action-button.active{
        background-color: var(--bg-tertiary);
        color: var(--accent-ok);
    }

    .robot-poses-container{
        border-top:1px solid var(--border-color);
        display:flex;
        flex-direction:column;
        height:fit-content;
    }
    .robot-pose-item{
        display:flex;
        flex-direction:column;
        border-bottom:1px solid var(--border-color);
    }
    .robot-pose-item:hover{ background-color: var(--bg-tertiary); }
    .robot-pose-item.even-row{ background-color: var(--bg-table-row-even); }
    .robot-pose-item{
        display:flex;
        flex-direction:row;
        padding: 0 var(--spacing-sm);
        background-color: var(--bg-secondary);
    }
    .robot-pose-name{
        font-weight:600;
        color: var(--accent-ok);
    }
    .robot-pose-value{
        font-family:"Consolas", "Roboto Mono", monospace;
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
