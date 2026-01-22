import { createWord, getSessionData } from "@/game";
import Card from "./card";

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
      return new Blob([word.response]);
    }
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const param = await params;
  const blob = await loadData(param.id);
  return (
    <div className="p-8 grid place-items-center">
      <Card blob={blob} id={param.id} />
    </div>
  );
}
