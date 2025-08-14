import CoinsTable from '@/app/components/CoinsTable';
import StoreInitializer from '@/app/components/StoreInitializer';
import { getCoinsMarkets } from '@/app/lib/coinApi';

export default async function HomePage() {
  const initialCoins = await getCoinsMarkets(1, 250);

  return (
    <>
      <StoreInitializer initialCoins={initialCoins} />
      <CoinsTable />
    </>
  );
}
