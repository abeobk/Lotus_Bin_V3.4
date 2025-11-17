// Chart utility functions
const ChartUtils = {
  // Render a donut chart showing OK vs NG counts
  renderPieChart(canvasId, okcnt, ngcnt) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.error(`Pie chart canvas '${canvasId}' not found`);
      return;
    }

    const ctx = canvas.getContext('2d');
    const total = okcnt + ngcnt;

    // Destroy existing chart if it exists
    if (canvas.pieChart) {
      canvas.pieChart.destroy();
    }

    // Create donut chart
    canvas.pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['OK', 'NG'],
        datasets: [
          {
            data: [okcnt, ngcnt],
            backgroundColor: ['#2ecc71', '#e74c3c'],
            borderWidth: 0,
            cutout: '70%',
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 8 },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.parsed;
                const percentage =
                  total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
        animation: false,
      },
      plugins: [
        {
          // Custom plugin to draw text in center
          id: 'centerText',
          beforeDraw: function (chart) {
            const ctx = chart.ctx;
            const centerX =
              chart.chartArea.left +
              (chart.chartArea.right - chart.chartArea.left) / 2;
            const centerY =
              chart.chartArea.top +
              (chart.chartArea.bottom - chart.chartArea.top) / 2;

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.restore();
          },
        },
      ],
    });
  },

  // Render an hourly stacked bar chart
  renderHourlyChart(
    canvasID,
    hourlyData,
    showTitle = false,
    showNGOnly = false
  ) {
    const canvas = document.getElementById(canvasID);
    if (!canvas) {
      console.error(`Hourly chart ${canvasID} not found`);
      return;
    }
    if(!hourlyData)return;

    // Extract arrays for ok and ng
    const okData = hourlyData.map((d) => (showNGOnly ? 0 : d?.ok || 0));
    const ngData = hourlyData.map((d) => d?.ng || 0);

    //using chart.js
    const ctx = canvas.getContext('2d');
    //create chart
    if (canvas.hourlyChart) {
      canvas.hourlyChart?.destroy(); // destroy previous instance if any
    }
    canvas.hourlyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
        datasets: [
          {
            label: 'OK',
            data: okData,
            backgroundColor: '#2ecc71',
            stack: 'count',
          },
          {
            label: 'NG',
            data: ngData,
            backgroundColor: '#e74c3c',
            stack: 'count',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false, position: 'top' },
          title: {
            display: showTitle,
            text: 'Hourly Production',
            color: '#9aa',
            font: { size: 16, family: 'Segoe UI' },
          },
        },
        scales: {
          x: { stacked: true, ticks: { color: '#678' } },
          y: { stacked: true, beginAtZero: true, ticks: { color: '#678' } },
        },
        animation: false,
      },
    });
  },
};

const CSharpUtils = {
  //send message to C# backend
  sendMessage(messageData) {
    if (!window.chrome.webview) return;
    console.log('Sending message to C# backend:', messageData);
    window.chrome.webview.postMessage(messageData);
  },
};

// Make it available globally
window.ChartUtils = ChartUtils;
window.CSharpUtils = CSharpUtils;
