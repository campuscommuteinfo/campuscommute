import CommuteDashboard from '@/components/commute-dashboard';
import { Toaster } from "@/components/ui/toaster";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CommuteDashboard>
      {children}
      <Toaster />
    </CommuteDashboard>
  );
}
