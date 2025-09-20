const ResultTable = {
  name: 'ResultTable',
  props: {
    table: {
      type: Object,
      default: () => ({
        title: 'Result Table',
        cols: [],
        rows: [],
      }),
      validator: (value) => {
        return (
          typeof value === 'object' &&
          Array.isArray(value.cols) &&
          value.cols.length > 0 &&
          Array.isArray(value.rows)
        );
      },
    },
  },

  computed: {},

  template: /*html*/ `
    <div class="result-table-container">
      <h3 style="text-align:center;text-transform:uppercase;">{{ table.title }}</h3>
      <table class="result-table">
        <thead>
          <tr class="header-row">
            <!-- Status icon column header -->
            <th class="header-cell">
              <i class="fa fa-info-circle"></i>
            </th>
            <th v-for="(col,index) in table.cols" 
              :key="'C-'+index"
              class="header-cell">{{col}}</th>
          </tr>
        </thead>

        <tbody>
          <tr 
            v-for="(row, rowIndex) in table.rows" 
            :key="'R-'+rowIndex"
            class="data-row"
            :class="{ 'even-row': rowIndex % 2 === 0 }"
          >
            <td class="data-cell">
              <i class="fa " :class="{
                'fa-circle-check': row.name && row.name.tag.toLowerCase() === 'ok', 
                'fa-circle-exclamation': row.name && row.name.tag.toLowerCase() === 'ng',
                'fa-hourglass': !row.name.tag || row.name.tag === '',
                'fa-spinner fa-spin': row.name.tag === '...',
                'ng-status': row.name && row.name.tag.toLowerCase() === 'ng',
                'ok-status': row.name && row.name.tag.toLowerCase() === 'ok',
              }"></i>
            </td>
            <td 
              v-for="(col, colIndex) in table.cols" 
              :key="'c-'+colIndex+'-'+rowIndex"
              class="data-cell"
              :class="{ 
                'ng-text': col!='name' && row[col] && row[col].tag.toLowerCase() === 'ng'
              }"
            >
              {{ (row[col]? row[col].value : '-') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,

  methods: {},
};

// Inject styles using the same pattern as cycle-info-card
if (!document.querySelector('#result-table-styles')) {
  const styles = /*css*/ `
    <style id="result-table-styles">
      .result-table-container {
        overflow: auto;
        box-shadow: 0 2px 8px var(--shadow-color);
        border-radius: var(--spacing-sm);
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
      }
      .result-table {
        width: 100%;
        font-weight: 500;
        font-size: 1rem;
        border-collapse:collapse;
        text-transform: uppercase;
        white-space: nowrap;
        overflow: hidden;
        box-shadow: 0 2px 4px var(--shadow-color);
      }

      .header-row {
        background: var(--bg-table-header);
        color: var(--text-primary);
        border-bottom: 1px solid var(--border-color);
      }

      .header-cell { 
        text-align:right;
        padding: 0.25rem 0.5rem 0;
        /* border: 1px solid var(--border-color);  */
      }

      .header-cell:first-child{ max-width:1rem; }
      .header-cell:nth-child(2){ text-align: left; }


      .data-row { 
        background:var(--bg-table-row-odd);
        border-bottom: 1px solid var(--border-color);
      }

      .data-row:last-child {
        border-bottom: none;
      }

      .data-row.even-row { background: var(--bg-table-row-even); }
      .data-row:hover { background: var(--bg-hover); } 
      .data-row.even-row:hover { background: var(--bg-hover); }

      .data-cell { 
        color: var(--text-primary); 
        text-align:right;
        padding: 0 0.5rem;
        width:7rem;
        /* border: 1px solid var(--border-color);  */
      }

      .data-cell:nth-child(1){ width: 1rem; }
      .data-cell:nth-child(2){ text-align: left; }

      .ng-text, .ng-status { color: var(--accent-ng) !important; }
      .ok-status { color: var(--accent-ok) !important; }
    </style>
  `;
  document.head.insertAdjacentHTML('beforeend', styles);
}

window.ResultTable = ResultTable;
