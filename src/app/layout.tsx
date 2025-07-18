import "./globals.css";
import Navbar from "@/components/Navbar/navbar.client";
import AuthProvider from "@/providers/AuthProvider";
import { Metadata } from "next";
import AppInitializer from "@/components/Appinitializer";

export const metadata: Metadata = {
  title: "오르락내리락",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <AppInitializer />
          <Navbar />
          <main className="pt-[98px]">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
