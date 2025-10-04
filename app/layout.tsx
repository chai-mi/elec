import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";

import { ModeToggle } from "@/components/mode-toggle";

export const metadata: Metadata = {
  title: "EMoE",
  description: "Electricity monitoring of ECUST",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider
          attribute="class"
          scriptProps={{ "data-cfasync": false }}
        >
          <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-semibold">EMoE</span>
            </div>

            <div className="flex items-center space-x-6">
              <a href="https://github.com/chai-mi/elec" target="_blank">
                GitHub
              </a>
              <ModeToggle />
            </div>
          </nav>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
