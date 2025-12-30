const UserOp = {
  name: 'UserOp',

  props: {},

  data() {
    return {
      // group structure: { title: string, actions: [string] }
      state: { groups: [] },
    };
  },

  template: /*html*/ `
    <div class="user-op">
        <div class="user-op__top-bar">
          <span class="user-op__title"> <i class="fa fa-user"></i> USER OPERATIONS</span>
          <span style="flex:1"></span>
        </div>

        <div class="user-op__body" v-show="state.groups && state.groups.length">
          <div class="user-op__groups">
            <div v-for="(group, gIndex) in state.groups" 
                :key="'G-'+gIndex" 
                class="user-op__group">
                <div class="user-op__group-header">
                    <span><i class="fa fa-cube"></i> {{group.title}}</span>
                </div>
                <div class="user-op__action-container">
                  <button v-for="(action, aIndex) in group.actions"
                    class="user-op__action" 
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

  methods: {
    setState(data) {
      this.state = data || { groups: [] };
      if (!Array.isArray(this.state.groups)) this.state.groups = [];
    },

    actionClick(action) {
      CSharpUtils.sendMessage({
        type: 'user_op_action_click',
        value: action,
      });
    },
  },

  mounted() {
    if (window.chrome.webview) return;
    // test view
    this.$nextTick(() => {
      // create random groups with random actions
      this.state.groups = Array.from({ length: 6 }, (_, gIndex) => ({
        title: `USEROP ${gIndex + 1}`,
        actions: Array.from(
          { length: Math.floor(Math.random() * 6) + 2 },
          (_, aIndex) => `ACTION${aIndex + 1}`
        ),
      }));
    });
  },
};

// inject style
if (!document.querySelector('#user-op-styles')) {
  const styles = /*css*/ `
    <style id="user-op-styles">
    .user-op {
        display: flex;
        flex-direction: column;
        background-color: var(--bg-secondary);
        border-radius: var(--spacing-sm);
        overflow: hidden;
        height: 100%;
    }

    .user-op__top-bar {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 3rem;
        background-color: var(--bg-title);
        border-bottom: 1px solid var(--border-color);
        padding: 0 var(--spacing-sm);
        gap: var(--spacing-sm);
    }

    .user-op__title {
        font-weight: 600;
    }

    .user-op__body {
        display: flex;
        flex-direction: column;
        overflow: auto;
        height: 100%;
    }

    .user-op__groups {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
    }

    .user-op__group {
        display: flex;
        flex-direction: column;
        background-color: var(--bg-secondary);
        height: flex;
        flex: 1;
        border-radius: var(--spacing-xs);
        box-shadow: 0 2px 4px var(--shadow-color);
        border: 1px solid var(--border-color);
    }

    .user-op__group-header {
        display: flex;
        flex-direction: row;
        width: 100%;
        padding: var(--spacing-xs) var(--spacing-sm);
        font-weight: 600;
        color: var(--text-primarty);
        text-transform: uppercase;
        align-items: center;
    }

    .user-op__action-container {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        padding: var(--spacing-sm);
        padding-top: var(--spacing-xs);
        gap: var(--spacing-sm);
    }

   .user-op__action {
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

    .user-op__action:hover {
        background-color: var(--bg-hover);
        box-shadow: 0 1px 2px var(--button-shadow-color);
        border: none;
    }
    .user-op__action:active{
        background-color: var(--bg-hover);
        transform:translateY(2px);
        box-shadow:none;
    }
    </style>
  `;
  document.head.insertAdjacentHTML('beforeend', styles);
}

// Export both ways
window.UserOp = UserOp;
