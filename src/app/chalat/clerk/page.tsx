"use client";
import { ChalatShell } from "@/components/chalat/ChalatShell";
import { useChalatStore } from "@/store/chalat-store";
import { useEffect } from "react";

export default function ClerkPage() {
  const setMode = useChalatStore((s) => s.setMode);
  useEffect(() => { setMode("clerk"); }, [setMode]);
  return <ChalatShell forceMode="clerk" />;
}
