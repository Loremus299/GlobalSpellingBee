import { auth } from "@/auth";
import { db } from "@/db";
import { gameSessions } from "@/db/schema";
import { Result } from "@/lib/result";
import { critical } from "@/logger";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ClientPage from "./client.page";
import {
  getScoreboard,
  getWordObjectFromSession,
  insertWordIntoSession,
} from "./actions";

async function verifyPathValidity(
  id: string,
): Promise<
  Result<
    { id: string; word: string | null; tempScore: number; master: string },
    string
  >
> {
  try {
    const header = await headers();
    const session = await auth.api.getSession({ headers: header });
    if (session) {
      const uid = session.user.id;
      const sessionArrayFromId = await db
        .select()
        .from(gameSessions)
        .where(eq(gameSessions.id, id));
      if (sessionArrayFromId.length == 0) {
        return {
          success: false,
          error: "There doesn't seem to be any session like this.",
        };
      }
      const sessionInfo = sessionArrayFromId[0];
      if (sessionInfo.master == uid) {
        return {
          success: true,
          data: {
            id: sessionInfo.id,
            master: sessionInfo.master,
            tempScore: sessionInfo.tempScore,
            word: sessionInfo.word,
          },
        };
      }
      return { success: false, error: "This session isn't yours honey." };
    }
    return {
      success: false,
      error: "You don't have a user. Please create one on landing page.",
    };
  } catch {
    return {
      success: false,
      error: "Unknown error in verifying path validity" + critical,
    };
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}) {
  const params = await searchParams;
  const validity = await verifyPathValidity(params.id);
  if (!validity.success) {
    redirect(`/error?data=${validity.error}`);
  }

  if (!validity.data.word) {
    let count = 0;
    while (count < 5) {
      const insert = await insertWordIntoSession(
        validity.data.id,
        validity.data.tempScore,
      );
      if (!insert.success) {
        count++;
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else {
        break;
      }
    }
  }

  const data = await getWordObjectFromSession(validity.data.id);
  if (!data.success) {
    redirect(`/error?data=${data.error}`);
  }

  const mapData = await getScoreboard();
  mapData.push({
    image: "./bee.jpg",
    name: "Current Session",
    score: validity.data.tempScore,
  });
  const map = mapData.sort((a, b) => b.score - a.score);
  return (
    <ClientPage
      id={validity.data.id}
      definition={data.data.definition}
      url={data.data.url}
      score={validity.data.tempScore}
      map={map}
    />
  );
}
