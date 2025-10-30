import { TipForm } from "@/components/tip-form";
import { TipList } from "@/components/tip-list";

export default function Home() {
  return (
    <main className="flex-1">
      <section className="relative py-10">
        <div className="container px-4 mx-auto max-w-7xl">
          <TipForm />
          <TipList />
        </div>
      </section>
    </main>
  );
}
