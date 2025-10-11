import Chart from "chart.js/auto";

const ctx = document.getElementById("chart")! as HTMLCanvasElement;
const myChart = new Chart<"line", number[], unknown>(ctx, {
  type: "line",
  data: { datasets: [] },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 3,
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
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
