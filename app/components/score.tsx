/* eslint-disable @next/next/no-img-element */
"use client";

export default function ScoreIndicator(props: {
  data: {
    anondata?: { id: string; score: number };
    realdata?: { id: string; score: number; name: string; image: string };
  };
}) {
  if (props.data.realdata) {
    return (
      <span className="flex justify-center items-center gap-2">
        <img
          src={props.data.realdata.image}
          alt="profile"
          className="w-8 h-8 rounded-full border-2"
        />
        {props.data.realdata.name}: {props.data.realdata.score}
      </span>
    );
  }
  if (props.data.anondata) {
    return <span>Score: {props.data.anondata.score}</span>;
  }

  return <span>Welcome new user :3</span>;
}
