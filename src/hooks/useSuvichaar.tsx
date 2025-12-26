import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Suvichaar {
  id: string;
  content: string;
  author: string | null;
  created_at: string;
}

export const useSuvichaar = () => {
  return useQuery({
    queryKey: ["daily-suvichaar"],
    queryFn: async () => {
      // Get the day of the year to pick a stable suvichaar for the day
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);

      // Fetch all suvichaars and pick one based on dayOfYear
      const { data, error } = await supabase
        .from("suvichaars")
        .select("*");

      if (error) throw error;
      if (!data || data.length === 0) return null;

      const index = dayOfYear % data.length;
      return data[index] as Suvichaar;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
