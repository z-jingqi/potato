import useSWR from "swr";
import { Category } from "@potato/database-charts";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<Category[]>(
    "/api/categories",
    fetcher
  );

  return {
    categories: data,
    isLoading,
    isError: error,
    mutate,
  };
}
