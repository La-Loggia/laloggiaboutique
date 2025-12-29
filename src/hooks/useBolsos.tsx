import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Brand } from '@/data/products';
import type { Product, ProductVisibility } from './useProducts';

interface RawProduct {
  id: string;
  brand: Brand;
  image_url: string;
  is_active: boolean;
  campaign_id: string | null;
  created_at: string;
  display_order: number;
  visibility: ProductVisibility;
  category: 'ropa' | 'bolsos';
}

const mapProduct = (raw: RawProduct): Product => ({
  id: raw.id,
  brand: raw.brand,
  imageUrl: raw.image_url,
  isActive: raw.is_active,
  campaignId: raw.campaign_id,
  createdAt: new Date(raw.created_at),
  displayOrder: raw.display_order,
  visibility: raw.visibility,
  category: raw.category,
});

export type BolsoBrand = 'Replay' | 'RueMadam' | 'LolaCasademunt';

export const bolsoBrands: BolsoBrand[] = ['Replay', 'RueMadam', 'LolaCasademunt'];

export const useBolsosByBrand = (brand: BolsoBrand) => {
  return useQuery({
    queryKey: ['bolsos', 'brand', brand],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('brand', brand)
        .eq('is_active', true)
        .eq('category', 'bolsos')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return (data as RawProduct[]).map(mapProduct);
    },
  });
};

export const useAllBolsos = () => {
  return useQuery({
    queryKey: ['bolsos', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category', 'bolsos')
        .in('brand', bolsoBrands)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return (data as RawProduct[]).map(mapProduct);
    },
  });
};

export const useBolsosExcludingBrand = (excludeBrand: BolsoBrand, limit: number = 6) => {
  return useQuery({
    queryKey: ['bolsos', 'exclude', excludeBrand, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category', 'bolsos')
        .neq('brand', excludeBrand)
        .in('brand', bolsoBrands)
        .order('display_order', { ascending: true })
        .limit(limit);
      
      if (error) throw error;
      return (data as RawProduct[]).map(mapProduct);
    },
  });
};
