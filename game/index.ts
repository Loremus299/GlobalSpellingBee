"use server";
import OpenAI from "openai";
import { db } from "@/db";
import { gameSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

async function getWord(length: number) {
  try {
    const request = await fetch(
      `https://random-word-api.herokuapp.com/word?length=${length}`,
    );
    const data: string[] = await request.json();
    return { response: data[0], status: 200 };
  } catch {
    return {
      response: "Heroku random word API server side error",
      status: 500,
    };
  }
}

async function TTS(word: string) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_APIKEY });
    const mp3 = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: word,
      instructions:
        "Calm, composed, and reassuring; project quiet authority and confidence. Sincere, empathetic, and gently authoritative—express genuine apology while conveying competence. Steady and moderate; unhurried enough to communicate care, yet efficient enough to demonstrate professionalism.",
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    return { response: buffer, status: 200 };
  } catch {
    return { response: "openAI server side error", status: 500 };
  }
}

export async function createGameSession() {
  try {
    const id = createId();
    await db.insert(gameSessions).values({ id: id, word: "", score: 0 });
    return { response: id, status: 200 };
  } catch {
    return { response: "failed to create a game session", status: 500 };
  }
}

export async function VerifyGameSession(value: string) {
  try {
    const check = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, value));
    if (check.length == 0) {
      return { response: "doesn't exist", status: 404 };
    } else {
      return { response: "exists", status: 200 };
    }
  } catch {
    return {
      response: "server side error in verifying your game id",
      status: 500,
    };
  }
}

export async function createWord(id: string, dif: number) {
  try {
    const word = await getWord(dif);
    if (word.status !== 200) {
      return { response: word.response, status: 500 };
    } else {
      const audio = await TTS(word.response);
      if (audio.status !== 200) {
        return { response: audio.response, status: 500 };
      } else {
        await db
          .update(gameSessions)
          .set({ word: word.response })
          .where(eq(gameSessions.id, id));
        return { response: audio.response, status: 200 };
      }
    }
  } catch {
    return {
      response: "Severe error. Please report if you saw this.",
      status: 500,
    };
  }
}

export async function checkWord(req: { word: string; id: string }) {
  try {
    const checkAgainst = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, req.id));

    if (checkAgainst[0].word == req.word) {
      await db
        .update(gameSessions)
        .set({ score: checkAgainst[0].score + 1, word: "" })
        .where(eq(gameSessions.id, req.id));
      return {
        response: "success",
        info: "",
        status: 200,
      };
    } else {
      await db.delete(gameSessions).where(eq(gameSessions.id, req.id));
      return {
        response: "failure",
        info: `{"correct": "${checkAgainst[0].word}", "score": "${checkAgainst[0].score}"}`,
        status: 200,
      };
    }
  } catch {
    return {
      response: "Severe error. Please report if you saw this.",
      info: "",
      status: 500,
    };
  }
}

export async function getSessionData(sessionID: string) {
  return await db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.id, sessionID));
}
