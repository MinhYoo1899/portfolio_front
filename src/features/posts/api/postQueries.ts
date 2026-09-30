import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Post, PostInput } from '../types'
import type { User } from '../../auth/types'
import { getPostRepository } from './repositoryProvider'

// react-query hooks. Components consume only these (never the repository or
// localStorage directly). The list uses a single stable key so the whole
// collection is fetched once; filtering/sorting/paging is derived client-side.

export const postKeys = {
  all: ['posts'] as const,
  detail: (id: string) => ['post', id] as const,
}

export function usePosts() {
  return useQuery({
    queryKey: postKeys.all,
    queryFn: () => getPostRepository().list({}),
  })
}

export function usePost(id: string) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => getPostRepository().get(id),
    retry: false,
  })
}

export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ input, author }: { input: PostInput; author: User }) =>
      getPostRepository().create(input, author),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}

export function useUpdatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PostInput }) =>
      getPostRepository().update(id, input),
    onSuccess: (updated: Post) => {
      qc.invalidateQueries({ queryKey: postKeys.all })
      qc.invalidateQueries({ queryKey: postKeys.detail(updated.id) })
    },
  })
}

export function useDeletePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => getPostRepository().remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}

// View count is an explicit write. Deliberately does NOT invalidate any query —
// invalidating ['post', id] would refetch and could re-trigger increments; the
// session guard in the detail page ensures a single call per session anyway.
export function useIncrementViews() {
  return useMutation({
    mutationFn: (id: string) => getPostRepository().incrementViews(id),
  })
}
