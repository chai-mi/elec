"use client";

import * as React from "react";
import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Select onValueChange={setTheme} value={theme}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        </SelectItem>
        <SelectItem value="dark">
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        </SelectItem>
        <SelectItem value="system">
          <SunMoon className="h-[1.2rem] w-[1.2rem]" />
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
