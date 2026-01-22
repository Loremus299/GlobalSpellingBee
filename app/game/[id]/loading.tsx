"use client";
import Lottie from "react-lottie";
import { loading } from "@/public/lottie/loading.json";

export default function Loading() {
  return (
    <div className="p-8 min-h-screen grid place-items-center">
      <div className="w-1/2 portrait:w-full">
        <Lottie
          options={{ loop: true, autoplay: true, animationData: loading }}
        ></Lottie>
      </div>
    </div>
  );
}
