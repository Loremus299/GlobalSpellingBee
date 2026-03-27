"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const params = useSearchParams();
  return (
    <main className="h-screen w-screen grid place-items-center p-4">
      <div className="grid gap-4">
        {params.get("data")}
        <Link href={"/"} className="w-full">
          <Button className="w-full">Go Back</Button>
        </Link>
      </div>
    </main>
  );
}
