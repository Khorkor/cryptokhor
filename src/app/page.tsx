import CoinsTable from '@/app/components/CoinsTable';
import StoreInitializer from '@/app/components/StoreInitializer';
import { getCoinsMarkets } from '@/app/lib/coinApi';
import { Coin } from '@/app/types/coin';

export default async function HomePage() {
  let initialCoins: Coin[] = [];

  try {
    initialCoins = await getCoinsMarkets(1, 250);
  } catch (error) {
    console.warn("Failed to fetch initial coins on server:", error);
  }

  return (
    <>
      <StoreInitializer initialCoins={initialCoins} />
      <CoinsTable />
    </>
  );
}
