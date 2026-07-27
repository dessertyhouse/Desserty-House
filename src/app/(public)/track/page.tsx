import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import TrackClient from './TrackClient';

export const metadata: Metadata = {
  title: 'Track Your Order',
  description:
    'Track your Desserty House order status. Enter your order ID (DH-YYYY-XXXXXX) and WhatsApp number to see the latest update.',
  alternates: { canonical: '/track' },
};

export default function TrackPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Track Order', href: '/track' }]} />
      <TrackClient />
    </>
  );
}
