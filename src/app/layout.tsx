import "./globals.css";
import Navbar from "@/components/Navbar/navbar.client";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
