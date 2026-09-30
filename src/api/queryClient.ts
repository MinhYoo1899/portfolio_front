import { QueryClient } from '@tanstack/react-query'

// Local data source: cache never goes stale on its own; freshness is driven
// only by explicit mutation invalidation. retry:0 since local reads don't flake.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retry: 0,
      refetchOnWindowFocus: false,
    },
  },
})
