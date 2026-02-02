"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SuccessCard(props: { id: string }) {
  return (
    <div>
      <p>Success</p>
      <Link href={`/game/${props.id}`}>
        <Button>New Word</Button>
      </Link>
    </div>
  );
}
