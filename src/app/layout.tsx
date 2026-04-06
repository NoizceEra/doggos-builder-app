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
  title: "Doggos Builder - Mint Your NFT",
  description: "Create your ultimate Doggo NFT using our interactive dynamic builder. Choose backgrounds, skins, clothes, and more!",
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
