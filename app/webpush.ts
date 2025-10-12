import { hc } from "hono/client";
import { encodeBase64Url } from "@std/encoding";
import type { subscription } from "../workers";
import { roomIdSelect, subscript } from "./element";

const registration = await navigator.serviceWorker.register("sw.js");

const client = hc<subscription>("/");

async function askUserPermission() {
  const alert = document.getElementById("subscription-alert")!;
  alert.hidden = false;
  setTimeout(() => alert.hidden = true, 5000);

  const r = await Notification.requestPermission();
  if (r !== "granted") return;

  const resp = await client.api.subscription.key.$get();

  if (!resp.ok) throw await resp.text();

  const { publicKey } = await resp.json();
  const pushSubscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: publicKey,
  });

  const userKey = "elec-username";
  const username = localStorage.getItem(userKey) ?? (() => {
    const u = crypto.randomUUID();
    localStorage.setItem(userKey, u);
    return u;
  })();

  const room_ids = Array
    .from(roomIdSelect.querySelectorAll("input:checked"))
    .map((checkbox) => parseInt(checkbox.ariaLabel!));

  await client.api.subscription.$post({
    json: {
      subscription: {
        endpoint: pushSubscription.endpoint,
        expirationTime: pushSubscription.expirationTime,
        keys: {
          auth: encodeBase64Url(pushSubscription.getKey("auth")!),
          p256dh: encodeBase64Url(pushSubscription.getKey("p256dh")!),
        },
      },
      userinfo: {
        username: username,
        room_ids: room_ids,
      },
    },
  });
}

subscript.onclick = askUserPermission;
