import SafetyShield from '@/components/safety-shield';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Safety',
  description: 'Emergency SOS, trip sharing, and emergency contacts for safe commuting.',
};

export default function SafetyPage() {
  return <SafetyShield />;
}
