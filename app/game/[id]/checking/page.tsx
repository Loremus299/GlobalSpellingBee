import { checkWord } from "@/game";
import SuccessCard from "./successCard";
import FailureCard from "./failureCard";
import { redirect } from "next/navigation";

async function answerStatus(arg: { id: string; word: string }) {
  const status = await checkWord({ id: arg.id, word: arg.word });
  if (status.status == 200) {
    if (status.response == "success") {
      return <SuccessCard id={arg.id} />;
    }
    if (status.response == "failure") {
      return <FailureCard response={status.info} />;
    }
  } else {
    redirect(`/error?details=${status.response}`);
  }
}

export default async function Page({
  searchParams,
  params,
}: {
  searchParams: Promise<{ answer: string }>;
  params: Promise<{ id: string }>;
}) {
  const searchParam = await searchParams;
  const param = await params;
  return answerStatus({ id: param.id, word: searchParam.answer });
}
