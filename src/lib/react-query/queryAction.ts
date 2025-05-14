import { useQuery, useMutation } from '@tanstack/react-query'
import queryKeys from './queryKeys'

export const useExampleQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [queryKeys.queryKey1, params],
    queryFn: () => {
      // handle query
    }
  })
}

export const useExampleMutation = () => {
  return useMutation({
    mutationFn: (params: Record<string, string>) => {
      // handle mutation
      console.log({ params })
      return Promise.resolve()
    }
  })
}
