import { keyBy } from "es-toolkit";
import { env, waitUntil } from "cloudflare:workers";
import { db } from "./db/db";
import { elecTable } from "./db/schema";
import { appServer } from "./webpush";

async function getElec(roomid: number) {
  const resp = await fetch(
    `https://yktyd.ecust.edu.cn/epay/wxpage/wanxiao/eleresult?sysid=1&roomid=${roomid}&areaid=3&buildid=20`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; U; Android 4.1.2; zh-cn; Chitanda/Akari) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 MicroMessenger/6.0.0.58_r884092.501 NetType/WIFI",
      },
    },
  );
  const rawHtml = await resp.text();
  const match = /(-?\d+(\.\d+)?)度/.exec(rawHtml);
  if (!match) {
    throw rawHtml;
  }
  return parseFloat(match.at(1)!);
}

const scheduled: ExportedHandlerScheduledHandler<Env> = async () => {
  const roomids = JSON.parse(env.roomids) as number[];
  const timestamp = performance.now();

  const powers = await Promise.all(
    roomids.map(async (id) => ({
      roomId: id,
      power: await getElec(id),
    })),
  );
  waitUntil(
    db.insert(elecTable).values(powers.map((item) => ({
      timestamp,
      roomId: item.roomId,
      power: item.power,
    }))),
  );

  const notice = powers.filter((item) => item.power < 3);
  const noticeMap = keyBy(notice, (i) => i.roomId);
  const subscribes = await db.query.subscribeTable.findMany({
    where: (subscribe, { inArray }) =>
      inArray(subscribe.roomId, notice.map((i) => i.roomId)),
    with: {
      webpush: true,
    },
    columns: {
      user: false,
    },
  });

  for (const s of subscribes) {
    waitUntil(
      appServer
        .subscribe({
          endpoint: s.webpush.endpoint,
          keys: {
            auth: s.webpush.keysAuth,
            p256dh: s.webpush.keysP256dh,
          },
        })
        .pushTextMessage(
          JSON.stringify({
            title: `${s.roomId} 剩余电量: ${noticeMap[s.roomId]!.power}`,
          }),
          {},
        ),
    );
  }
};

export { scheduled };
