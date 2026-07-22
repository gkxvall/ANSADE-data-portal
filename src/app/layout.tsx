import type { Metadata, Viewport } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { getPublicEnv } from "@/lib/env/public";
import "@/styles/globals.css";

const publicEnv = getPublicEnv();

export const metadata: Metadata = {
  title: {
    default: publicEnv.NEXT_PUBLIC_APP_NAME,
    template: `%s · ${publicEnv.NEXT_PUBLIC_APP_NAME}`,
  },
  description: "Explorer les données statistiques publiées par l’ANSADE.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#173d3d",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <AppShell appName={publicEnv.NEXT_PUBLIC_APP_NAME}>{children}</AppShell>
      </body>
    </html>
  );
}
