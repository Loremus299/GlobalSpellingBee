"use client";
import { authClient } from "@/auth/auth-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Client(props: { id: string; answerRight: boolean }) {
  const router = useRouter();
  useEffect(() => {
    localStorage.removeItem("audioURL");
  }, []);
  if (props.answerRight) {
    return (
      <Button onClick={() => router.push(`/${props.id}/game`)}>
        Next Question
      </Button>
    );
  } else {
    return (
      <Dialog>
        <DialogTrigger className="p-3 bg-primary rounded-full">
          Store Score
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save your Score</DialogTitle>
            <DialogDescription>
              <Button
                className="w-full"
                onClick={() => {
                  authClient.signIn.social({
                    provider: "github",
                    callbackURL: `/${props.id}/congratulations`,
                  });
                }}
              >
                Github
              </Button>
              <Button
                className="w-full"
                onClick={() => {
                  authClient.signIn.social({
                    provider: "discord",
                    callbackURL: `/${props.id}/congratulations`,
                  });
                }}
              >
                Discord
              </Button>
              <Button
                className="w-full"
                onClick={() => {
                  authClient.signIn.social({
                    provider: "google",
                    callbackURL: `/${props.id}/congratulations`,
                  });
                }}
              >
                Google
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }
}
