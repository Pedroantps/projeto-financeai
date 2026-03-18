import Sidebar from "./sidebar";
import UserMenu from "../usermenu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Menu Lateral Fixo */}
      <Sidebar />

      {/* Área de Conteúdo */}
      <div className="flex-1 flex flex-col">
        {/* Header Superior Interno */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-end px-8 sticky top-0 z-40">
          <UserMenu />
        </header>

        {/* O conteúdo da página (Dashboard ou Bancos) cai aqui dentro */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}