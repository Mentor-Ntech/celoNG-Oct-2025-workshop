"use client";

import { useEffect, useMemo, useState } from "react";
import { usePublicClient, useWatchBlocks } from "wagmi";
import { TIPJAR_ABI, TIPJAR_ADDRESS } from "@/lib/tipjar-abi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReadContractReturnType } from "viem";

type Tip = {
  from: `0x${string}`;
  timestamp: bigint;
  name: string;
  amount: bigint;
  message: string;
};

export function TipList() {
  const client = usePublicClient();
  const [tips, setTips] = useState<Tip[]>([]);
  const hasAddress = !!TIPJAR_ADDRESS;

  async function refresh() {
    if (!client || !hasAddress) return;
    try {
      const result: ReadContractReturnType<typeof TIPJAR_ABI, "getTips"> =
        await client.readContract({
          address: TIPJAR_ADDRESS,
          abi: TIPJAR_ABI,
          functionName: "getTips",
          args: [],
        });
      const mapped: Tip[] = result.map((m) => ({
        from: m.from,
        timestamp: m.timestamp,
        name: m.name,
        amount: m.amount,
        message: m.message,
      }));
      setTips(mapped);
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, hasAddress]);

  useWatchBlocks({
    onBlock: () => refresh(),
  });

  const items = useMemo(() => tips.slice(-2).reverse(), [tips]);

  return (
    <Card className="w-full max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Recent Tips</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasAddress && (
          <p className="text-sm text-amber-600">
            Set NEXT_PUBLIC_TIP_JAR_ADDRESS in your env.
          </p>
        )}
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tips yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((m, idx) => {
              const initial = (m.name?.trim?.() || "A").charAt(0).toUpperCase();
              const amountCelo = Number(m.amount) / 1e18;
              return (
                <div key={idx} className="border rounded-md p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                        {initial}
                      </div>
                      <span className="font-medium truncate">
                        {m.name || "Anon"}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-muted">
                      {amountCelo} CELO
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(Number(m.timestamp) * 1000).toLocaleString()}
                  </div>
                  <div className="text-sm mt-2 break-words line-clamp-3">
                    {m.message}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 break-all">
                    From: {m.from}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
