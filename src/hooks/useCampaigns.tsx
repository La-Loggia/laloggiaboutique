import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Campaign {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
}

interface RawCampaign {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

const mapCampaign = (raw: RawCampaign): Campaign => ({
  id: raw.id,
  name: raw.name,
  isActive: raw.is_active,
  createdAt: new Date(raw.created_at),
});

export const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data as RawCampaign[]).map(mapCampaign);
    },
  });
};

export const useActiveCampaign = () => {
  return useQuery({
    queryKey: ['campaigns', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      return data ? mapCampaign(data as RawCampaign) : null;
    },
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('campaigns')
        .insert({ name })
        .select()
        .single();
      
      if (error) throw error;
      return mapCampaign(data as RawCampaign);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useSetActiveCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (campaignId: string) => {
      // First, deactivate all campaigns
      await supabase
        .from('campaigns')
        .update({ is_active: false })
        .neq('id', 'placeholder');
      
      // Then activate the selected one
      const { error } = await supabase
        .from('campaigns')
        .update({ is_active: true })
        .eq('id', campaignId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};
