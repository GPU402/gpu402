import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GPU402 · Pitch",
  description: "GPU402 in ten slides: GPUs that AI agents rent and pay for themselves, over x402, on Bittensor Subnet 51.",
};

export default function PitchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
