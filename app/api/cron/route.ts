import { readdir, unlink } from "fs/promises";
import { NextResponse } from "next/server";
import z from "zod";

export async function POST(request: Request) {
  const schema = z.object({
    key: z.string(),
  });
  const parsedData = schema.safeParse(await request.json());
  if (parsedData.success) {
    if (parsedData.data.key == process.env.KEY!) {
      try {
        const files = await readdir("./", { withFileTypes: true });
        files.forEach(async (file) => {
          if (file.name.includes(".mp3")) {
            await unlink(file.name);
          }
        });
        return NextResponse.json(
          { info: "Deleted all files" },
          { status: 200 },
        );
      } catch (e) {
        return NextResponse.json({ error: e as string }, { status: 500 });
      }
    }
    return NextResponse.json({ error: "wrong key" }, { status: 403 });
  }
  return NextResponse.json({ error: "Failed in parsing" }, { status: 400 });
}
