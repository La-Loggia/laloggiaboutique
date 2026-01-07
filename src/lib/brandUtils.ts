import { Brand } from '@/data/products';

/**
 * Maps internal brand enum values to display-friendly names
 * e.g., "SaintTropez" → "Saint Tropez"
 */
export const brandDisplayNames: Record<Brand, string> = {
  'MOOR': 'MOOR',
  'SaintTropez': 'Saint Tropez',
  'DiLei': 'DiLei',
  'Mela': 'Mela',
  'Pecatto': 'Pecatto',
  'Dixie': 'Dixie',
  'Replay': 'Replay',
  'RueMadam': 'Rue Madam',
  'JOTT': 'JOTT',
  'LolaCasademunt': 'Lola Casademunt',
  'Vicolo': 'Vicolo',
};

/**
 * Get the display name for a brand
 */
export const getBrandDisplayName = (brand: Brand | string): string => {
  return brandDisplayNames[brand as Brand] || brand;
};
