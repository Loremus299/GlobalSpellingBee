/* eslint-disable @next/next/no-img-element */
export default function ClientLeaderboard(props: {
  board: {
    id: string;
    image: string | null;
    name: string | null;
    score: number;
  }[];
}) {
  return (
    <div>
      {props.board.map((item) => (
        <div key={item.id} className="flex gap-2 absolute left-8 top-8">
          <img
            src={item.image!}
            alt={item.name!}
            className="aspect-square h-8 rounded-full"
          />
          <p>{item.name}</p>
          <p>{item.score}</p>
        </div>
      ))}
    </div>
  );
}
