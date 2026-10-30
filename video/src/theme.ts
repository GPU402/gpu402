import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

export const { fontFamily: sans } = loadInter("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] });
export const { fontFamily: mono } = loadMono("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });

export const C = {
  bg: "#06080c",
  panel: "#0d1117",
  panel2: "#121821",
  line: "#1c2430",
  line2: "#263142",
  text: "#e6edf3",
  muted: "#8b98a9",
  faint: "#5b6778",
  green: "#39d98a",
  blue: "#5aa9ff",
  purple: "#b892ff",
  amber: "#ffb547",
  red: "#ff6b6b",
};

export const FPS = 30;
export const W = 1920;
export const H = 1080;
