import { hc } from "hono/client";
import type { front } from "../workers/index.ts";
import { myChart } from "./chart.ts";
import { pastdaysSelect, roomIdSelect } from "./element.ts";
import "./style.css";
import "./webpush.ts";

const client = hc<front>("/");

const roomIdKey = "elec-room-id";

await client.api.rooms.$get().then(async (resp) => {
  if (!resp.ok) {
    throw await resp.text();
  }
  const storage_room_id = localStorage.getItem(roomIdKey)?.split(" ") ?? [];
  for (const room_id of await resp.json()) {
    const i = document.createElement("input");
    i.classList.add("btn", "btn-soft", "btn-xs", "md:btn-sm", "mx-0.5", "my-2");
    i.type = "checkbox";
    i.name = "frameworks";
    i.ariaLabel = room_id.toString();
    i.checked = storage_room_id.includes(room_id.toString());
    roomIdSelect.appendChild(i);
  }
});

const reload = async () => {
  const room_ids = Array
    .from(roomIdSelect.querySelectorAll("input:checked"))
    .map((checkbox) => checkbox.ariaLabel!);
  localStorage.setItem(roomIdKey, room_ids.join(" "));

  const result = await Promise.all(
    room_ids.map(async (room_id) => {
      const resp = await client.api.elec[":room_id"].$get({
        param: { room_id: room_id },
        query: { pastdays: pastdaysSelect.value },
      });
      if (!resp.ok) {
        throw await resp.text();
      }
      return {
        room_id: room_id,
        data: await resp.json(),
      };
    }),
  );

  myChart.data.labels = result.at(0)?.data.map((d) =>
    new Date(d.timestamp).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
    })
  );
  myChart.data.datasets = result.map((r) => ({
    label: r.room_id,
    data: r.data.map((d) => d.power),
    borderWidth: 1,
    fill: true,
    tension: 0,
    pointRadius: 0,
    pointHoverRadius: 6,
    pointHoverBorderWidth: 2,
  }));

  myChart.update();
};

roomIdSelect.onchange = reload;
pastdaysSelect.onchange = reload;
await reload();
