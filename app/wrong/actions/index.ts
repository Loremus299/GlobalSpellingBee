"use server";

import { db } from "@/db";
import { gameSessions, user } from "@/db/schema";
import { log } from "@/logger";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";

export async function updateScore(id: string) {
  log.withContext({ id }).info("triggered update score");
  updateTag("scoreboard");
  try {
    const session = (
      await db.select().from(gameSessions).where(eq(gameSessions.id, id))
    )[0];
    await db
      .update(user)
      .set({ score: session.tempScore })
      .where(eq(user.id, session.master));
    db.delete(gameSessions).where(eq(gameSessions.id, id));
    log.info("update score exited successfully");
  } catch (e) {
    log.withError(e).error("update score exited with failure");
  } finally {
    log.clearContext(["id"]);
  }
}
