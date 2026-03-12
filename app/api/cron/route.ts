import { db } from "@/db";
import { gameSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const body: { key: string } = await req.json();
  if (body.key == process.env.KEY!) {
    console.info("Running cron job - to remove old sessions");
    const sessions = await db
      .select({ date: gameSessions.lastUsed, id: gameSessions.id })
      .from(gameSessions);
    sessions.forEach((session) => {
      const date = new Date();

      if (session.date.getMonth() - date.getMonth() >= 1) {
        db.delete(gameSessions).where(eq(gameSessions.id, session.id));
      }
    });
    console.info("Completed cron job - to remove old sessions");
    return new Response("Request executed successfully");
  } else {
    return new Response("Invalid Request");
  }
}
