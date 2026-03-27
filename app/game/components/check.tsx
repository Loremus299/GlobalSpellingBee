import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Result } from "@/lib/result";
import { useRouter } from "next/navigation";
import { checkWord } from "../actions";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useEffect } from "react";

export default function AnswerForm(props: { id: string }) {
  useEffect(() => {
    const inp = document.querySelector("input")!;
    inp.value = "";
  }, []);
  const router = useRouter();
  return (
    <form
      className="flex gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const formdata = new FormData(e.currentTarget);
        toast.promise<
          Result<{ status: boolean; info: number | string }, string>
        >(
          checkWord({
            id: props.id,
            answer: formdata.get("answer")!.toString().toLowerCase().trim(),
          }),
          {
            loading: "Checking your answer....",
            success: (res) => {
              if (res.success) {
                if (res.data.status) {
                  router.push(`right?score=${res.data.info}&id=${props.id}`);
                } else {
                  router.push(`wrong?answer=${res.data.info}`);
                }
              } else {
                return res.error;
              }
            },
            error: "Unknown Error",
          },
        );
      }}
    >
      <Input name="answer" />
      <Button type="submit">
        <Send />
      </Button>
    </form>
  );
}
