import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GeorgeAI',
  description: 'Send any request directly to GeorgeAI and get a live response.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#050505] text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
