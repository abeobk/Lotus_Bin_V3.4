const ResultTable = {
  name: 'ResultTable',
  props: {
    table: {
      type: Object,
      default: () => ({
        title: 'Result Table', 
        cols: [], //['name','x','y','z',...]
        rows: [], //[{name:{value:'part1',tag:'ok | ng | ...'},x:{value:10,tag:'ok'},...},...]
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
      <h3 class="result-table-title"><i class="fa fa-table"></i>&nbsp;{{table.title }}</h3>
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
        background-color: var(--bg-primary);
        border-radius: var(--spacing-sm);
        border:1px solid var(--border-color);
        box-shadow: 0 2px 4px var(--shadow-color);
      }

      .result-table-title{
        text-align:left;
        text-transform:uppercase;
        font-weight:600;
        padding-left:0.5rem;
        background-color:var(--bg-tertiary);
      }

      .result-table {
        width: 100%;
        font-weight: 500;
        font-size: 1rem;
        border-collapse:collapse;
        text-transform: uppercase;
        white-space: nowrap;
        overflow: hidden;
      }

      .header-row {
        background-color: var(--bg-table-header);
        color: var(--text-primary);
      }

      .header-cell { 
        text-align:right;
        padding: 0.25rem 0.5rem 0;
      }

      .header-cell:first-child{ max-width:1rem; }
      .header-cell:nth-child(2){ text-align: left; }


      .data-row { 
        background-color:var(--bg-table-row-odd);
      }

      .data-row:last-child {
        border-bottom: none;
      }

      .data-row.even-row { background-color: var(--bg-table-row-even); }
      .data-row:hover { background-color: var(--bg-hover); } 
      .data-row.even-row:hover { background-color: var(--bg-hover); }

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
