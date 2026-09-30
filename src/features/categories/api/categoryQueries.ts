import { useQuery } from '@tanstack/react-query'
import { CATEGORIES } from '../categories'

// Categories are a fixed constant today; the query wrapper keeps the access
// pattern uniform with posts and ready for a future GET /api/categories.
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => CATEGORIES,
  })
}
