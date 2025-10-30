"use client";

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { TIPJAR_ABI, TIPJAR_ADDRESS } from "@/lib/tipjar-abi";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function WithdrawPage() {
  const { address, isConnected } = useAccount();
  const client = usePublicClient();
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [balanceWei, setBalanceWei] = useState<bigint | null>(null);

  const { data: owner } = useReadContract({
    address: TIPJAR_ADDRESS || undefined,
    abi: TIPJAR_ABI,
    functionName: "owner",
  });

  const isOwner = useMemo(() => {
    if (!address || !owner) return false;
    return address.toLowerCase() === (owner as `0x${string}`).toLowerCase();
  }, [address, owner]);

  // Refresh contract balance on load and when tx changes
  useMemo(() => {
    (async () => {
      try {
        if (!client || !TIPJAR_ADDRESS) return;
        const bal = await client.getBalance({ address: TIPJAR_ADDRESS });
        setBalanceWei(bal);
      } catch {
        // ignore
      }
    })();
  }, [client, txHash]);

  const { writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash ?? undefined,
    });

  async function onWithdraw() {
    setError(null);
    setTxHash(null);
    try {
      const hash = await writeContractAsync({
        address: TIPJAR_ADDRESS,
        abi: TIPJAR_ABI,
        functionName: "withdrawTips",
      });
      setTxHash(hash);
    } catch (err: any) {
      setError(err?.shortMessage || err?.message || "Transaction failed");
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-12 shadow-sm">
      <CardHeader>
        <CardTitle>Withdraw Tips</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {!TIPJAR_ADDRESS && (
            <p className="text-sm text-amber-600">
              Set NEXT_PUBLIC_TIP_JAR_ADDRESS in your env.
            </p>
          )}

          <div className="rounded-md border p-4 flex items-center justify-between bg-muted/30">
            <div>
              <div className="text-sm text-muted-foreground">Contract</div>
              <div className="text-sm break-all">{TIPJAR_ADDRESS || "—"}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Balance</div>
              <div className="text-lg font-semibold">
                {balanceWei !== null
                  ? (Number(balanceWei) / 1e18).toFixed(2)
                  : "—"}{" "}
                CELO
              </div>
            </div>
          </div>

          {!isConnected ? (
            <p className="text-sm">Connect your wallet to continue.</p>
          ) : !isOwner ? (
            <p className="text-sm text-red-600">
              You are not the contract owner.
            </p>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={onWithdraw}
                disabled={isPending || balanceWei === null || balanceWei === 0n}
                className="w-full sm:w-auto"
              >
                {isPending ? "Withdrawing…" : "Withdraw All Tips"}
              </Button>
              {error && <p className="text-sm text-red-600">{error}</p>}
              {txHash && (
                <p className="text-sm">
                  Submitted. Tx{" "}
                  <a
                    className="underline"
                    href={`https://celoscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {txHash}
                  </a>
                </p>
              )}
              {isConfirming && (
                <p className="text-sm">Waiting for confirmation…</p>
              )}
              {isConfirmed && (
                <p className="text-sm text-green-600">Confirmed!</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
