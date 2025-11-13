export const metadata = {
  title: "Cinematic Prompt Builder",
  description: "Turn ideas into high-quality cinematic text-to-video prompts"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <div className="brand">
              <div className="logo" aria-hidden />
              <div className="title">Cinematic Prompt Builder</div>
            </div>
            <div className="kbd">Consistent visuals ? Short sentences ? Cinematic tone</div>
          </header>
          {children}
          <div className="footer">Built for fast prompt crafting. Deploy-ready on Vercel.</div>
        </div>
      </body>
    </html>
  );
}

import "./globals.css";
