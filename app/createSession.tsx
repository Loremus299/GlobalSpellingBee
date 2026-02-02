"use client";

import { createGameSession } from "@/game";
import { redirect } from "next/navigation";

async function createGameSessionAndMove() {
  const session = await createGameSession();
  if (session.status == 200) {
    redirect(`/game/${session.response}`);
  } else {
    redirect("/error");
  }
}

export default function CreateSessionButton() {
  return <button onClick={createGameSessionAndMove}>Create Session</button>;
}
