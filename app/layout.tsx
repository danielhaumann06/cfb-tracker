import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { AppShell } from "@/components/AppShell";
import { THEME_TEAM_COOKIE, parseThemeTeamCookie } from "@/lib/teams";
import { getTeamSummary } from "@/lib/espn";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DEFAULT_THEME_COLOR = "2a78d6";

async function getThemeColor(): Promise<string> {
  const cookieStore = await cookies();
  const themeTeamId = parseThemeTeamCookie(
    cookieStore.get(THEME_TEAM_COOKIE)?.value
  );
  try {
    const team = await getTeamSummary(themeTeamId);
    return team.color || DEFAULT_THEME_COLOR;
  } catch {
    return DEFAULT_THEME_COLOR;
  }
}

export const metadata: Metadata = {
  title: "Saturday Slate",
  description:
    "Records, schedules, spreads, FPI, and playoff odds for your tracked college football teams.",
  appleWebApp: {
    title: "Saturday Slate",
    statusBarStyle: "black-translucent",
  },
};

export async function generateViewport(): Promise<Viewport> {
  const color = await getThemeColor();
  return {
    themeColor: `#${color}`,
    viewportFit: "cover",
  };
}

export default async function RootLayout({
  children,
}: LayoutProps<"/">) {
  const color = await getThemeColor();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ ["--seq-fill" as string]: `#${color}` }}
    >
      <body className="min-h-full flex flex-col pt-[env(safe-area-inset-top)]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
