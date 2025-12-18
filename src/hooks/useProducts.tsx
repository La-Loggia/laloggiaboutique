import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Brand } from '@/data/products';

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  displayOrder: number;
}

export interface Product {
  id: string;
  brand: Brand;
  imageUrl: string;
  isActive: boolean;
  campaignId: string | null;
  createdAt: Date;
  displayOrder: number;
  additionalImages?: ProductImage[];
}

interface RawProduct {
  id: string;
  brand: 'MOOR' | 'SaintTropez' | 'DiLei' | 'Mela' | 'Pecatto';
  image_url: string;
  is_active: boolean;
  campaign_id: string | null;
  created_at: string;
  display_order: number;
}

const mapProduct = (raw: RawProduct): Product => ({
  id: raw.id,
  brand: raw.brand,
  imageUrl: raw.image_url,
  isActive: raw.is_active,
  campaignId: raw.campaign_id,
  createdAt: new Date(raw.created_at),
  displayOrder: raw.display_order,
});

const mapProductImage = (raw: { id: string; product_id: string; image_url: string; display_order: number }): ProductImage => ({
  id: raw.id,
  productId: raw.product_id,
  imageUrl: raw.image_url,
  displayOrder: raw.display_order,
});

export const useProductImages = (productId: string) => {
  return useQuery({
    queryKey: ['product-images', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data.map(mapProductImage);
    },
    enabled: !!productId,
  });
};

export const useLatestProducts = (limit?: number) => {
  return useQuery({
    queryKey: ['products', 'latest', limit],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data as RawProduct[]).map(mapProduct);
    },
  });
};

export const useProductsByBrand = (brand: Brand) => {
  return useQuery({
    queryKey: ['products', 'brand', brand],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('brand', brand)
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return (data as RawProduct[]).map(mapProduct);
    },
  });
};

export const useAllProducts = () => {
  return useQuery({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return (data as RawProduct[]).map(mapProduct);
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ brand, imageUrl, campaignId }: { brand: Brand; imageUrl: string; campaignId?: string }) => {
      // First, increment display_order of all existing products to make room for the new one at position 0
      await supabase.rpc('increment_all_product_orders' as any);
      
      // Then insert the new product with display_order = 0 (first position)
      const { data, error } = await supabase
        .from('products')
        .insert({
          brand,
          image_url: imageUrl,
          campaign_id: campaignId || null,
          display_order: 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      return mapProduct(data as RawProduct);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, isActive, brand, campaignId, imageUrl }: { id: string; isActive?: boolean; brand?: Brand; campaignId?: string | null; imageUrl?: string }) => {
      const updates: Record<string, unknown> = {};
      if (isActive !== undefined) updates.is_active = isActive;
      if (brand !== undefined) updates.brand = brand;
      if (campaignId !== undefined) updates.campaign_id = campaignId;
      if (imageUrl !== undefined) updates.image_url = imageUrl;
      
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUploadImage = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      
      return data.publicUrl;
    },
  });
};

export const useAddProductImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, imageUrl, displayOrder }: { productId: string; imageUrl: string; displayOrder?: number }) => {
      const { data, error } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          image_url: imageUrl,
          display_order: displayOrder ?? 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      return mapProductImage(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-images', variables.productId] });
    },
  });
};

export const useDeleteProductImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ imageId, productId }: { imageId: string; productId: string }) => {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);
      
      if (error) throw error;
      return productId;
    },
    onSuccess: (productId) => {
      queryClient.invalidateQueries({ queryKey: ['product-images', productId] });
    },
  });
};

export const useUpdateProductImageOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ images, productId }: { images: { id: string; displayOrder: number }[]; productId: string }) => {
      const updates = images.map(img => 
        supabase
          .from('product_images')
          .update({ display_order: img.displayOrder })
          .eq('id', img.id)
      );
      
      await Promise.all(updates);
      return productId;
    },
    onSuccess: (productId) => {
      queryClient.invalidateQueries({ queryKey: ['product-images', productId] });
    },
  });
};

export const useUpdateProductOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (products: { id: string; displayOrder: number }[]) => {
      const updates = products.map(p => 
        supabase
          .from('products')
          .update({ display_order: p.displayOrder })
          .eq('id', p.id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
