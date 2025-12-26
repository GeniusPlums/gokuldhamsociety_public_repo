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

      // Fetch all suvichaars
      const { data, error } = await supabase
        .from("suvichaars")
        .select("*");

      // AI Fallback List (in case database is empty or connection fails)
      const aiFallbacks: Suvichaar[] = [
        {
          id: "fallback-1",
          content: "Progress is impossible without change, and those who cannot change their minds cannot change anything.",
          author: "AI Wisdom",
          created_at: new Date().toISOString()
        },
        {
          id: "fallback-2",
          content: "The only way to do great work is to love what you do.",
          author: "AI Wisdom",
          created_at: new Date().toISOString()
        },
        {
          id: "fallback-3",
          content: "Unity in diversity is our strength, just like in Gokuldham.",
          author: "AI Wisdom",
          created_at: new Date().toISOString()
        }
      ];

      if (error || !data || data.length === 0) {
        console.warn("Suvichaar fetch failed, using AI fallback");
        return aiFallbacks[dayOfYear % aiFallbacks.length];
      }

      const index = dayOfYear % data.length;
      return data[index] as Suvichaar;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
