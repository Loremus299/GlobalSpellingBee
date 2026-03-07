import { createWord, VerifyGameSession } from "@/game";
import UserInput from "./input";
import { redirect, RedirectType } from "next/navigation";

function incrementalDifficulty(num: number) {
  if (num < 3) {
    return 3;
  }
  if (num > 11) {
    return Math.floor(Math.random() * 3) + 9;
  } else {
    return Math.floor(Math.random() * 5) + (num - 2);
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ gameID: string }>;
}) {
  let audio: string | undefined = undefined;
  const gameID = (await params).gameID;

  const session = await VerifyGameSession(gameID).then((e) => {
    if (e.status == 200) {
      return e.response;
    } else {
      redirect(
        "/error/404?m=The game session you requested doesn't seem to exist",
        RedirectType.replace,
      );
    }
  });

  if (session && !session.lock) {
    if (session.word == null) {
      audio = await createWord(
        session.id,
        incrementalDifficulty(session.score),
      ).then((e) => {
        if (e.status == 200) {
          return e.response;
        } else {
          redirect(
            "/error/500?m=Looks like we couldn't find any word for you",
            RedirectType.replace,
          );
        }
      });
    }
  } else {
    redirect("/");
  }

  return (
    <div className="grid place-items-center min-h-screen">
      <UserInput audio={audio} score={session!.score} id={session!.id} />
    </div>
  );
}
