const StatView = {
  //component name
  name: 'StatView',
  //declare what props this component expects to receive
  props: {},
  data() {
    return {
      okcnt: 0,
      ngcnt: 0,
      total:0,
      okpercent:0,
      hourlyData:[],
    };
  },
  //template
  template: /*html*/ `
    <div class="stat-view-container">
        <div class="pie-chart-area">
            <span class="ratio-text">{{okcnt}}/{{okcnt+ngcnt}}</span>
            <div class="pie-chart-canvas">
                <canvas id="pieChart"></canvas>
            </div>
        </div>
        <div class="hourly-chart-area">
            <canvas id="hourlyChart"></canvas>
        </div>
    </div>
    `,

  methods: {
    renderPieChart(okcnt, ngcnt) {
      this.okcnt = okcnt;
      this.ngcnt = ngcnt;
      this.total = okcnt + ngcnt;
      this.okpercent = this.total > 0 ? ((okcnt / this.total) * 100).toFixed(2) : 0;
      ChartUtils.renderPieChart('pieChart', okcnt, ngcnt);
    },
    renderHourlyChart(hourlyData, showNGOnly = false) {
      if(!hourlyData)return;
      this.hourlyData = hourlyData;
      ChartUtils.renderHourlyChart(
        'hourlyChart',
        hourlyData,
        false,
        showNGOnly
      );
    },
    showNGOnly(showNG) {
      this.renderHourlyChart(this.hourlyData, showNG);
    }
  },
  mounted() {
    //test view
    if(window.chrome.webview)return;
    this.$nextTick(() => {
       this.hourlyData = Array.from({ length: 24 }, (_, i) => {
         const ok = Math.floor(Math.random() * 25);
         const ng = Math.floor(Math.random() * 3);
         return { ok, ng };
       });
      this.renderHourlyChart(this.hourlyData, false);
      this.okcnt = this.hourlyData.reduce((sum, hour) => sum + hour.ok, 0);
      this.ngcnt = this.hourlyData.reduce((sum, hour) => sum + hour.ng, 0);
      this.renderPieChart(this.okcnt, this.ngcnt);
    });
  }
};

//inject style
if (!document.querySelector('#stat-view-styles')) {
  const styles = /*css*/ `
        <style id="stat-view-styles">
         .stat-view-container{
            display:flex;
            flex-direction:row;
            height:120px;
            background:var(--bg-primary);
            padding:var(--spacing-sm);
         } 
         .pie-chart-area{
            display:flex;
            flex-direction:column;
            width:20%;
            padding:spacing(--spacing-sm);
            min-height:0;
         }
         .pie-chart-canvas{
            height:80%;!important;
            width:100%;!important;
         }
         .ratio-text{
            font-size:1.2rem;
            font-weight:700;
            text-align:center;
            flex-shrink:0;
         }
         .percent-text{
            font-size:1rem;
            color:var(--text-muted);
            text-align:center;
            flex-shrink:0;
         }
         .hourly-chart-area{
            height:100%;
            width:80%;
         }

        </style>
      `;
  document.head.insertAdjacentHTML('beforeend', styles);
}

// Export both ways
window.StatView = StatView;
