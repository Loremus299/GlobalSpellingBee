"use server";

import { db } from "@/db";
import { gameSessions, user, words } from "@/db/schema";
import { Result } from "@/lib/result";
import { critical, log, refresh } from "@/logger";
import { getObject } from "@/s3/action";
import getWord from "@/services/datamuse";
import OpenAIPipeline from "@/services/openai";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

const difficulty = (score: number) => {
  const seed = Math.random();
  if (score < 7) {
    return Math.floor(seed * 5 + 3);
  }
  if (score < 12) {
    return Math.floor(seed * 5 + 5);
  }
  if (score < 22) {
    return Math.floor(seed * 10 + 10);
  }
  if (score < 32) {
    return Math.floor(seed * 10 + 15);
  }
  return Math.floor(seed * 20 + 10);
};

export async function insertWordIntoSession(
  id: string,
  score: number,
): Promise<Result<null, string>> {
  log.withContext({ id, score }).info("Triggered create word");
  try {
    const length = difficulty(score);
    log.withMetadata({ length }).info("Triggered datamuse getWord request");
    const datamuseResponse = await getWord(length);
    if (!datamuseResponse.success) {
      return { success: false, error: datamuseResponse.error };
    }

    const dbLookUpForWordArray = await db
      .select()
      .from(words)
      .where(eq(words.word, datamuseResponse.data.word));

    log
      .withMetadata({ dbLookUpForWordArray })
      .info("result of looking up word in words database");
    if (dbLookUpForWordArray.length == 0) {
      log
        .withMetadata({ word: datamuseResponse.data.word })
        .info("Triggered OpenAI words table mutation");
      const openAIRequest = await OpenAIPipeline(datamuseResponse.data);
      if (!openAIRequest.success) {
        return { success: false, error: openAIRequest.error };
      }
    }

    log
      .withMetadata({ word: datamuseResponse.data.word })
      .info("Triggered session table mutation");
    await db
      .update(gameSessions)
      .set({ word: datamuseResponse.data.word })
      .where(eq(gameSessions.id, id));

    return {
      success: true,
      data: null,
    };
  } catch {
    return {
      success: false,
      error: "inserting word into game session failed" + critical,
    };
  } finally {
    log.clearContext(["id", "score"]);
  }
}

export async function getWordObjectFromSession(
  id: string,
): Promise<Result<{ definition: string; url: string }, string>> {
  log.withContext({ id }).info("Triggered get word object from session id");
  try {
    const sessionInfo = (
      await db.select().from(gameSessions).where(eq(gameSessions.id, id))
    )[0].word;

    if (!sessionInfo) {
      return { success: false, error: "Couldn't get session word" + refresh };
    }
    const wordObject = (
      await db.select().from(words).where(eq(words.word, sessionInfo))
    )[0];

    const getUrl = await getObject(wordObject.id);
    log
      .withMetadata({
        word: wordObject.word,
        definition: wordObject.definition,
        url: getUrl,
      })
      .info("session word data");
    return {
      success: true,
      data: {
        definition: wordObject.definition,
        url: getUrl,
      },
    };
  } catch {
    return {
      success: false,
      error:
        "get word object from session failed with unknown error" + critical,
    };
  } finally {
    log.clearContext(["id"]);
  }
}

export async function checkWord({
  id,
  answer,
}: {
  id: string;
  answer: string;
}): Promise<Result<{ status: boolean; info: number | string }, string>> {
  log.withContext({ id, answer }).info("Triggered check word");
  try {
    const session = (
      await db.select().from(gameSessions).where(eq(gameSessions.id, id))
    )[0];

    if (!session.word) {
      return { success: false, error: "Session word doesn't even exist" };
    }
    if (answer == session.word) {
      await db
        .update(gameSessions)
        .set({
          word: null,
          tempScore: session.tempScore + 1,
        })
        .where(eq(gameSessions.id, session.id));
      return {
        success: true,
        data: { status: true, info: session.tempScore + 1 },
      };
    } else {
      await db
        .update(user)
        .set({ score: session.tempScore })
        .where(eq(user.id, session.master));
      await db.delete(gameSessions).where(eq(gameSessions.id, session.id));
      return { success: true, data: { status: false, info: session.word } };
    }
  } catch {
    return { success: false, error: "checkword failed" + critical };
  } finally {
    log.clearContext(["id", "answer"]);
  }
}

export async function getScoreboard() {
  "use cache";
  cacheTag("scoreboard");
  cacheLife("max");
  if (process.env.NODE_ENV == "development") {
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
  return await db
    .select({
      name: user.name,
      score: user.score,
      image: user.image,
    })
    .from(user)
    .where(eq(user.isAnonymous, false));
}
