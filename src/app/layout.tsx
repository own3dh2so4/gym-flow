import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gym Flow · Tu rutina, a tu ritmo",
  description: "Rutinas mensuales de gimnasio con seguimiento local.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#20251f",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
