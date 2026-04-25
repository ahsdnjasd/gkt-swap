// /Users/parthkaran/Documents/claude_projects/liquidswap/src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Syne, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';
import { Home as HomeIcon, Repeat, Droplets, BarChart2 } from 'lucide-react';
import RealtimeTicker from '@/components/RealtimeTicker';
import WalletConnect from '@/components/WalletConnect';
import { WalletProvider } from '@/context/WalletContext';

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'GKTSwap | DEX on Stellar',
  description: 'The fastest, most fluid DEX on Stellar Testnet. Swap XLM and GKT with ease.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${mono.variable}`}>
      <body className="bg-white text-foreground min-h-screen flex flex-col font-sans selection:bg-primary/20">
        <WalletProvider>
          <RealtimeTicker />
          
          {/* Top Navbar */}
          <header className="sticky top-[41px] z-50 glass-strong border-b border-green-100/50 px-6 py-4">
            <div className="max-w-[1400px] mx-auto flex justify-between items-center">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-2xl text-primary font-display font-black group-hover:drop-shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all">
                  ⬡ GKTSwap
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-8 glass px-8 py-2.5 rounded-2xl">
                {[
                  { name: 'Home', href: '/' },
                  { name: 'Swap', href: '/swap' },
                  { name: 'Liquidity', href: '/liquidity' },
                  { name: 'Pool', href: '/pool' },
                ].map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-sm font-display font-bold text-muted hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-4">
                <WalletConnect />
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-8 pb-32 md:pb-8">
            {children}
          </main>

          {/* Mobile Bottom Nav */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-strong border-t border-green-100/50 px-6 py-4 flex justify-between items-center z-[100]">
            <Link href="/" className="flex flex-col items-center gap-1 text-muted hover:text-primary transition-all">
              <HomeIcon size={20} />
              <span className="text-[10px] font-bold">Home</span>
            </Link>
            <Link href="/swap" className="flex flex-col items-center gap-1 text-muted hover:text-primary transition-all">
              <Repeat size={20} />
              <span className="text-[10px] font-bold">Swap</span>
            </Link>
            <Link href="/liquidity" className="flex flex-col items-center gap-1 text-muted hover:text-primary transition-all">
              <Droplets size={20} />
              <span className="text-[10px] font-bold">Liquidity</span>
            </Link>
            <Link href="/pool" className="flex flex-col items-center gap-1 text-muted hover:text-primary transition-all">
              <BarChart2 size={20} />
              <span className="text-[10px] font-bold">Pool</span>
            </Link>
          </nav>
        </WalletProvider>
      </body>
    </html>
  );
}
