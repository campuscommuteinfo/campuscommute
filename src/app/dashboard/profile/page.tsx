import Profile from '@/components/profile';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your profile, preferences, and account settings.',
};

export default function ProfilePage() {
  return <Profile />;
}
