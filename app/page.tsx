import { auth } from "@/auth";
import { headers } from "next/headers";
import ClientPage from "./client.page";

export default async function Page() {
  const header = await headers();
  const session = await auth.api.getSession({ headers: header });

  if (session) {
    if (session.user.isAnonymous) {
      return (
        <ClientPage
          anondata={{ id: session.user.id, score: session.user.score }}
        />
      );
    }
    return (
      <ClientPage
        realdata={{
          id: session.user.id,
          score: session.user.score,
          name: session.user.name,
          image: session.user.image ?? "./anon.jpg",
        }}
      />
    );
  }
  return <ClientPage />;
}
