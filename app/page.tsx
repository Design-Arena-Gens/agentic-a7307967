import PromptGenerator from "./components/PromptGenerator";

export default function Page() {
  return (
    <main>
      <div className="card">
        <div className="card-inner">
          <div className="section-title">How it works</div>
          <div style={{ height: 10 }} />
          <div className="kbd">
            Enter a topic. You will get: 1) Video concept, 2) Scene breakdown, 3) A clean, cinematic text-to-video prompt. Optional add-ons are available.
          </div>
        </div>
      </div>

      <div style={{ height: 16 }} />

      <PromptGenerator />
    </main>
  );
}
