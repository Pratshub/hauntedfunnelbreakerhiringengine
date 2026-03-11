import "./globals.css";

export const metadata = {
  title: "Haunted Funnel Breaker",
  description: "AI job search intelligence engine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
