import { createWord, getSessionData } from "@/game";
import Card from "./card";
import { redirect } from "next/navigation";
import Leaderboard from "./leaderboard";

function incrementDifficulty(val: number) {
  if (val < 4) {
    return 4;
  }
  if (val > 15) {
    return 15;
  } else {
    return val;
  }
}
async function loadData(id: string) {
  const [session] = await getSessionData(id);
  if (session.word == "") {
    const word = await createWord(id, incrementDifficulty(session.score));
    if (word.status == 200) {
      return { blob: new Blob([word.response]), score: session.score };
    } else {
      redirect(`/error?details=${word.response}`);
    }
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const param = await params;
  const data = await loadData(param.id);
  return (
    <div className="p-8 grid place-items-center">
      <Card blob={data?.blob} id={param.id} score={data?.score} />
      <Leaderboard />
    </div>
  );
}
