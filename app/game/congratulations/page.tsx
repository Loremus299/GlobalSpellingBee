"use client";
import { authClient } from "@/auth/auth-client";
import { createScore } from "@/server";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

async function storeScoreFunction(score: number) {
  const userdata = await authClient.getSession();
  if (userdata.data?.user.id) {
    await createScore(score, userdata.data.user.id);
  }
  await authClient.signOut();
}

export default function Page() {
  const params = useSearchParams();
  useEffect(() => {
    const fun = async () => {
      await storeScoreFunction(parseInt(params.get("score") ?? "0"));
    };
    fun();
  }, [params]);

  return <div>Hi</div>;
}
