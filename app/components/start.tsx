import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createGameSession } from "../actions";
import { Result } from "@/lib/result";
import { authClient } from "@/auth/auth-client";
import { useRouter } from "next/navigation";

export default function StartButton(props: { id?: string }) {
  const router = useRouter();
  return (
    <Button
      onClick={() => {
        toast.promise<Result<string, string>>(
          async () => {
            let id = props.id;

            if (typeof id == "undefined") {
              const session = await authClient.signIn.anonymous();
              id = session.data!.user.id;
            }

            return createGameSession(id);
          },
          {
            loading: props.id
              ? "Creating new session for you..."
              : "Let's get you started :3",
            success: (res) => {
              if (res.success) {
                router.push(`/game?id=${res.data}`);
              } else {
                return res.error;
              }
            },
            error: "Unknown Error",
          },
        );
      }}
    >
      Play Now
    </Button>
  );
}
