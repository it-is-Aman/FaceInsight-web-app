import { type Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter, Geist, Geist_Mono } from 'next/font/google'
import "./globals.css";
import { PostHogProvider } from './providers'

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FaceInsight AI - Your Personal Skin Analysis Assistant",
  description: "AI-powered skin analysis and personalized skincare recommendations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body className={`${inter.className} min-h-screen flex flex-col`}>
          <PostHogProvider>
            <div className={`${geistMono.className} flex flex-col min-h-screen`}>
              <Header />
              <main className={`${geistSans.className} flex-grow`}>
                {children}
              </main>
              <Footer />
            </div>
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider >
  );
}