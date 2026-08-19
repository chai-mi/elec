import { handle } from "@astrojs/cloudflare/handler";

export { Elec } from "./cron.ts";
export default {
  fetch(request, env, ctx) {
    return handle(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
