import Chart from "chart.js/auto";
import { chart } from "./element";

const myChart = new Chart<"line", number[], unknown>(chart, {
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
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 5,
        },
      },
      y: {
        min: 0,
      },
    },
  },
});

export { myChart };
