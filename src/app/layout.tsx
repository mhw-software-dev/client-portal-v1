import type { Metadata } from "next";
import { Lato } from "next/font/google";
import { NavigationProgress } from "@/components/navigation-progress";
import "./globals.css";

const lato = Lato({
  display: "swap",
  variable: "--font-lato",
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MHW Client Portal",
  description: "Client portal proof of concept for MHW Live Music.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={lato.variable} data-scroll-behavior="smooth">
      <body>
        <NavigationProgress />
        {children}
      </body>
    </html>
  );
}
