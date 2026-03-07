"use client";
import { Button } from "@/components/ui/button";
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
    return <Button onClick={() => router.push(`/`)}>Save Score</Button>;
  }
}
