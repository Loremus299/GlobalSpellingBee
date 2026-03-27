"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AudioLines } from "lucide-react";
import AnswerForm from "./components/check";
import ScoreBoard from "./components/scoreboard";

export default function ClientPage(props: {
  url: string;
  definition: string;
  score: number;
  id: string;
  map: {
    name: string;
    score: number;
    image: string | null;
  }[];
}) {
  return (
    <main className="w-screen h-screen flex p-4 gap-4 portrait:flex-col">
      <ScoreBoard score={props.score} map={props.map} />
      <div className="grid place-items-center w-full">
        <Card className="landscape:max-w-md bg-white portrait:w-full">
          <CardHeader>Score: {props.score}</CardHeader>
          <CardContent className="grid gap-4">
            <p>{props.definition}</p>
            <Button
              onClick={() => {
                const audio = document.createElement("audio");
                audio.src = props.url;
                audio.play();
              }}
            >
              <AudioLines />
            </Button>
            <AnswerForm id={props.id} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
