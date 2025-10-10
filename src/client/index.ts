//@ts-ignore
import "./style.css";
import type { AppType } from "../worker";
import { hc } from "hono/client";
import { myChart } from "./chart";

const client = hc<AppType>("/");

const roomIdKey = "elec-room-id";
const roomIdSelect = document.getElementById("room_id")! as HTMLSelectElement;
await client.api.rooms.$get().then(async (resp) => {
  if (!resp.ok) {
    throw await resp.text();
  }
  const storage_room_id = localStorage.getItem(roomIdKey);
  for (const room_id of await resp.json()) {
    const o = document.createElement("option");
    o.textContent = room_id.toString();
    o.selected = storage_room_id === room_id.toString();
    roomIdSelect.appendChild(o);
  }
});

const pastdaysSelect = document.getElementById(
  "pastdays",
)! as HTMLSelectElement;

const reload = async () => {
  localStorage.setItem(roomIdKey, roomIdSelect.value);
  const resp = await client.api.elec[":room_id"].$get({
    param: { room_id: roomIdSelect.value },
    query: { pastdays: pastdaysSelect.value },
  });

  if (!resp.ok) {
    throw await resp.text();
  }
  const result = await resp.json();
  myChart.data.labels = result.map((d) =>
    new Date(d.timestamp).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
    })
  );
  myChart.data.datasets[0].data = result.map((d) => d.power);
  myChart.update();
};

roomIdSelect.onchange = reload;
pastdaysSelect.onchange = reload;
await reload();
