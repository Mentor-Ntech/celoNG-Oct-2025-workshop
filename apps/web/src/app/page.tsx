import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserBalance } from "@/components/user-balance";
import { TipForm } from "@/components/tip-form";
import { MemoList } from "@/components/memo-list";
import { Zap } from "lucide-react";

export default function Home() {
  return (
<main className="flex-1">
  {/* Hero Section */}
  <section className="relative py-10">
    <div className="container px-4 mx-auto max-w-7xl">
      {/* <div className="text-center max-w-4xl mx-auto"> */}
       

        {/* <div className="mt-8" /> */}
        <TipForm />
        <MemoList />
      {/* </div> */}
    </div>
  </section>

</main>
  );
}
