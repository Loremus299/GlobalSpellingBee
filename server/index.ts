"use server";
import { db } from "@/db";
import { scoreBoard, user } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";

export async function createScore(score: number, id: string) {
  await db
    .insert(scoreBoard)
    .values({
      score: score,
      userId: id,
      id: createId(),
    })
    .onConflictDoUpdate({
      target: scoreBoard.userId,
      set: { score: score },
    });
}

export async function getLeaderboard() {
  return await db
    .select({
      id: scoreBoard.id,
      image: user.image,
      name: user.name,
      score: scoreBoard.score,
    })
    .from(scoreBoard)
    .leftJoin(user, eq(scoreBoard.userId, user.id));
}
