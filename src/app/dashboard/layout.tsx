import CommuteDashboard from '@/components/commute-dashboard';
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error-boundary";
import { OfflineBanner } from "@/components/offline-banner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: '%s | Commute Companion',
    default: 'Dashboard | Commute Companion',
  },
  description: 'AI-powered campus ride-pooling platform for students',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <OfflineBanner />
      <CommuteDashboard>
        {children}
        <Toaster />
      </CommuteDashboard>
    </ErrorBoundary>
  );
}
