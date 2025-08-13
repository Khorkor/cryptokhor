import CoinsTable from '@/app/components/CoinsTable';
import { getCoinsMarkets } from '@/app/lib/coinApi';
import StoreInitializer from '@/app/components/StoreInitializer';

export default async function HomePage() {
  const initialCoins = await getCoinsMarkets(1, 250);
  
  return (
    <>
      <StoreInitializer initialCoins={initialCoins} />
      <CoinsTable />
    </>
  );
}