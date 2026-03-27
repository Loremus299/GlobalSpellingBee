import { auth } from "@/auth";
import ClientPage from "./client.page";
import { headers } from "next/headers";

export default async function Page() {
  const header = await headers();
  const session = await auth.api.getSession({ headers: header });

  if (session) {
    if (session.user.isAnonymous) {
      return <ClientPage anondata={{ id: session.user.id }} />;
    }
    return (
      <ClientPage
        realdata={{
          id: session.user.id,
        }}
      />
    );
  }
  return <ClientPage />;
}
