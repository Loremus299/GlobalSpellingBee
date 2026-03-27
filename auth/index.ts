import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { nextCookies } from "better-auth/next-js";
import { schema, user } from "@/db/schema";
import { anonymous } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  user: {
    additionalFields: {
      score: {
        defaultValue: 0,
        required: true,
        type: "number",
        input: false,
      },
    },
  },
  plugins: [
    nextCookies(),
    anonymous({
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        const score = (
          await db
            .select({ score: user.score })
            .from(user)
            .where(eq(user.id, anonymousUser.user.id))
        )[0].score;
        await db
          .update(user)
          .set({ score: score })
          .where(eq(user.id, newUser.user.id));
        revalidateTag("scoreboard", "max");
      },
    }),
  ],
});
