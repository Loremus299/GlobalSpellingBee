import { Result } from "@/lib/result";
import { critical, log } from "@/logger";
import { createId } from "@paralleldrive/cuid2";

interface WordObject {
  word: string;
  score: number;
  defs: string[];
}

export default async function getWord(
  length: number,
): Promise<Result<{ word: string; definition: string }, string>> {
  const getWordContext = createId();
  log.withContext({ getWordContext });

  try {
    const query = queryBuilder(length);
    const req = await datamuseRequest(query, length);
    if (!req.success) {
      return { success: false, error: req.error };
    }
    const data = parseWordObject(req.data);
    return { success: true, data };
  } catch (e) {
    log.withError(e).error("getWord returned an unrecognized error");
    return {
      success: false,
      error: "getWord returned an unrecognized error. " + critical,
    };
  } finally {
    log.clearContext(["getWordContext"]);
  }
}

function queryBuilder(length: number): string {
  const query = `https://api.datamuse.com/words?sp=${"[a-z]".repeat(length)}&md=d&max=50`;
  log.withMetadata({ query, length }).info("queryBuilder created query");
  return query;
}

async function datamuseRequest(
  query: string,
  length: number,
): Promise<Result<WordObject, string>> {
  try {
    const req = await fetch(query);
    const res: WordObject[] = await req.json();

    if (length == 4) {
      res.push({
        word: "Leah",
        defs: [
          "(Easter Egg Word) This is the name of my friend :3 slug girl super star.",
        ],
        score: 0,
      });
    }

    if (length == 5) {
      res.push({
        word: "Steve",
        defs: ["(Easter Egg Word) 15 year old child labour enthusiast."],
        score: 0,
      });
    }

    if (length == 6) {
      res.push(
        {
          word: "Gesche",
          defs: [
            "(Easter Egg Word) This mystical creature sustains itself solely on onions.",
          ],
          score: 0,
        },
        {
          word: "Stella",
          defs: ["(Easter Egg Word) The name of my girlfriend and wife :3"],
          score: 0,
        },
      );
    }
    const seed = Math.random();
    const index = Math.floor(seed * res.length);
    const pickedWord = res[index];
    return { success: true, data: pickedWord };
  } catch (e) {
    log.withError(e).error("datamuseRequest failed");
    return {
      success: false,
      error: "datamuseRequest failed. " + critical,
    };
  }
}

function parseWordObject(wordObject: WordObject) {
  const definition = wordObject.defs[0].split("\t")[1].trim();
  definition.replace(wordObject.word, "----");
  const word = wordObject.word.toLowerCase().trim();

  log
    .withMetadata({ definition, word })
    .info("Picked word and definition from Datamuse Response");

  return { definition, word };
}
