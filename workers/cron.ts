import { env } from "cloudflare:workers";
import { db } from "./db/db";
import { elecTable } from "./db/schema";

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
  return parseFloat(match[1]);
}

export async function scheduled() {
  const roomids = JSON.parse(env.roomids) as number[];
  const timestamp = performance.now();

  await Promise.all(
    roomids.map(async (id) => ({
      roomId: id,
      power: await getElec(id),
    })),
  ).then(async (powers) => {
    await db.insert(elecTable).values(powers.map((item) => ({
      timestamp,
      roomId: item.roomId,
      power: item.power,
    })));
  });
}
