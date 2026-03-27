import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";

export default async function Page() {
  return (
    <main className="w-screen h-screen grid place-items-center">
      <div className="grid gap-4">
        <p className="text-2xl">Congratulations :3</p>
        <Link href={"/"} className="w-full">
          <Button className="w-full">
            <Home />
            Continue from Hive
          </Button>
        </Link>
      </div>
    </main>
  );
}
