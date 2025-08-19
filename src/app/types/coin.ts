export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;

  // Optional extra fields for details page
  ath?: number;
  ath_change_percentage?: number;
  ath_date?: string;
  circulating_supply?: number;
  total_supply?: number | null;
  max_supply?: number | null;
  last_updated?: string;
}
