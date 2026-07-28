import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import OrderClient from './OrderClient';
import { getMenuProducts } from '@/lib/menu';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Place an Order — Cakes, Brownies & Treats',
  description:
    'Order handmade cakes, brownies, cupcakes and treats from Desserty House Chennai. Choose your product, style, egg/eggless preference and delivery date.',
  alternates: { canonical: '/order' },
};

export default async function OrderPage() {
  const menu = await getMenuProducts();
  const productOptions = menu.map((p) => ({ id: p.id, name: p.name }));
  return (
    <>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Place an Order', href: '/order' }]} />
      <OrderClient productOptions={productOptions} />
    </>
  );
}
