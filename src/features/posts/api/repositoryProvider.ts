import type { PostRepository } from './postRepository'
import { localPostRepository } from './localPostRepository'

// Single seam for swapping the active data source. Today it returns the
// localStorage implementation; to switch to Flask/REST later, branch here on an
// env flag and return httpPostRepository instead — no UI/hook changes needed.
//
//   const useHttp = import.meta.env.VITE_USE_HTTP === 'true'
//   return useHttp ? httpPostRepository : localPostRepository

export function getPostRepository(): PostRepository {
  return localPostRepository
}
