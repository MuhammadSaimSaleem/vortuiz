import { Sidebar } from "../../components/ui/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="flex-none w-fit">
        <Sidebar />
      </div>
      <div className="grow md:overflow-y-auto">{children}</div>
    </div>
  );
}
