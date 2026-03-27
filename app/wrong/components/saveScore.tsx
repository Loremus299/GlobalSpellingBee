"use client";
import { authClient } from "@/auth/auth-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Discord } from "@/public/svgl/discord";
import { GitHub } from "@/public/svgl/github";
import { Google } from "@/public/svgl/google";
import { toast } from "sonner";
import { updateScore } from "../actions";
import { useRouter } from "next/navigation";

export default function SaveScore(props: {
  data: {
    anondata?: { id: string };
    realdata?: { id: string };
  };
}) {
  const router = useRouter();
  if (props.data.anondata) {
    return (
      <Dialog>
        <DialogTrigger>
          <Button className="w-full">Login & Compete</Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogTitle>Save Your Score</DialogTitle>
          <DialogDescription className="grid gap-4">
            <Button
              onClick={() =>
                authClient.signIn.social({
                  provider: "google",
                  callbackURL: "/congratulations",
                })
              }
            >
              <Google />
              Google
            </Button>
            <Button
              onClick={() =>
                authClient.signIn.social({
                  provider: "discord",
                  callbackURL: "/congratulations",
                })
              }
            >
              <Discord />
              Discord
            </Button>
            <Button
              onClick={() =>
                authClient.signIn.social({
                  provider: "github",
                  callbackURL: "/congratulations",
                })
              }
            >
              <GitHub />
              Github
            </Button>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );
  }
  if (props.data.realdata) {
    return (
      <Button
        className="w-full"
        onClick={() => {
          toast.promise(updateScore(props.data.realdata!.id), {
            loading: "Updating your score.",
            success: () => {
              router.push("/congratulations");
              return "";
            },
            error: "Unknown Error",
          });
        }}
      >
        Save Your Score
      </Button>
    );
  }

  return <Button>A button for fun</Button>;
}
