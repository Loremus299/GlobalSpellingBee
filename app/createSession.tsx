"use client";
import { Button } from "@/components/ui/button";
import { createGameSession } from "@/game";
import { useRouter } from "next/navigation";

export default function CreateSessionButton() {
  const router = useRouter();
  return (
    <Button
      onClick={async () => {
        const res = await createGameSession();
        if (res.status == 200) {
          router.push(`/${res.response}/game`);
        } else {
          router.replace("/error/500?m=Could not create session&c=500");
        }
      }}
    >
      Create Session
    </Button>
  );
}
