import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";


import { ToastProvider } from "@/components/ui/Toast";
import Header from "@/components/Header";
import AuraAssistant from "@/components/AuraAssistant";
import AIStylist from "@/components/AIStylist";
import UserTracker from "@/components/UserTracker";
import StoreLoader from "@/components/StoreLoader";
import RefreshRedirect from "@/components/RefreshRedirect";
import ServiceBar from "@/components/ServiceBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HomeSync | Yapay Zeka Destekli Aydınlatma Platformu",
  description: "Geleceğin aydınlatma teknolojileri ve profesyonel montaj hizmeti bir arada.",
  keywords: ["akıllı aydınlatma", "home sync", "profesyonel montaj", "premium aydınlatma", "yapay zeka stilist"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <StoreLoader />
          <UserTracker />
          <RefreshRedirect />
          <ToastProvider>
            <ThemeProvider>
              <Header />
                  <ServiceBar />
                  {children}
                  <AuraAssistant />
                  <AIStylist />
            </ThemeProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
