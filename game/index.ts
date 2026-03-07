"use server";
import { db } from "@/db";
import { gameSessions, wordTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { generate } from "random-words";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_APIKEY });
const objectStorage = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.ACCOUNT_ID!}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.ACCESS_KEY_SECRET!,
  },
  bucketEndpoint: false,
});

function getWord(length: number): string {
  return generate({
    maxLength: length,
    minLength: length,
    min: 1,
    max: 1,
  })[0].toLowerCase();
}

async function TTS(word: string) {
  const dbCheck = await db
    .select()
    .from(wordTable)
    .where(eq(wordTable.word, word));

  if (dbCheck.length > 0) {
    console.log(
      `WordTable already has the word ${word} used ${dbCheck[0].counter} times`,
    );
    await db.update(wordTable).set({ counter: dbCheck[0].counter + 1 });
    return await getSignedUrl(
      objectStorage,
      new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME!,
        Key: dbCheck[0].id,
      }),
      { expiresIn: 3600 },
    );
  } else {
    const id = createId();
    console.log(
      `WordTable doesn't have the word ${word}. Creating it with ID ${id}`,
    );
    const mp3 = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: word,
      instructions:
        "Calm, composed, and reassuring; project quiet authority and confidence. Sincere, empathetic, and gently authoritative—express genuine apology while conveying competence. Steady and moderate; unhurried enough to communicate care, yet efficient enough to demonstrate professionalism. As if the person is supposed to repeat you.",
    });
    console.log("openAI successfully returned data");
    await objectStorage.send(
      new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME!,
        Body: Buffer.from(await mp3.arrayBuffer()),
        Key: id,
        ContentType: "audio/mp3",
      }),
    );
    console.log("R2 successfully stored data");
    await db.insert(wordTable).values({ id: id, word: word, counter: 0 });
    console.log(`Successfully created ${word} with id ${id}`);
    return await getSignedUrl(
      objectStorage,
      new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME!,
        Key: id,
      }),
      { expiresIn: 3600 },
    );
  }
}

export async function createGameSession() {
  try {
    console.log("received request to create session");
    const id = createId();
    await db
      .insert(gameSessions)
      .values({ id: id, word: null, score: 0, lock: false });

    console.log(`created new session with id ${id}`);
    return { response: id, status: 200 };
  } catch (e) {
    console.log("createGameSession failed");
    console.log(e);
    return { status: 500 };
  }
}

export async function VerifyGameSession(value: string) {
  try {
    console.log(`checking for session ${value}`);
    const check = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, value));
    if (check.length == 0) {
      console.log(`${value} session didn't exist`);
      return { status: 404 };
    } else {
      console.log(`${value} session existed`);
      return { status: 200, response: check[0] };
    }
  } catch (e) {
    console.log("verifyGameSession failed");
    console.log(e);
    return { status: 500 };
  }
}

export async function createWord(id: string, dif: number) {
  try {
    const word = getWord(dif);
    console.log(`generated word ${word} for ${id}`);
    const speech = await TTS(word);
    console.log(`returned url ${speech} for word ${word}`);
    await db
      .update(gameSessions)
      .set({ word: word })
      .where(eq(gameSessions.id, id));

    return { status: 200, response: speech };
  } catch (e) {
    console.log("createWord failed here");
    console.log(e);
    return { status: 500 };
  }
}

export async function checkWord(req: { word: string; id: string }) {
  try {
    console.log(`checking word ${req.word} for ${req.id}`);
    const row = (
      await db
        .select({ word: gameSessions.word, score: gameSessions.score })
        .from(gameSessions)
        .where(eq(gameSessions.id, req.id))
    )[0];
    console.log(`input was "${req.word}", answer was "${row.word}"`);

    if (row.word == req.word) {
      await db
        .update(gameSessions)
        .set({ word: null, score: row.score + 1 })
        .where(eq(gameSessions.id, req.id));
      console.log(`set the score to ${row.score + 1}`);
      return { status: 200, response: true };
    } else {
      await db
        .update(gameSessions)
        .set({ lock: true, word: null })
        .where(eq(gameSessions.id, req.id));
      console.log(`session ${req.id} has been locked`);
      return {
        status: 200,
        response: false,
      };
    }
  } catch (e) {
    console.log("server failed in checking word");
    console.log(e);
    return { status: 500 };
  }
}
