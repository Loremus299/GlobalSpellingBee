"use client";
import { createGameSession } from "@/game";
import { redirect } from "next/navigation";

async function createGameSessionAndMove() {
  const session = await createGameSession();
  if (session.status == 200) {
    redirect(`/game/${session.response}`);
  }
}

export default function Page() {
  return (
    <div>
      <button onClick={createGameSessionAndMove}>Create Session</button>
    </div>
  );
}
