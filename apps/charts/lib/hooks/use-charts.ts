import useSWR from "swr";
import { Chart } from "@potato/database-charts";
import { ChartWithData } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCharts() {
  const { data, error, isLoading, mutate } = useSWR<Chart[]>(
    "/api/charts",
    fetcher
  );

  return {
    charts: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useChart(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<ChartWithData>(
    id ? `/api/charts/${id}` : null,
    fetcher
  );

  return {
    chart: data,
    isLoading,
    isError: error,
    mutate,
  };
}
