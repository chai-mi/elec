import Chart from "chart.js/auto";

const ctx = document.getElementById("chart")! as HTMLCanvasElement;
const myChart = new Chart(ctx, {
  type: "line",
  data: {
    datasets: [{
      label: "Power",
      data: [] as number[],
      borderColor: "#4a90e2",
      backgroundColor: "rgba(74, 144, 226, 0.3)",
      borderWidth: 1,
      fill: true,
      tension: 0,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: "#4a90e2",
      pointHoverBorderColor: "#ffffff",
      pointHoverBorderWidth: 2,
    }],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 3,
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#444",
        padding: 10,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#888",
          autoSkip: true,
          maxTicksLimit: 5,
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          color: "#888",
        },
      },
    },
  },
});

export { myChart };
