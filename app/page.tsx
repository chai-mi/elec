import { ChartAreaInteractive } from "@/components/area-chart";

import { elecTable } from "@/db/schema";
import { db } from "@/db/db";
import { gt } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await db.query.elecTable.findMany({
    where: gt(
      elecTable.timestamp,
      performance.now() - 30 * 24 * 60 * 60 * 1000,
    ),
  });

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Electricity monitoring of ECUST
          </h1>
        </div>
      </div>

      <ChartAreaInteractive data={data} />
    </>
  );
}
