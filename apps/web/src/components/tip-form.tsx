"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { useMemo, useState } from "react";
import { TIPJAR_ABI, TIPJAR_ADDRESS } from "@/lib/tipjar-abi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TipForm() {
  const { isConnected } = useAccount();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
  });

  const amountWei = useMemo(() => {
    try {
      if (!amount) return null;
      const normalized = amount.trim();
      if (!/^(\d+)(\.\d{1,18})?$/.test(normalized)) return null;
      return parseEther(normalized as `${string}`);
    } catch {
      return null;
    }
  }, [amount]);

  const canSubmit = isConnected && !!TIPJAR_ADDRESS && !!amountWei && name.trim().length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setTxHash(null);

    if (!canSubmit || !amountWei) {
      setError("Please connect, enter your name and a valid amount.");
      return;
    }

    try {
      const hash = await writeContractAsync({
        address: TIPJAR_ADDRESS,
        abi: TIPJAR_ABI,
        functionName: "tip",
        args: [name.trim(), message.trim()],
        value: amountWei,
      });
      setTxHash(hash);
      setName("");
      setMessage("");
      setAmount("");
    } catch (err: any) {
      setError(err?.shortMessage || err?.message || "Transaction failed");
    }
  }

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Send a Tip</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Your name</label>
            <input
              className="w-full border rounded-md px-3 py-2 bg-background"
              placeholder="Satoshi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={64}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Message</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 bg-background"
              placeholder="Thanks for your work!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={280}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Amount (CELO)</label>
            <input
              className="w-full border rounded-md px-3 py-2 bg-background"
              placeholder="0.1"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">Up to 18 decimals. Example: 0.05</p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {txHash && (
            <p className="text-sm">
              Submitted. Tx: <a className="underline" href={`https://celoscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">{txHash}</a>
            </p>
          )}
          {isConfirming && <p className="text-sm">Waiting for confirmation…</p>}
          {isConfirmed && <p className="text-sm text-green-600">Confirmed!</p>}

          <div className="pt-2">
            <Button type="submit" disabled={!canSubmit || isPending}>
              {isPending ? "Sending…" : "Send Tip"}
            </Button>
          </div>
          {!TIPJAR_ADDRESS && (
            <p className="text-xs text-amber-600">Set NEXT_PUBLIC_TIPJAR_ADDRESS in your env.</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}


