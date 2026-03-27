"use server";

import { db } from "@/db";
import { gameSessions } from "@/db/schema";
import { Result } from "@/lib/result";
import { critical, log } from "@/logger";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";

export async function createGameSession(
  userid: string,
): Promise<Result<string, string>> {
  log.withContext({ userid }).info("Triggered createGameSession");
  try {
    const SessionIDArray = await db
      .select({ id: gameSessions.id })
      .from(gameSessions)
      .where(eq(gameSessions.master, userid));
    if (SessionIDArray.length == 0) {
      const id = createId();
      await db
        .insert(gameSessions)
        .values({ id: id, master: userid, tempScore: 0, word: null });

      log
        .withMetadata({ gameSessionId: id })
        .info("created game session for user");
      return { success: true, data: id };
    } else {
      log
        .withMetadata({ gameSessionId: SessionIDArray[0].id, userid })
        .info("created game session for user");
      return { success: true, data: SessionIDArray[0].id };
    }
  } catch (e) {
    log.withError(e).error("createGameSession created an error");
    return {
      success: false,
      error: "createGameSession created an error" + critical,
    };
  } finally {
    log.clearContext(["userid"]);
  }
}
