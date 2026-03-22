import { DashboardAuthBoundary } from '@/shared/components/auth/DashboardAuthBoundary';
import { Header } from '@/widgets/header/Header';
import { Sidebar } from '@/widgets/sidebar/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <DashboardAuthBoundary>
      <div className="flex min-h-screen flex-col bg-background lg:flex-row">
        <Sidebar />
        <div className="flex min-h-0 flex-1 flex-col">
          <Header />
          <div className="flex-1 overflow-auto p-4 lg:p-8">{children}</div>
        </div>
      </div>
    </DashboardAuthBoundary>
  );
}
