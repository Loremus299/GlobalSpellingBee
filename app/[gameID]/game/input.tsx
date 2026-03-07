"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserInput(props: {
  audio: string | undefined;
  score: number;
  id: string;
}) {
  const router = useRouter();
  const [audioURL, setAudio] = useState("");
  useEffect(() => {
    if (props.audio) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAudio(props.audio);
      localStorage.setItem("audioURL", props.audio);
    } else {
      setAudio(localStorage.getItem("audioURL")!);
    }
  }, [props.audio]);

  return (
    <div className="grid gap-2">
      <div className="flex gap-2">
        <p>Score</p>
        <p>{props.score}</p>
      </div>
      <Button
        onClick={() => {
          const audio = document.createElement("audio");
          audio.src = audioURL;
          audio.play();
        }}
      >
        PLAY AUDIO
      </Button>
      <Input
        className="border-0 border-b-2 rounded-none border-main"
        onKeyDown={(e) => {
          if (e.key == "Enter") {
            router.push(
              `/${props.id}/check?word=${e.currentTarget.value.toLowerCase()}`,
            );
          }
        }}
      />
    </div>
  );
}
