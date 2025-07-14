import "./globals.css";
import Navbar from "@/components/Navbar/navbar.client";
import { Metadata } from "next";

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
        <Navbar />
        <main className="pt-[98px]">{children}</main>
      </body>
    </html>
  );
}
