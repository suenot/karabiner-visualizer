import type { Metadata } from "next";
import { Constructor } from "@/components/Constructor";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "karabiner-visualizer — constructor",
  description:
    "Build, edit and preview Karabiner-Elements rules visually. Export to kanata, AutoHotkey, keyd, xremap, KMonad.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-[1400px] mx-auto px-6 py-8 flex flex-col gap-6">
        <SiteHeader current="constructor" />

        <header>
          <h1 className="text-2xl font-bold tracking-tight">
            Karabiner constructor
          </h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-3xl">
            Paste, edit or pick a preset of Karabiner-Elements JSON rules. The
            keyboard updates live as you type. Export the same rules to
            kanata, AutoHotkey, keyd, xremap or KMonad — one config, many OSes.
          </p>
        </header>

        <Constructor />
      </div>
    </main>
  );
}
