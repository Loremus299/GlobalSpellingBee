"use cache";

import { getLeaderboard } from "@/server";
import { cacheTag } from "next/cache";
import ClientLeaderboard from "./client.leaderboard";

export default async function Leaderboard() {
  cacheTag("leaderboard-data");
  const leaderboard = await getLeaderboard();

  return (
    <div>
      <ClientLeaderboard board={leaderboard} />
    </div>
  );
}
