import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Motion } from "./ui/motion-config";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["italic"], variable: "--font-instrument" });

export const metadata: Metadata = {
  title: "GPU402 · Live",
  description: "Lium GPUs on Bittensor Subnet 51, rented and paid for by the request with x402.",
};

export const viewport: Viewport = { themeColor: "#07080A", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${instrument.variable}`}>
      <body className="min-h-dvh font-sans">
        <Motion>{children}</Motion>
      </body>
    </html>
  );
}
