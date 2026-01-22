"use server";
import { db } from "@/db";
import { scoreBoard } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";

export async function createScore(score: number, id: string) {
  await db.insert(scoreBoard).values({
    score: score,
    userId: id,
    id: createId(),
  });
}
