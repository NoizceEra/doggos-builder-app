import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import ClientWalletProvider from "@/components/WalletProvider";
import Navigation from "@/components/Navigation";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pupsamigos - 420 Pups on Solana",
  description: "420 pups on the Solana blockchain. Build, collect, gamble, and achieve in the crypto trenches.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body>
        <ClientWalletProvider>
          <Navigation />
          {children}
        </ClientWalletProvider>
      </body>
    </html>
  );
}
