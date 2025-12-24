import Rewards from '@/components/rewards';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rewards',
  description: 'Earn points and redeem rewards like ride vouchers, gift cards, and more.',
};

export default function RewardsPage() {
  return <Rewards />;
}
