import MyFreeRides from '@/components/my-free-rides';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Vouchers',
  description: 'View and use your redeemed ride vouchers.',
};

export default function MyRidesPage() {
  return <MyFreeRides />;
}
