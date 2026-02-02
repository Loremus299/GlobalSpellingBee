"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Card(props: {
  blob: Blob | undefined;
  id: string;
  score: undefined | number;
}) {
  const [url, setURL] = useState("");
  const inp = useRef<HTMLInputElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (props.blob == undefined) {
      const blob64string = sessionStorage.getItem("blob");
      if (!blob64string) {
        console.log("error");
      }
      const byteString = atob(blob64string!);
      const ab = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        ab[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: "audio/mpeg" });
      const nurl = URL.createObjectURL(blob);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setURL(nurl);
    } else {
      const reader = new FileReader();
      reader.readAsDataURL(props.blob);
      reader.onloadend = function () {
        const base64data = reader.result?.toString();
        const base64 = base64data?.split(",")[1];
        sessionStorage.setItem("blob", base64!);
        const nurl = URL.createObjectURL(props.blob!);
        setURL(nurl);
      };
    }
  }, [props.blob]);

  const playAudio = () => {
    const audio = document.createElement("audio");
    audio.src = url;
    audio.play();
  };

  const submitAnswer = () => {
    if (inp) {
      if (inp.current?.value !== "") {
        router.replace(
          `/game/${props.id}/checking?answer=${encodeURIComponent(inp.current?.value as string)}`,
        );
      }
    }
  };

  return (
    <div className="w-1/3 portrait:w-full grid gap-2  p-4 rounded-2xl border-[#502d16] border-2">
      <p>{props.score}</p>
      <Button className="rounded-full h-30 w-30" onClick={playAudio}>
        Play Audio
      </Button>
      <Input
        className="w-full border-2 border-[#502d16]"
        placeholder="your answer...."
        ref={inp}
      />
      <Button className="w-full" onClick={submitAnswer}>
        Submit your answer
      </Button>
    </div>
  );
}
