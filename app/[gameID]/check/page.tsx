import { checkWord } from "@/game";
import Client from "./client";
import { redirect } from "next/navigation";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ gameID: string }>;
  searchParams: Promise<{ word: string }>;
}) {
  const gameID = (await params).gameID;
  const word = (await searchParams).word;

  const value = await checkWord({ id: gameID, word: word }).then((e) => {
    if (e.status == 200) {
      return e.response;
    } else {
      redirect("/error/500?m=Looks like we couldn't check your word");
    }
  });

  return (
    <div className="grid place-items-center min-h-screen">
      <div>
        <p>{value! ? "correct" : "incorrect"}</p>
        <Client id={gameID} answerRight={value!} />
      </div>
    </div>
  );
}
