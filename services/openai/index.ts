import { db } from "@/db";
import { words } from "@/db/schema";
import { Result } from "@/lib/result";
import { critical, log, refresh } from "@/logger";
import { s3 } from "@/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createId } from "@paralleldrive/cuid2";
import Ffmpeg from "fluent-ffmpeg";
import { readFile, writeFile } from "fs/promises";
import { OpenAI } from "openai";

export default async function OpenAIPipeline(wordObject: {
  word: string;
  definition: string;
}): Promise<Result<null, string>> {
  log.withMetadata({ wordObject }).info("Triggered OpenAIPipeline");
  const openAIPipeline = createId();
  log.withContext({ openAIPipeline });
  try {
    const req = await OpenAIRequest(wordObject.word);
    if (!req.success) {
      return { success: false, error: req.error };
    }
    const ffmpeg1 = await deleteSilence(req.data);
    if (!ffmpeg1.success) {
      return { success: false, error: ffmpeg1.error };
    }
    const ffmpeg2 = await TTSValidation(`${req.data}-2`);
    if (!ffmpeg2.success) {
      return { success: false, error: ffmpeg2.error };
    }
    const store = await storeWordObject(req.data, wordObject);
    if (!store.success) {
      return { success: false, error: store.error };
    }
    return { success: true, data: null };
  } catch {
    return {
      success: false,
      error: "OpenAIPipeline failed unexpectedly" + critical,
    };
  } finally {
    log.clearContext(["openAIPipeline"]);
  }
}

async function OpenAIRequest(word: string): Promise<Result<string, string>> {
  try {
    log.withMetadata({ word }).info("Triggered OpenAIRequest");
    const id = createId();
    const openai = new OpenAI({ apiKey: process.env.OPENAI_APIKEY! });
    const mp3 = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "fable",
      input: word,
      instructions: `Voice Affect: Calm, composed, and reassuring; project quiet authority and confidence.
        Tone: Sincere, empathetic, and gently authoritative—express genuine apology while conveying competence.
        Pacing: Steady and moderate; unhurried enough to communicate care, yet efficient enough to demonstrate 
        professionalism.`,
    });
    const audio = Buffer.from(await mp3.arrayBuffer());
    await writeFile(`./${id}.mp3`, audio);
    log.withMetadata({ filename: id }).info("OpenAIRequest saved the file");
    return { success: true, data: id };
  } catch {
    return {
      success: false,
      error: "OpenAIRequest or write to disk failed. " + critical,
    };
  }
}

async function deleteSilence(filename: string): Promise<Result<null, string>> {
  try {
    log.withMetadata({ filename }).info("Triggered deleteSilence");

    await new Promise<void>((resolve, reject) => {
      Ffmpeg(`./${filename}.mp3`)
        .audioFilters("silenceremove=1:0:-50dB")
        .saveToFile(`./${filename}-2.mp3`)
        .on("end", async () => {
          resolve();
        })
        .on("error", (e) => reject(e))
        .run();
    });
    log.withMetadata({ filename }).info("exited deleteSilence");
    return { success: true, data: null };
  } catch (e) {
    log.withError(e).error("deleteSilence failed");
    return { success: false, error: "deleteSilence failed. " + critical };
  }
}

async function TTSValidation(filename: string): Promise<Result<null, string>> {
  log.withMetadata({ filename }).info("Triggered TTSValidation");
  try {
    const ffmpeg = await new Promise<string>((resolve) => {
      let mpreglog = "";
      Ffmpeg(`./${filename}.mp3`)
        .audioFilters("silencedetect=-50dB:d=0")
        .format("null")
        .output("pipe:1")
        .on("stderr", (line) => {
          mpreglog += line + "\n";
        })
        .on("end", () => resolve(mpreglog))
        .run();
    });

    const match = ffmpeg.match(/silence_duration:\s*([0-9.]+)/);
    const duration = parseFloat(match![1]);

    const length = await new Promise<number>((resolve) => {
      Ffmpeg.ffprobe(`./${filename}.mp3`, (_err, meta) => {
        resolve(meta.format.duration!);
      });
    });

    if (duration / length < 0.75) {
      log
        .withMetadata({ ratio: duration / length })
        .info("Exited TTS Validation with success");
      return { success: true, data: null };
    } else {
      log
        .withMetadata({ ratio: duration / length })
        .error("Exited TTS Validation with failure");
      return { success: false, error: "TTS was empty. " + refresh };
    }
  } catch (e) {
    log.withError(e).error("TTSValidation failed unexpectedly");
    return {
      success: false,
      error: "TTSValidation failed unexpectedly. " + critical,
    };
  }
}

async function storeWordObject(
  id: string,
  wordObject: { word: string; definition: string },
): Promise<Result<null, string>> {
  log.withMetadata({ id, wordObject }).info("Triggered storeWordObject");
  try {
    await db.insert(words).values({
      id: id,
      word: wordObject.word,
      definition: wordObject.definition,
    });

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME!,
        Key: id,
        Body: Buffer.from((await readFile(`./${id}-2.mp3`)).buffer),
        ContentType: "audio/mp3",
      }),
    );
    log
      .withMetadata({ id, wordObject })
      .info("Exited storeWordObject successfully");
    return { success: true, data: null };
  } catch (e) {
    log.withError(e).error("exited storeWordObject with failure");
    return {
      success: false,
      error: "exited storeWordObject with failure. " + critical,
    };
  }
}
