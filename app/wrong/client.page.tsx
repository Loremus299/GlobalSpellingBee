"use client";

import { useSearchParams } from "next/navigation";
import SaveScore from "./components/saveScore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home } from "lucide-react";

export default function ClientPage(props: {
  anondata?: { id: string };
  realdata?: { id: string };
}) {
  const params = useSearchParams();
  return (
    <main className="w-screen h-screen grid place-items-center">
      <div className="grid gap-4 max-w-md">
        <p>Your Answer is wrong :c</p>
        <p>The correct answer was: {params.get("answer")}</p>
        <SaveScore data={props} />
        <Link href={"/"} className="w-full">
          <Button variant={"neutral"} className="w-full">
            <Home />
            Go Back to Hive
          </Button>
        </Link>
      </div>
    </main>
  );
}
