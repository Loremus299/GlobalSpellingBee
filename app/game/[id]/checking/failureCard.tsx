"use client";
import { authClient } from "@/auth/auth-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function signIn(arg: { provider: string; score: string }) {
  await authClient.signIn.social({
    provider: arg.provider,
    callbackURL: `/game/congratulations?score=${arg.score}`,
  });
}

export default function FailureCard(props: { response: string }) {
  const info = JSON.parse(props.response);
  return (
    <div>
      <p>{info.correct}</p>
      <p>{info.score}</p>
      <p>Failed</p>
      <Button
        onClick={async () =>
          signIn({
            provider: "github",
            score: info.score as string,
          })
        }
      >
        Store score
      </Button>
      <Button>
        <Link href={"/"}>New Session</Link>
      </Button>
    </div>
  );
}
