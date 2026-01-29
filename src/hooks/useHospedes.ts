import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Hospede {
  id: string;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  pais: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export const useHospedes = () => {
  return useQuery({
    queryKey: ['hospedes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hospedes')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      return data as Hospede[];
    },
  });
};

export const useHospede = (id: string | undefined) => {
  return useQuery({
    queryKey: ['hospede', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('hospedes')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Hospede | null;
    },
    enabled: !!id,
  });
};
