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
import { writeFile, unlink } from "fs/promises";
import ffmpeg from "fluent-ffmpeg";

function createObjectStorage(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: process.env.ENDPOINT_URL!,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID!,
      secretAccessKey: process.env.ACCESS_KEY_SECRET!,
    },
    bucketEndpoint: false,
  });
}

async function getWord(length: number): Promise<string> {
  if (length > 11) {
    const req = await fetch(
      "https://random-word-api.herokuapp.com/word?length=15",
    );
    const res: string[] = await req.json();
    return res[0];
  } else {
    return generate({
      maxLength: length,
      minLength: length,
      min: 1,
      max: 1,
    })[0].toLowerCase();
  }
}

async function TTS(word: string) {
  console.log("-------------------------------------------------------------");
  const objectStorage = createObjectStorage();
  const dbCheck = await db
    .select()
    .from(wordTable)
    .where(eq(wordTable.word, word));

  if (dbCheck.length > 0) {
    console.info(
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
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_APIKEY! });
      const id = createId();
      console.warn(
        `WordTable doesn't have the word ${word}. Creating it with ID ${id}`,
      );
      const mp3 = await openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: "alloy",
        input: word,
        instructions:
          "Calm, composed, and reassuring; project quiet authority and confidence. Sincere, empathetic, and gently authoritative—express genuine apology while conveying competence. Steady and moderate; unhurried enough to communicate care, yet efficient enough to demonstrate professionalism. As if the person is supposed to repeat you.",
      });
      console.info("openAI successfully returned data");
      console.info("Checking if Audio is proper");
      const audio = Buffer.from(await mp3.arrayBuffer());
      await writeFile(`./${id}.mp3`, audio);
      console.info("stored file temporarily");
      let ffmpegLog = "";
      await new Promise<void>((resolve, reject) => {
        ffmpeg(`./${id}.mp3`)
          .audioFilters("silencedetect=noise=-50dB:d=0.1")
          .format("null")
          .output("-")
          .on("stderr", (line) => {
            ffmpegLog += line + "\n";
          })
          .on("end", () => resolve())
          .on("error", (err) => reject(err))
          .run();
      });

      const silenceMatch = ffmpegLog.match(/silence_duration:\s*([0-9.]+)/);
      const silenceDuration = ffmpegLog ? parseFloat(silenceMatch![1]) : 0;

      const duration = await new Promise<number>((resolve, reject) => {
        ffmpeg.ffprobe(`./${id}.mp3`, (err, metadata) => {
          if (err) return reject(err);
          resolve(metadata.format.duration ?? 0);
        });
      });
      console.info("deleted temp file");
      await unlink(`./${id}.mp3`);

      console.info(`audio duration: ${duration}`);
      console.info(`silence duration: ${silenceDuration}`);

      if (duration > 0 && silenceDuration >= duration * 0.75) {
        console.error("Generated TTS audio is silent");
        throw new Error("Silent TTS output");
      }

      console.info("Audio passed silence check");
      console.info("Sent store request to DB");
      await db.insert(wordTable).values({
        id,
        word,
        counter: 0,
      });
      console.info("stored in DB");

      console.info("Uploading audio to object storage");
      await objectStorage.send(
        new PutObjectCommand({
          Bucket: process.env.BUCKET_NAME!,
          Key: id,
          Body: audio,
          ContentType: "audio/mp3",
        }),
      );
      console.info("Audio successfully uploaded");

      return await getSignedUrl(
        objectStorage,
        new GetObjectCommand({
          Bucket: process.env.BUCKET_NAME!,
          Key: id,
        }),
        { expiresIn: 3600 },
      );
    } catch (e) {
      console.error("The process of storing new word threw an error");
      console.error(e);
    }
  }
}

export async function createGameSession() {
  console.log("-------------------------------------------------------------");
  try {
    console.info("received request to create session");
    const id = createId();
    await db
      .insert(gameSessions)
      .values({ id: id, word: null, score: 0, lock: false });

    console.info(`created new session with id ${id}`);
    return { response: id, status: 200 };
  } catch (e) {
    console.error("createGameSession failed");
    console.error(e);
    return { status: 500 };
  }
}

export async function VerifyGameSession(value: string) {
  console.log("-------------------------------------------------------------");
  try {
    console.info(`checking for session ${value}`);
    const check = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, value));
    if (check.length == 0) {
      console.warn(`${value} session didn't exist`);
      return { status: 404 };
    } else {
      console.info(`${value} session existed`);
      return { status: 200, response: check[0] };
    }
  } catch (e) {
    console.error("verifyGameSession failed");
    console.error(e);
    return { status: 500 };
  }
}

export async function createWord(id: string, dif: number) {
  console.log("-------------------------------------------------------------");
  try {
    let speech: string | undefined;
    let word: string | undefined;

    while (!speech) {
      word = await getWord(dif);
      console.info(`generated word ${word} for ${id}`);

      try {
        speech = await TTS(word);
        console.info(`returned url ${speech} for word ${word}`);
      } catch (e) {
        console.warn(`TTS failed for word ${word}, retrying...`);
        console.error(e);
      }
    }

    await db
      .update(gameSessions)
      .set({ word: word })
      .where(eq(gameSessions.id, id));

    return { status: 200, response: speech };
  } catch (e) {
    console.error("createWord failed here");
    console.error(e);
    return { status: 500 };
  }
}

export async function checkWord(req: { word: string; id: string }) {
  console.log("-------------------------------------------------------------");
  try {
    console.info(`checking word ${req.word} for ${req.id}`);
    const row = (
      await db
        .select({ word: gameSessions.word, score: gameSessions.score })
        .from(gameSessions)
        .where(eq(gameSessions.id, req.id))
    )[0];
    console.info(`input was "${req.word}", answer was "${row.word}"`);

    if (row.word == req.word) {
      await db
        .update(gameSessions)
        .set({ word: null, score: row.score + 1 })
        .where(eq(gameSessions.id, req.id));
      console.info(`set the score to ${row.score + 1}`);
      return { status: 200, response: true };
    } else {
      await db
        .update(gameSessions)
        .set({ lock: true, word: null })
        .where(eq(gameSessions.id, req.id));
      console.info(`session ${req.id} has been locked`);
      return {
        status: 200,
        response: false,
      };
    }
  } catch (e) {
    console.error("server failed in checking word");
    console.error(e);
    return { status: 500 };
  }
}
