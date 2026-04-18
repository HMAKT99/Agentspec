import { BeforeAfter } from "@/components/before-after";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { TerminalDemo } from "@/components/terminal-demo";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-6 pb-32">
        <Hero />
        <TerminalDemo />
        <BeforeAfter />
        <Features />
      </main>
      <Footer />
    </>
  );
}
