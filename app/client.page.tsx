"use client";

import { Card } from "@/components/ui/card";
import StartButton from "./components/start";
import ScoreIndicator from "./components/score";

export default function ClientPage(props: {
  anondata?: { id: string; score: number };
  realdata?: { id: string; score: number; name: string; image: string };
}) {
  return (
    <main className="w-screen min-h-screen">
      <nav className="fixed w-screen p-4">
        <Card className="p-4 bg-white">
          <div className="flex items-center justify-between">
            <ScoreIndicator data={props} />
            <StartButton id={props.anondata?.id || props.realdata?.id} />
          </div>
        </Card>
      </nav>
      <div className="grid place-items-center w-screen h-screen p-4">
        <div className="grid gap-2 max-w-sm">
          <p className="text-3xl font-semibold text-center">
            GLOBAL SPELLING BEE
          </p>
          <StartButton id={props.anondata?.id || props.realdata?.id} />
          <div className="mt-2 text-black">
            A spelling bee where the world competes and you can too. <br />
            <p className="mt-2 text-chart-3 bg-white p-4 rounded-md border-2 border-black">
              This current frontend UI is temporary as I design a better one
              with a bee mascot :3
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
