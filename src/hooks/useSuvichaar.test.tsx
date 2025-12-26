import { renderHook, waitFor } from "@testing-library/react";
import { useSuvichaar } from "./useSuvichaar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("useSuvichaar", () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it("returns fallback suvichaar when database is empty", async () => {
    const { result } = renderHook(() => useSuvichaar(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.author).toBe("AI Wisdom");
  });

  it("returns suvichaar from database when available", async () => {
    const mockSuvichaar = {
      id: "1",
      content: "Database Wisdom",
      author: "Champaklal",
      created_at: new Date().toISOString(),
    };

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [mockSuvichaar], error: null }),
    });

    const { result } = renderHook(() => useSuvichaar(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.content).toBe("Database Wisdom");
    expect(result.current.data?.author).toBe("Champaklal");
  });
});
