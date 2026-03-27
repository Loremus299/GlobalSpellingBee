"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

export default function Page() {
  const params = useSearchParams();
  const router = useRouter();
  return (
    <main className="w-screen h-screen grid place-items-center">
      <div className="grid gap-4 max-w-md">
        <p>Score: {params.get("score")}</p>
        <p>Your Answer is right :3 Good Job ^^</p>
        <Button onClick={() => router.push(`/game?id=${params.get("id")}`)}>
          Continue
        </Button>
      </div>
    </main>
  );
}
