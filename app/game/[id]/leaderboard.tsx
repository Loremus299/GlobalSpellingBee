/* eslint-disable @next/next/no-img-element */
import { getLeaderboard } from "@/server";

export default async function Leaderboard() {
  const data = await getLeaderboard();
  return (
    <div className="mt-4">
      {data.map((item) => (
        <div key={item.id} className="flex w-[33.3vw] gap-2 items-center mt-1">
          <img
            src={item.image}
            alt="user image"
            className="w-8 rounded-full border-2"
          />
          <p className="mr-auto">{item.name}</p>
          <p>{item.score}</p>
        </div>
      ))}
    </div>
  );
}
