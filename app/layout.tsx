import type { Metadata } from "next";
import { Inter, Lexend, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProfileProvider } from "@/contexts/ProfileContext";
import ReactQueryProvider from "@/contexts/Providers";
import { Toaster } from "@/lib/toast";

const inter = Inter({
  variable:'--font-sans',
  subsets:['latin']
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "Vortuiz",
  description: "A Cloud Based Quiz System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", jakarta.variable, lexend.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col bg-slate-200">
        <ReactQueryProvider>
            <ProfileProvider>
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </ProfileProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
