import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

import { getSeoMetadata } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata('/');
  const baseTitle = seo?.title?.trim() || 'HippoClouds';
  
  return {
    title: {
      template: `%s | ${baseTitle}`,
      default: baseTitle,
    },
    description: seo?.description || 'Enterprise Cloud & AI Solutions',
    keywords: seo?.keywords || 'cloud, enterprise, software, ai',
  };
}

import ScrollToHash from "@/components/ScrollToHash";
import GlobalChat from "@/components/GlobalChat";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col font-sans overflow-x-hidden">
        <ScrollToHash />
        {children}
        <GlobalChat />
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

