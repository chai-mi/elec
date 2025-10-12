import { ApplicationServer, importVapidKeys } from "@negrel/webpush";
import { env } from "cloudflare:workers";

const adminEmail = "admin@chaimi.cc";

const vapidKeys = await importVapidKeys(JSON.parse(env.webpushKey), {
    extractable: false,
});

const appServer = await ApplicationServer.new({
    contactInformation: "mailto:" + adminEmail,
    vapidKeys,
});

export { appServer, vapidKeys };
