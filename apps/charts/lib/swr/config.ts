import { SWRConfiguration } from "swr";
import { fetcher } from "./fetcher";

/**
 * Global SWR configuration
 * Applied to all useSWR hooks via SWRConfig provider
 */
export const swrConfig: SWRConfiguration = {
  // Default fetcher for all useSWR hooks
  fetcher,

  // Revalidate on focus
  revalidateOnFocus: true,

  // Revalidate on network reconnect
  revalidateOnReconnect: true,

  // Retry on error
  shouldRetryOnError: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,

  // Dedupe requests within 2 seconds
  dedupingInterval: 2000,

  // Keep data fresh
  revalidateIfStale: true,

  // Focus throttle
  focusThrottleInterval: 5000,

  // Error handling
  onError: (error, key) => {
    console.error(`SWR Error for ${key}:`, error);
    // You can add error tracking here (e.g., Sentry)
  },

  // Success handling
  onSuccess: (data, key) => {
    // You can add analytics here
    // console.log(`SWR Success for ${key}`);
  },
};
