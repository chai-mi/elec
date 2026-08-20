import { db } from "@/db/db.ts";
import { elecTable } from "@/db/schema.ts";
import type { WorkflowEvent } from "cloudflare:workers";
import { env, WorkflowEntrypoint, WorkflowStep } from "cloudflare:workers";

type Params = never;

export class Elec extends WorkflowEntrypoint<Env, Params> {
  override async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    const timestamp = performance.now();

    const roomids = env.roomids as number[];

    const powers = await Promise.all(
      roomids.map(async (id) => ({
        roomId: id,
        power: await step.do(`get elec: ${id}`, async () => {
          const resp = await fetch(
            `https://yktyd.ecust.edu.cn/epay/wxpage/wanxiao/eleresult?sysid=1&roomid=${id}&areaid=3&buildid=20`,
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
        }),
      })),
    );

    await step.do("insert powers", async () => {
      await db.insert(elecTable).values(powers.map((item) => ({
        timestamp,
        roomId: item.roomId,
        power: item.power,
      })));
    });
  }
}
