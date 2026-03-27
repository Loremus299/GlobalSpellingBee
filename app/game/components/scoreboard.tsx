/* eslint-disable @next/next/no-img-element */
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";

export default function ScoreBoard(props: {
  map: {
    name: string;
    score: number;
    image: string | null;
  }[];
  score: number;
}) {
  useEffect(() => {
    const x = document.getElementById("Current Session");
    x?.scrollIntoView({ block: "center" });
  }, []);
  return (
    <Card className="bg-white w-full landscape:max-w-sm overflow-y-scroll portrait:h-56">
      <CardHeader className="border-b-2 border-black">
        <CardTitle>Scoreboard</CardTitle>
      </CardHeader>
      <CardContent>
        {props.map.map((item, index) => (
          <div
            key={index}
            className="flex gap-2 items-center w-full p-2"
            id={item.name}
          >
            <img
              src={item.image ?? "anon.jpg"}
              className="w-8 h-8 rounded-full border-2"
              alt={item.name}
            />
            <p>{item.name}</p>
            <p className="ml-auto">{item.score}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
