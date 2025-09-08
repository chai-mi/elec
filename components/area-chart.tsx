"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { elecTable } from "@/db/schema";

const chartConfig = {
  power: {
    label: "Power",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type line = typeof elecTable.$inferSelect;

export function ChartAreaInteractive({ data }: { data: line[] }) {
  const [timeRange, setTimeRange] = React.useState("24h");
  const allroomid = Array.from(
    new Set(data.map((item) => item.roomId.toString()))
  );
  const [roomid, setRoomid] = React.useState(allroomid[0]);

  const time =
    timeRange === "24h"
      ? Date.now() - 24 * 60 * 60 * 1000
      : timeRange === "7d"
      ? Date.now() - 7 * 24 * 60 * 60 * 1000
      : timeRange === "30d"
      ? Date.now() - 30 * 24 * 60 * 60 * 1000
      : 0;

  const filteredData = data
    .filter(
      (item) => item.roomId === parseInt(roomid) && item.timestamp >= time
    )
    .map((item) => ({
      timestamp: new Date(item.timestamp).toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      power: item.power,
    }));

  const first = filteredData.at(0)!;
  const last = filteredData.at(-1)!;

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Electricity</CardTitle>
          <CardDescription>Electricity in the past {timeRange}</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 24 hours" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="24h" className="rounded-lg">
              Last 24 hours
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
          </SelectContent>
        </Select>
        <Select value={roomid} onValueChange={setRoomid}>
          <SelectTrigger
            className="hidden w-[80px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Room id" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {allroomid.map((roomid) => {
              return (
                <SelectItem value={roomid} className="rounded-lg" key={roomid}>
                  {roomid}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[450px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillPower" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-power)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-power)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={10}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="power"
              type="natural"
              fill="url(#fillPower)"
              fillOpacity={0.4}
              stroke="var(--color-power)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Used {(first.power - last.power).toFixed(2)} kWh of electricity
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {first.timestamp} - {last.timestamp}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
