"use client";
import { updateLeaderboard } from "@/server";
import { useEffect } from "react";

export default function InvalidateLeaderboard() {
  useEffect(() => {
    const x = async () => {
      await updateLeaderboard();
    };
    x();
  }, []);

  return <></>;
}
