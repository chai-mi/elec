//@ts-ignore
import "./style.css";
import type { AppType } from "../workers";
import { hc } from "hono/client";
import { myChart } from "./chart";

const client = hc<AppType>("/");

const roomIdKey = "elec-room-id";
const roomIdSelect = document.getElementById("room_id")! as HTMLFormElement;
await client.api.rooms.$get().then(async (resp) => {
  if (!resp.ok) {
    throw await resp.text();
  }
  const storage_room_id = localStorage.getItem(roomIdKey)?.split(" ") ?? [];
  for (const room_id of await resp.json()) {
    const i = document.createElement("input");
    i.classList.add("btn", "btn-soft", "mx-1", "my-2");
    i.type = "checkbox";
    i.name = "frameworks";
    i.ariaLabel = room_id.toString();
    i.checked = storage_room_id.includes(room_id.toString());
    roomIdSelect.prepend(i);
  }
});

const pastdaysSelect = document.getElementById(
  "pastdays",
)! as HTMLSelectElement;

const reload = async () => {
  const room_ids = Array
    .from(roomIdSelect.querySelectorAll('input[name="frameworks"]:checked'))
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

roomIdSelect.onreset = () => {
  myChart.data.datasets = [];
  myChart.update();
};
roomIdSelect.onchange = reload;
pastdaysSelect.onchange = reload;
await reload();
