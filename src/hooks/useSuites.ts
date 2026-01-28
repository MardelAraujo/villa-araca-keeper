import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Suite {
  id: string;
  nome: string;
  status: string;
  cor_identificacao: string | null;
  created_at: string;
}

export function useSuites() {
  return useQuery({
    queryKey: ["suites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suites")
        .select("*")
        .order("nome");

      if (error) throw error;
      return data as Suite[];
    },
  });
}

export function useSuitesOcupadas() {
  return useQuery({
    queryKey: ["suites-ocupadas"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];

      // Busca suítes
      const { data: suites, error: suitesError } = await supabase
        .from("suites")
        .select("*")
        .order("nome");

      if (suitesError) throw suitesError;

      // Busca reservas ativas (em andamento ou confirmadas com check-in hoje ou antes e check-out depois de hoje)
      const { data: reservasAtivas, error: reservasError } = await supabase
        .from("reservas")
        .select("suite_id")
        .lte("data_checkin", today)
        .gte("data_checkout", today)
        .in("status", ["confirmada", "em_andamento"]);

      if (reservasError) throw reservasError;

      const suitesOcupadasIds = new Set(reservasAtivas?.map((r) => r.suite_id) || []);
      const totalSuites = suites?.length || 0;
      const ocupadas = suitesOcupadasIds.size;

      return {
        suites: suites as Suite[],
        suitesOcupadasIds,
        totalSuites,
        ocupadas,
        percentual: totalSuites > 0 ? Math.round((ocupadas / totalSuites) * 100) : 0,
      };
    },
  });
}
