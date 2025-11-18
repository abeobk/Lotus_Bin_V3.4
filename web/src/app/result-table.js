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
    <div class="result-table">
      <h3 class="result-table__title"><i class="fa fa-table"></i>&nbsp;{{table.title }}</h3>
      <table class="result-table__table">
        <thead>
          <tr class="result-table__header">
            <!-- Status icon column header -->
            <th class="result-table__cell result-table__cell--header">
              <i class="fa fa-info-circle"></i>
            </th>
            <th v-for="(col,index) in table.cols" 
              :key="'C-'+index"
              class="result-table__cell result-table__cell--header">{{col}}</th>
          </tr>
        </thead>

        <tbody>
          <tr 
            v-for="(row, rowIndex) in table.rows" 
            :key="'R-'+rowIndex"
            class="result-table__row"
            :class="{ 'result-table__row--even': rowIndex % 2 === 0 }"
          >
            <td class="result-table__cell">
              <i class="fa " :class="{
                'fa-circle-check': row.name && row.name.tag.toLowerCase() === 'ok', 
                'fa-circle-exclamation': row.name && row.name.tag.toLowerCase() === 'ng',
                'fa-hourglass': !row.name.tag || row.name.tag === '',
                'fa-spinner fa-spin': row.name.tag === '...',
                'result-table__status--ng': row.name && row.name.tag.toLowerCase() === 'ng',
                'result-table__status--ok': row.name && row.name.tag.toLowerCase() === 'ok',
              }"></i>
            </td>
            <td 
              v-for="(col, colIndex) in table.cols" 
              :key="'c-'+colIndex+'-'+rowIndex"
              class="result-table__cell"
              :class="{ 
                'result-table__cell--ng': col!='name' && row[col] && row[col].tag.toLowerCase() === 'ng'
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
      .result-table {
        overflow: auto;
        flex: 1 1 min-content; /* allow to shrink to fit content */
        min-width:min-content;
        max-height:min-content;
        background-color: var(--bg-secondary);
        border-radius: var(--spacing-sm);
        border: 1px solid var(--border-color);
        box-shadow: 0 2px 4px var(--shadow-color);
      }

      .result-table__title {
        text-align: left;
        text-transform: uppercase;
        font-weight: 600;
        padding-left: 0.5rem;
        background-color: var(--bg-title);
      }

      .result-table__table {
        min-width:min-content;
        table-layout: auto;
        width: 100%;
        font-weight: 500;
        font-size: 1rem;
        border-collapse: collapse;
        text-transform: uppercase;
        white-space: nowrap;
        overflow: hidden;
      }

      .result-table__header {
        background-color: var(--bg-table-header);
        border-top: 1px solid var(--border-color);
        border-bottom: 1px solid var(--border-color);
        color: var(--text-primary);
        height: 1.8rem;
      }

      .result-table__cell--header {
        text-align: right;
        padding: 0.25rem 0.5rem 0;
        border-right: 1px solid var(--border-color);
      }

      .result-table__cell--header:first-child { max-width: 1rem; }
      .result-table__cell--header:nth-child(2) { text-align: left; }
      .result-table__cell--header:last-child { border-right: none; }
      .result-table__row { background-color: var(--bg-table-row-odd); }
      .result-table__row:last-child .result-table__cell { border-bottom: none; }
      .result-table__row--even { background-color: var(--bg-table-row-even); }
      .result-table__row:hover { background-color: var(--bg-hover); }
      .result-table__row--even:hover { background-color: var(--bg-hover); }

      .result-table__cell {
        color: var(--text-primary);
        text-align: right;
        while-space: nowrap;
        padding: 0 0.5rem;
        width: 7rem;
        border-right: 1px solid var(--border-color);
      }

      .result-table__cell:nth-child(1) { width: 1rem; }
      .result-table__cell:nth-child(2) { text-align: left; }
      .result-table__cell:last-child { border-right: none; }

      .result-table__cell--ng,
      .result-table__status--ng { color: var(--accent-ng) !important; }
      .result-table__status--ok { color: var(--accent-ok) !important; }
    </style>
  `;
  document.head.insertAdjacentHTML('beforeend', styles);
}

window.ResultTable = ResultTable;
