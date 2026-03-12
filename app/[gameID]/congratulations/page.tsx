import { authClient } from "@/auth/auth-client";
import { db } from "@/db";
import { gameSessions } from "@/db/schema";
import { createScore } from "@/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import InvalidateLeaderboard from "./invalidateLeaderboard";

export default async function Page({
  params,
}: {
  params: Promise<{ gameID: string }>;
}) {
  const gameID = (await params).gameID;
  const score = (
    await db
      .select({ score: gameSessions.score })
      .from(gameSessions)
      .where(eq(gameSessions.id, gameID))
  )[0].score;

  const session = await authClient.getSession({
    fetchOptions: { headers: await headers() },
  });
  if (session.data?.user.id) {
    createScore(score, session.data.user.id);
  } else {
    throw new Error("Oops");
  }

  return (
    <div>
      <InvalidateLeaderboard />
    </div>
  );
}
